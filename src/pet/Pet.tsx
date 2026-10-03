import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PetMood } from '../types';
import { PetAnimationController } from './PetAnimations';
import { soundService } from '../services/soundService';

interface PetProps {
  mood: PetMood;
  name: string;
  type?: string;
  onClick?: () => void;
  onDoubleClick?: () => void;
  size?: number;
}

// ─── Palette ────────────────────────────────────────────────────────────────
// Orange tabby cat colour scheme
const PAL = {
  bodyMain: '#E8864A',   // warm orange
  bodyLight: '#F5A96B',  // lighter belly / chest
  bodyDark: '#C06030',   // shadow / darker fur
  stripe: '#B85520',     // tabby stripes
  belly: '#FAE0C0',      // pale belly patch
  earInner: '#F0A0A0',   // pink inner ear
  nose: '#E88090',       // pink nose
  mouthLine: '#8B3A2A',  // dark mouth
  whiskerCol: '#FFF5EA', // cream whiskers
  eyeIris: '#5AC868',    // bright green irises
  eyePupil: '#1A1A1A',
  eyeShine: '#FFFFFF',
  tailTip: '#FAE0C0',    // cream tail tip
  pawPad: '#E88090',     // pink paw pads
};

// ─── Helper: Tabby stripe dashes ────────────────────────────────────────────
const TabbySrtripes: React.FC<{ mood: PetMood }> = ({ mood }) => (
  <g opacity="0.55" stroke={PAL.stripe} strokeWidth="2.8" strokeLinecap="round" fill="none">
    {/* forehead stripes */}
    <path d="M 52 30 Q 60 27 68 30" />
    <path d="M 49 24 Q 60 21 71 24" />
    {/* cheek stripes */}
    <path d="M 30 54 Q 38 57 40 62" />
    <path d="M 86 54 Q 78 57 76 62" />
    {/* body stripe marks */}
    <path d="M 36 82 Q 44 86 44 94" />
    <path d="M 76 82 Q 68 86 68 94" />
  </g>
);

