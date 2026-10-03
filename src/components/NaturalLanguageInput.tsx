import React, { useState } from 'react';
import { Sparkles, Plus, ArrowRight } from 'lucide-react';
import { aiService } from '../ai/aiService';
import { Task } from '../types';

interface NaturalLanguageInputProps {
  onConfirmTask: (taskData: Partial<Task>) => void;
}

export const NaturalLanguageInput: React.FC<NaturalLanguageInputProps> = ({ onConfirmTask }) => {
  const [input, setInput] = useState('');
  const [extracted, setExtracted] = useState<Partial<Task> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsProcessing(true);
    try {
      const result = await aiService.parseNaturalLanguageTask(input);
      setExtracted(result);
    } catch (err) {
      console.error('Failed to parse natural language task:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (extracted) {
      onConfirmTask(extracted);
      setExtracted(null);
      setInput('');
    }
  };

  return (
    <div className="bg-card/80 border border-cyan-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-xl mb-6">
      <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-cyan-400">
        <Sparkles className="w-4 h-4" />
        <span>Natural Language Task Creation</span>
      </div>

      <form onSubmit={handleParse} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Try: "Remind me that my DBMS assignment is due Tuesday at 11:59 PM"'
          className="flex-1 bg-background/80 border border-border/80 rounded-xl px-3.5 py-2.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500/60"
        />
        <button
          type="submit"
          disabled={isProcessing || !input.trim()}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          {isProcessing ? 'Parsing...' : 'Parse Task'}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Structured Confirmation Card */}
      {extracted && (
        <div className="mt-3 p-3 bg-cyan-950/40 border border-cyan-500/40 rounded-xl flex items-center justify-between animate-in fade-in duration-200">
          <div className="text-xs">
            <span className="font-semibold text-gray-200">{extracted.title}</span>
            <div className="text-[11px] text-gray-400 mt-0.5">
              Priority: <span className="text-amber-400 font-medium">{extracted.priority}</span>
              {extracted.deadline && ` • Deadline: ${new Date(extracted.deadline).toLocaleString()}`}
            </div>
          </div>
          <button
            onClick={handleConfirm}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Confirm Task
          </button>
        </div>
      )}
    </div>
  );
};
