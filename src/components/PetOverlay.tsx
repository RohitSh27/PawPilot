import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Pet } from '../pet/Pet';
import { SpeechBubble } from './SpeechBubble';
import { RadialMenu } from './RadialMenu';
import { Task, PetStateData, SpeechMessage } from '../types';
import { taskService } from '../tasks/taskService';
import { calculatePetMood } from '../pet/PetMoodEngine';
import { reminderScheduler } from '../scheduler/reminderScheduler';

/*
 * APPROACH: The pet window is a small transparent Electron window (~280×340).
 * Walking is achieved by telling the MAIN PROCESS to move the window via IPC
 * (window.pawpilot.window.movePet(x)).  The renderer just renders the cat
 * centered in the window — no absolute CSS positioning needed.
 *
 * Dragging is handled by Electron's native -webkit-app-region: drag.
 */

const SPEED = 60;           // px per second
const PAUSE_MIN = 3000;
const PAUSE_MAX = 9000;
const WALK_MIN  = 2500;
const WALK_MAX  = 6000;

export const PetOverlay: React.FC = () => {
  // ── data ──
  const [tasks, setTasks]       = useState<Task[]>([]);
  const [petState, setPetState] = useState<PetStateData>({
    mood: 'IDLE', name: 'PawPilot', type: 'cat',
    xp: 0, level: 1, streakDays: 1, lastActive: new Date().toISOString()
  });
  const [speech, setSpeech]     = useState<SpeechMessage | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isFocusActive]         = useState(false);
  const [facing, setFacing]     = useState<'left' | 'right'>('right');

  // ── walk state ──
  const posX        = useRef(0);     // filled on mount from screen bounds
  const screenMaxX  = useRef(1400);  // filled on mount
  const screenMinX  = useRef(0);
  const dirRef      = useRef<'idle' | 'left' | 'right'>('idle');
  const lastTick    = useRef(performance.now());
  const rafId       = useRef(0);
  const walkTimer   = useRef<any>(null);

  // ── bridge helper ──
  const api = useCallback(() => (window as any).pawpilot?.window, []);

  // ──────────────── load data ────────────────
  const reload = useCallback(async () => {
    try {
      const t = await taskService.getAllTasks();
      setTasks(t);
      if ((window as any).pawpilot?.pet) {
        setPetState(await (window as any).pawpilot.pet.getState());
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    reload();
    const iv = setInterval(reload, 10_000);
    reminderScheduler.setSpeechCallback(setSpeech);
    setTimeout(() => setSpeech({
      id: 'hi', text: 'Meow! 🐱 Drag me around or click me!',
      type: 'greeting', durationMs: 5000
    }), 1500);
    return () => clearInterval(iv);
  }, [reload]);

  useEffect(() => {
    if (tasks.length) reminderScheduler.checkTasks(tasks);
  }, [tasks]);

  // ──────────────── init screen bounds ────────────────
  useEffect(() => {
    (async () => {
      try {
        const bounds = await api()?.getScreenBounds();
        if (bounds) {
          screenMinX.current = bounds.x;
          screenMaxX.current = bounds.x + bounds.width - 280; // window width
          posX.current = bounds.x + Math.floor(bounds.width * 0.6);
          api()?.movePet(posX.current);
        }
      } catch (_) {}
    })();
  }, [api]);

  // ──────────────── wander scheduler ────────────────
  const scheduleWander = useCallback(() => {
    clearTimeout(walkTimer.current);
    const pause = PAUSE_MIN + Math.random() * (PAUSE_MAX - PAUSE_MIN);
    walkTimer.current = setTimeout(() => {
      const goRight = Math.random() > 0.5;
      dirRef.current = goRight ? 'right' : 'left';
      setFacing(goRight ? 'right' : 'left');
      const walk = WALK_MIN + Math.random() * (WALK_MAX - WALK_MIN);
      walkTimer.current = setTimeout(() => {
        dirRef.current = 'idle';
        scheduleWander();
      }, walk);
    }, pause);
  }, []);

  useEffect(() => {
    scheduleWander();
    return () => clearTimeout(walkTimer.current);
  }, [scheduleWander]);

  // ──────────────── RAF movement loop ────────────────
  useEffect(() => {
    let frameCount = 0;
    const tick = (now: number) => {
      const dt = (now - lastTick.current) / 1000; // seconds
      lastTick.current = now;
      const dir = dirRef.current;
      if (dir !== 'idle') {
        const delta = SPEED * dt * (dir === 'right' ? 1 : -1);
        posX.current += delta;

        // bounce off edges
        if (posX.current >= screenMaxX.current) {
          posX.current = screenMaxX.current;
          dirRef.current = 'left';
          setFacing('left');
        } else if (posX.current <= screenMinX.current) {
          posX.current = screenMinX.current;
          dirRef.current = 'right';
          setFacing('right');
        }

        // throttle IPC calls to every 3 frames (~20 Hz) to avoid flooding
        frameCount++;
        if (frameCount % 3 === 0) {
          api()?.movePet(Math.round(posX.current));
        }
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [api]);

  // ──────────────── derived ────────────────
  const mood = calculatePetMood(tasks, isFocusActive);

  const handleAction = async (action: string) => {
    if (['dashboard','tasks','chat','calendar','stats','settings','focus'].includes(action)) {
      api()?.openDashboard();
    }
  };

  // ──────────────── render ────────────────
  // The whole window IS the pet area.  -webkit-app-region: drag makes
  // the window draggable from anywhere (Electron built-in).
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        background: 'transparent',
        overflow: 'visible',
        WebkitAppRegion: 'drag',
        userSelect: 'none',
      } as any}
    >
      {/* speech bubble */}
      {speech && (
        <div style={{ WebkitAppRegion: 'no-drag', marginBottom: 4, width: 260 } as any}>
          <SpeechBubble
            message={speech}
            onDismiss={() => setSpeech(null)}
            onActionClick={handleAction}
          />
        </div>
      )}

      {/* radial menu */}
      {menuOpen && (
        <div style={{ WebkitAppRegion: 'no-drag', marginBottom: 4 } as any}>
          <RadialMenu
            isOpen={menuOpen}
            onClose={() => setMenuOpen(false)}
            onSelectAction={handleAction}
          />
        </div>
      )}

      {/* The cat — flipped when walking left */}
      <div
        style={{
          transform: facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
          transition: 'transform 0.2s ease',
          WebkitAppRegion: 'no-drag',
        } as any}
      >
        <Pet
          mood={mood}
          name={petState.name}
          size={1.0}
          onClick={() => setMenuOpen(p => !p)}
        />
      </div>
    </div>
  );
};
