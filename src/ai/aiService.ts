import { PET_SYSTEM_PROMPT } from './aiPrompts';
import { taskService } from '../tasks/taskService';
import { Task } from '../types';

// ─── Offline fallback responses ───────────────────────────────────────────────
const FALLBACK_RESPONSES = [
  "Meow! 🐱 I'm right here with you! Let's conquer your tasks today 🐾",
  "You're doing great! Check your task list to see what's up next ✨",
  "Remember to take short breaks while working hard! ☕",
  "Need help organizing? Try adding a deadline to stay on track!",
  "Purring with productivity vibes~ you've got this! 🐾",
  "Every big goal starts with a single task. What's on your list today?",
];

// ─── Provider detection ───────────────────────────────────────────────────────
function detectProvider(apiKey: string): 'openai' | 'gemini' | 'unknown' {
  if (!apiKey || !apiKey.trim()) return 'unknown';
  if (apiKey.startsWith('sk-')) return 'openai';
  if (apiKey.startsWith('AIza')) return 'gemini';
  return 'openai'; // default assumption
}

// ─── OpenAI request ──────────────────────────────────────────────────────────
async function callOpenAI(userInput: string, apiKey: string, model: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: PET_SYSTEM_PROMPT },
        { role: 'user', content: userInput },
      ],
      temperature: 0.75,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`OpenAI error ${response.status}: ${(err as any)?.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content;
  if (!reply) throw new Error('OpenAI returned empty content');
  return reply;
}

// ─── Gemini request ──────────────────────────────────────────────────────────
async function callGemini(userInput: string, apiKey: string, model: string): Promise<string> {
  // Default to gemini-1.5-flash if no specific model set
  const geminiModel = (model && !model.startsWith('gpt')) ? model : 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: PET_SYSTEM_PROMPT }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userInput }],
        },
      ],
      generationConfig: {
        temperature: 0.75,
        maxOutputTokens: 300,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Gemini error ${response.status}: ${(err as any)?.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!reply) throw new Error('Gemini returned empty content');
  return reply;
}

// ─── Main AI Service ─────────────────────────────────────────────────────────
export class AiService {
  /**
   * Parse natural language task description into structured Task fields.
   */
  public async parseNaturalLanguageTask(text: string): Promise<Partial<Task>> {
    let title = text;
    let deadlineIso: string | undefined = undefined;
    let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM';

    const lower = text.toLowerCase();

    // Priority detection
    if (lower.includes('urgent') || lower.includes('asap') || lower.includes('immediately')) {
      priority = 'URGENT';
    } else if (lower.includes('high priority') || lower.includes('important')) {
      priority = 'HIGH';
    } else if (lower.includes('low priority') || lower.includes('whenever')) {
      priority = 'LOW';
    }

    // Deadline detection
    const now = new Date();
    if (lower.includes('tomorrow')) {
      const d = new Date(now);
      d.setDate(d.getDate() + 1);
      d.setHours(lower.includes('morning') ? 9 : lower.includes('night') ? 23 : 18, 0, 0, 0);
      deadlineIso = d.toISOString();
    } else if (lower.includes('tonight') || lower.includes('today')) {
      const d = new Date(now);
      d.setHours(23, 59, 0, 0);
      deadlineIso = d.toISOString();
    } else if (lower.includes('next week')) {
      const d = new Date(now);
      d.setDate(d.getDate() + 7);
      deadlineIso = d.toISOString();
    } else if (lower.includes('next month')) {
      const d = new Date(now);
      d.setMonth(d.getMonth() + 1);
      deadlineIso = d.toISOString();
    }

    // Clean up filler phrases
    title = title
      .replace(/^(remind me to|remind me|add task to|add task|create task|schedule)\s+/i, '')
      .replace(/\s+(by|before|on|at)\s+(tomorrow|tonight|today|next week|next month)(\s+.*)?$/i, '')
      .trim();

    return { title: title || text, deadline: deadlineIso, priority };
  }

  /**
   * Chat with the pet. Uses the configured API key (OpenAI or Gemini).
   * Falls back to local responses if no key or API call fails.
   */
  public async chatWithPet(
    userInput: string,
    apiKey?: string,
    model: string = 'gpt-4o-mini'
  ): Promise<{ text: string; toolCalled?: any }> {
    const lower = userInput.toLowerCase();

    // ── Task-creation shortcuts ──
    if (
      lower.startsWith('remind me') ||
      lower.startsWith('add task') ||
      lower.startsWith('create task') ||
      lower.startsWith('schedule') ||
      lower.includes(' due ')
    ) {
      try {
        const parsed = await this.parseNaturalLanguageTask(userInput);
        const created = await taskService.createTask(parsed.title || userInput, {
          deadline: parsed.deadline,
          priority: parsed.priority,
        });
        return {
          text: `Done! 🐾 Added **"${created.title}"** to your tasks${parsed.deadline ? ` (due ${new Date(parsed.deadline).toLocaleDateString()})` : ''}!`,
          toolCalled: { name: 'createTask', result: created },
        };
      } catch (err) {
        console.error('Task creation error:', err);
      }
    }

    // ── API call (if key provided) ──
    const key = apiKey?.trim();
    if (key) {
      const provider = detectProvider(key);
      try {
        let reply: string;
        if (provider === 'gemini') {
          reply = await callGemini(userInput, key, model);
        } else {
          reply = await callOpenAI(userInput, key, model);
        }
        return { text: reply };
      } catch (err: any) {
        console.warn(`[AiService] ${provider} API call failed:`, err?.message || err);
        // Return the error message so the user knows what went wrong
        return {
          text: `⚠️ AI Error: ${err?.message || 'API call failed'}. Check your API key in Settings. Falling back to offline mode...`,
        };
      }
    }

    // ── Offline fallback ──
    const text = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
    return { text };
  }
}

export const aiService = new AiService();