// ─── Eye renderer ───────────────────────────────────────────────────────────
const renderEyes = (mood: PetMood, blink: boolean) => {
  // Sleeping: closed curved lines
  if (mood === 'SLEEPING') {
    return (
      <g>
        <path d="M 44 54 Q 52 60 60 54" stroke={PAL.eyePupil} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M 64 54 Q 72 60 80 54" stroke={PAL.eyePupil} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </g>
    );
  }

  // Blinking: thin lines
  if (blink) {
    return (
      <g>
        <line x1="45" y1="54" x2="59" y2="54" stroke={PAL.eyePupil} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="65" y1="54" x2="79" y2="54" stroke={PAL.eyePupil} strokeWidth="2.5" strokeLinecap="round" />
      </g>
    );
  }

  // Worried: narrow/sideways
  if (mood === 'WORRIED' || mood === 'SAD') {
    return (
      <g>
        <ellipse cx="52" cy="54" rx="6" ry="5" fill={PAL.eyeIris} />
        <ellipse cx="52" cy="54" rx="3" ry="4.5" fill={PAL.eyePupil} />
        <circle cx="54" cy="52" r="1.5" fill={PAL.eyeShine} />
        <ellipse cx="72" cy="54" rx="6" ry="5" fill={PAL.eyeIris} />
        <ellipse cx="72" cy="54" rx="3" ry="4.5" fill={PAL.eyePupil} />
        <circle cx="74" cy="52" r="1.5" fill={PAL.eyeShine} />
        {/* worried brow lines */}
        <path d="M 44 46 Q 52 42 60 46" stroke={PAL.bodyDark} strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M 64 46 Q 72 42 80 46" stroke={PAL.bodyDark} strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>
    );
  }

  // Excited / Celebrating: star / sparkle eyes
  if (mood === 'EXCITED' || mood === 'CELEBRATING') {
    return (
      <g>
        {/* left star eye */}
        <circle cx="52" cy="54" r="8" fill={PAL.eyeIris} />
        <circle cx="52" cy="54" r="4" fill="#FFD700" />
        <circle cx="54" cy="52" r="2" fill={PAL.eyeShine} />
        {/* right star eye */}
        <circle cx="72" cy="54" r="8" fill={PAL.eyeIris} />
        <circle cx="72" cy="54" r="4" fill="#FFD700" />
        <circle cx="74" cy="52" r="2" fill={PAL.eyeShine} />
      </g>
    );
  }

  // Happy: slightly larger, bright
  if (mood === 'HAPPY') {
    return (
      <g>
        <ellipse cx="52" cy="54" rx="8" ry="9" fill={PAL.eyeIris} />
        <ellipse cx="52" cy="54" rx="4.5" ry="8" fill={PAL.eyePupil} />
        <circle cx="55" cy="51" r="2.5" fill={PAL.eyeShine} />
        <ellipse cx="72" cy="54" rx="8" ry="9" fill={PAL.eyeIris} />
        <ellipse cx="72" cy="54" rx="4.5" ry="8" fill={PAL.eyePupil} />
        <circle cx="75" cy="51" r="2.5" fill={PAL.eyeShine} />
      </g>
    );
  }

  // Working: focused, half-lidded
  if (mood === 'WORKING') {
    return (
      <g>
        <ellipse cx="52" cy="55" rx="7" ry="7" fill={PAL.eyeIris} />
        <ellipse cx="52" cy="55" rx="4" ry="6" fill={PAL.eyePupil} />
        <circle cx="54" cy="53" r="2" fill={PAL.eyeShine} />
        {/* half-lid */}
        <rect x="44" y="48" width="16" height="5" rx="2" fill={PAL.bodyMain} />
        <ellipse cx="72" cy="55" rx="7" ry="7" fill={PAL.eyeIris} />
        <ellipse cx="72" cy="55" rx="4" ry="6" fill={PAL.eyePupil} />
        <circle cx="74" cy="53" r="2" fill={PAL.eyeShine} />
        <rect x="64" y="48" width="16" height="5" rx="2" fill={PAL.bodyMain} />
      </g>
    );
  }

  // Default / IDLE: normal round eyes
  return (
    <g>
      <ellipse cx="52" cy="54" rx="7.5" ry="9" fill={PAL.eyeIris} />
      <ellipse cx="52" cy="54" rx="4" ry="8" fill={PAL.eyePupil} />
      <circle cx="55" cy="51" r="2.5" fill={PAL.eyeShine} />
      <ellipse cx="72" cy="54" rx="7.5" ry="9" fill={PAL.eyeIris} />
      <ellipse cx="72" cy="54" rx="4" ry="8" fill={PAL.eyePupil} />
      <circle cx="75" cy="51" r="2.5" fill={PAL.eyeShine} />
    </g>
  );
};

// ─── Mouth renderer ─────────────────────────────────────────────────────────
const renderMouth = (mood: PetMood) => {
  if (mood === 'SLEEPING') {
    return <path d="M 56 72 Q 62 76 68 72" stroke={PAL.mouthLine} strokeWidth="2" fill="none" strokeLinecap="round" />;
  }
  if (mood === 'WORRIED' || mood === 'SAD') {
    return (
      <g>
        <path d="M 55 76 Q 62 70 69 76" stroke={PAL.mouthLine} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <ellipse cx="62" cy="69" rx="4" ry="2.5" fill={PAL.nose} />
      </g>
    );
  }
  if (mood === 'CELEBRATING' || mood === 'EXCITED') {
    return (
      <g>
        {/* big open happy mouth */}
        <path d="M 53 70 Q 62 82 71 70 Z" fill={PAL.mouthLine} />
        <path d="M 55 70 Q 62 80 69 70" fill="#CC4444" />
        <ellipse cx="62" cy="68" rx="4" ry="2.5" fill={PAL.nose} />
        <path d="M 62 71 L 62 66" stroke={PAL.mouthLine} strokeWidth="1.5" strokeLinecap="round" />
      </g>
    );
  }
  if (mood === 'HAPPY') {
    return (
      <g>
        <path d="M 54 72 Q 62 80 70 72" stroke={PAL.mouthLine} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <ellipse cx="62" cy="68" rx="4" ry="2.5" fill={PAL.nose} />
        <path d="M 62 70 L 62 65" stroke={PAL.mouthLine} strokeWidth="1.5" strokeLinecap="round" />
      </g>
    );
  }
  // default neutral
  return (
    <g>
      <path d="M 56 72 Q 62 76 68 72" stroke={PAL.mouthLine} strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="62" cy="68" rx="4" ry="2.5" fill={PAL.nose} />
      <path d="M 62 70 L 62 66" stroke={PAL.mouthLine} strokeWidth="1.5" strokeLinecap="round" />
    </g>
  );
};

// ─── Main Pet Component ──────────────────────────────────────────────────────
export const Pet: React.FC<PetProps> = ({
  mood,
  name,
  onClick,
  onDoubleClick,
  size = 1.0
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animControllerRef = useRef<PetAnimationController>(new PetAnimationController());
  const [isBlinking, setIsBlinking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tailPhase, setTailPhase] = useState(0); // 0-3 for tail wag frames
  const [earTwitchLeft, setEarTwitchLeft] = useState(false);
  const [earTwitchRight, setEarTwitchRight] = useState(false);

  // ── Blinking ──
  useEffect(() => {
    if (mood === 'SLEEPING') return;
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 120);
    };
    const scheduleNext = () => {
      const delay = 2500 + Math.random() * 2500;
      return setTimeout(() => { blink(); scheduleNext(); }, delay);
    };
    const t = scheduleNext();
    return () => clearTimeout(t);
  }, [mood]);

  // ── Tail wag (continuous) ──
  useEffect(() => {
    const speed = mood === 'EXCITED' || mood === 'CELEBRATING' ? 120
      : mood === 'HAPPY' ? 220
      : mood === 'SLEEPING' ? 0
      : 380;
    if (speed === 0) { setTailPhase(0); return; }
    const interval = setInterval(() => {
      setTailPhase(p => (p + 1) % 4);
    }, speed);
    return () => clearInterval(interval);
  }, [mood]);

  // ── Ear twitch ──
  useEffect(() => {
    const scheduleEarTwitch = () => {
      const delay = 4000 + Math.random() * 6000;
      return setTimeout(() => {
        const which = Math.random() > 0.5 ? 'left' : 'right';
        if (which === 'left') {
          setEarTwitchLeft(true);
          setTimeout(() => setEarTwitchLeft(false), 300);
        } else {
          setEarTwitchRight(true);
          setTimeout(() => setEarTwitchRight(false), 300);
        }
        scheduleEarTwitch();
      }, delay);
    };
    const t = scheduleEarTwitch();
    return () => clearTimeout(t);
  }, []);

  // ── Init animation controller ──
  useEffect(() => {
    if (containerRef.current) {
      animControllerRef.current.init(containerRef.current);
    }
  }, []);

  // ── Mood-driven body animations ──
  useEffect(() => {
    if (!containerRef.current) return;
    const ctrl = animControllerRef.current;
    if (mood === 'CELEBRATING' || mood === 'EXCITED') {
      ctrl.triggerCelebrate();
    } else if (mood === 'WORRIED' || mood === 'SAD') {
      ctrl.triggerWorry();
    } else if (mood === 'HAPPY') {
      ctrl.triggerJump();
    } else if (mood === 'SLEEPING') {
      ctrl.startSleeping();
    } else {
      ctrl.startBreathing();
    }
  }, [mood]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundService.playClick();
    animControllerRef.current.triggerJump();
    if (onClick) onClick();
  };

  // ── Tail curve based on phase ──
  const tailCurves = [
    "M 80 108 Q 105 90 115 65 Q 120 45 105 35",
    "M 80 108 Q 108 88 118 60 Q 124 38 108 30",
    "M 80 108 Q 103 92 112 67 Q 116 48 102 40",
    "M 80 108 Q 100 95 108 72 Q 111 53 97 46",
  ];
  const tailPath = tailCurves[tailPhase];

  // ── Glow colour per mood ──
  const glowColor =
    mood === 'WORRIED' ? 'rgba(251,191,36,0.35)'
    : mood === 'SAD' ? 'rgba(99,102,241,0.3)'
    : mood === 'CELEBRATING' || mood === 'EXCITED' ? 'rgba(251,113,133,0.45)'
    : mood === 'HAPPY' ? 'rgba(74,222,128,0.35)'
    : mood === 'SLEEPING' ? 'rgba(148,163,184,0.25)'
    : 'rgba(232,134,74,0.3)';

  return (
    <div
      ref={containerRef}
      style={{
        transform: `scale(${size})`,
        transformOrigin: 'bottom center',
        WebkitAppRegion: 'no-drag',
        filter: `drop-shadow(0 6px 20px ${glowColor})`,
      } as any}
      onClick={handleClick}
      onDoubleClick={onDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative cursor-pointer select-none w-40 h-48 flex flex-col items-center justify-end pb-1 group transition-all duration-300 pointer-events-auto"
    >
      {/* Soft ground shadow */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full blur-lg transition-all duration-300"
        style={{
          width: isHovered ? '100px' : '88px',
          height: '12px',
          background: 'rgba(0,0,0,0.35)',
        }}
      />

      {/* The Cat SVG */}
      <svg
        viewBox="0 0 124 140"
        className="w-36 h-44 z-10 pointer-events-auto overflow-visible"
        style={{ transition: 'filter 0.3s' }}
      >
        <defs>
          {/* Body gradient */}
          <radialGradient id="bodyGrad" cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor={PAL.bodyLight} />
            <stop offset="60%" stopColor={PAL.bodyMain} />
            <stop offset="100%" stopColor={PAL.bodyDark} />
          </radialGradient>
          {/* Belly gradient */}
          <radialGradient id="bellyGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={PAL.belly} />
            <stop offset="100%" stopColor={PAL.bodyLight} />
          </radialGradient>
          {/* Tail gradient */}
          <linearGradient id="tailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={PAL.bodyMain} />
            <stop offset="80%" stopColor={PAL.bodyLight} />
            <stop offset="100%" stopColor={PAL.tailTip} />
          </linearGradient>
        </defs>

        {/* ── Tail (behind body) ── */}
        <path
          d={tailPath}
          fill="none"
          stroke="url(#tailGrad)"
          strokeWidth="9"
          strokeLinecap="round"
          style={{ transition: 'd 0.12s ease-in-out' }}
        />
        {/* Tail tip */}
        <circle cx="105" cy="35" r="5.5" fill={PAL.tailTip} />

        {/* ── Back legs / haunches ── */}
        <ellipse cx="37" cy="113" rx="14" ry="10" fill={PAL.bodyMain} />
        <ellipse cx="87" cy="113" rx="14" ry="10" fill={PAL.bodyMain} />

        {/* ── Body ── */}
        <ellipse cx="62" cy="92" rx="34" ry="38" fill="url(#bodyGrad)" />

        {/* Tabby body stripes */}
        <TabbySrtripes mood={mood} />

        {/* ── Belly patch ── */}
        <ellipse cx="62" cy="102" rx="18" ry="22" fill="url(#bellyGrad)" />

        {/* ── Front paws ── */}
        {/* Left paw */}
        <ellipse cx="42" cy="128" rx="11" ry="7" fill={PAL.bodyMain} />
        <ellipse cx="42" cy="130" rx="10" ry="5.5" fill={PAL.bodyLight} />
        {/* paw pads */}
        <ellipse cx="42" cy="131" rx="3.5" ry="2" fill={PAL.pawPad} />
        <circle cx="37" cy="130" r="1.8" fill={PAL.pawPad} />
        <circle cx="47" cy="130" r="1.8" fill={PAL.pawPad} />

        {/* Right paw */}
        <ellipse cx="82" cy="128" rx="11" ry="7" fill={PAL.bodyMain} />
        <ellipse cx="82" cy="130" rx="10" ry="5.5" fill={PAL.bodyLight} />
        <ellipse cx="82" cy="131" rx="3.5" ry="2" fill={PAL.pawPad} />
        <circle cx="77" cy="130" r="1.8" fill={PAL.pawPad} />
        <circle cx="87" cy="130" r="1.8" fill={PAL.pawPad} />

        {/* ── Head ── */}
        <ellipse cx="62" cy="50" rx="30" ry="28" fill="url(#bodyGrad)" />

        {/* ── Left ear ── */}
        <polygon
          points="34,28 26,6 50,22"
          fill={PAL.bodyMain}
          style={{
            transformOrigin: '40px 24px',
            transform: earTwitchLeft ? 'rotate(-12deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
          }}
        />
        <polygon points="35,26 29,10 48,22" fill={PAL.earInner} opacity="0.8" />

        {/* ── Right ear ── */}
        <polygon
          points="90,28 98,6 74,22"
          fill={PAL.bodyMain}
          style={{
            transformOrigin: '84px 24px',
            transform: earTwitchRight ? 'rotate(12deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
          }}
        />
        <polygon points="89,26 95,10 76,22" fill={PAL.earInner} opacity="0.8" />

        {/* ── Head fur markings (forehead M) ── */}
        <g stroke={PAL.stripe} strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.6">
          <path d="M 54 32 Q 58 28 62 32" />
          <path d="M 62 32 Q 66 28 70 32" />
          <path d="M 58 38 Q 62 34 66 38" />
        </g>

        {/* ── Cheek fur (puffy) ── */}
        <ellipse cx="36" cy="60" rx="8" ry="7" fill={PAL.bodyLight} opacity="0.5" />
        <ellipse cx="88" cy="60" rx="8" ry="7" fill={PAL.bodyLight} opacity="0.5" />

        {/* ── Whiskers ── */}
        {/* Left side */}
        <line x1="20" y1="62" x2="45" y2="65" stroke={PAL.whiskerCol} strokeWidth="1.2" opacity="0.9" />
        <line x1="18" y1="67" x2="45" y2="68" stroke={PAL.whiskerCol} strokeWidth="1.2" opacity="0.9" />
        <line x1="20" y1="72" x2="45" y2="71" stroke={PAL.whiskerCol} strokeWidth="1.2" opacity="0.9" />
        {/* Right side */}
        <line x1="104" y1="62" x2="79" y2="65" stroke={PAL.whiskerCol} strokeWidth="1.2" opacity="0.9" />
        <line x1="106" y1="67" x2="79" y2="68" stroke={PAL.whiskerCol} strokeWidth="1.2" opacity="0.9" />
        <line x1="104" y1="72" x2="79" y2="71" stroke={PAL.whiskerCol} strokeWidth="1.2" opacity="0.9" />

        {/* ── Eyes ── */}
        {renderEyes(mood, isBlinking)}

        {/* ── Nose & Mouth ── */}
        {renderMouth(mood)}

        {/* ── Mood overlays ── */}
        {mood === 'SLEEPING' && (
          <g className="animate-bounce" style={{ animationDuration: '2s' }}>
            <text x="88" y="28" fill="#94A3B8" fontSize="13" fontWeight="bold" opacity="0.85">z</text>
            <text x="96" y="18" fill="#94A3B8" fontSize="11" fontWeight="bold" opacity="0.7">z</text>
            <text x="102" y="10" fill="#94A3B8" fontSize="9" fontWeight="bold" opacity="0.5">z</text>
          </g>
        )}
        {mood === 'WORKING' && (
          <g transform="translate(36, 4)">
            <rect x="0" y="0" width="48" height="14" rx="7" fill="#3B82F6" opacity="0.9" />
            <text x="24" y="10" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">FOCUS 🎯</text>
          </g>
        )}
        {(mood === 'CELEBRATING' || mood === 'EXCITED') && (
          <g>
            <text x="2" y="20" fontSize="14">🎉</text>
            <text x="98" y="20" fontSize="14">✨</text>
          </g>
        )}
        {mood === 'WORRIED' && (
          <g>
            <text x="50" y="14" fontSize="13">😰</text>
          </g>
        )}
      </svg>

      {/* Name tag */}
      <div className="z-10 -mt-1 px-3 py-0.5 rounded-full bg-black/50 border border-white/20 text-[10px] font-semibold text-white tracking-wider backdrop-blur-md shadow-md pointer-events-auto">
        {name}
      </div>
    </div>
  );
};
