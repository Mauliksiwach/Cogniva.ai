import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, Smile, Lightbulb, Flame, Bot } from 'lucide-react';

export type AvatarMood = 'happy' | 'thinking' | 'explaining' | 'funny' | 'proud';

interface TutorAvatarProps {
  mood?: AvatarMood;
  isSpeaking?: boolean;
  onToggleVoice?: () => void;
  voiceEnabled?: boolean;
  tutorName?: string;
}

export const TutorAvatar: React.FC<TutorAvatarProps> = ({
  mood = 'happy',
  isSpeaking = false,
  onToggleVoice,
  voiceEnabled = true,
  tutorName = 'Prof. Spark'
}) => {
  const [pulseMouth, setPulseMouth] = useState(false);

  useEffect(() => {
    if (isSpeaking) {
      const interval = setInterval(() => {
        setPulseMouth((prev) => !prev);
      }, 250);
      return () => clearInterval(interval);
    } else {
      setPulseMouth(false);
    }
  }, [isSpeaking]);

  const getMoodEmoji = () => {
    switch (mood) {
      case 'thinking':
        return '🤔';
      case 'explaining':
        return '🤓';
      case 'funny':
        return '😜';
      case 'proud':
        return '🏆';
      default:
        return '⚡';
    }
  };

  const getMoodTagline = () => {
    switch (mood) {
      case 'thinking':
        return 'Analysing your syllabus & past papers...';
      case 'explaining':
        return 'Listen closely, this is 100% coming in exams!';
      case 'funny':
        return 'Procrastination level: 99. Let me save you!';
      case 'proud':
        return 'A+ material in the making!';
      default:
        return 'Ready to crush your exams together!';
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-brand-950/80 via-slate-900/90 to-indigo-950/80 rounded-2xl border border-brand-500/30 shadow-xl shadow-brand-500/10 backdrop-blur-md relative overflow-hidden group">
      {/* Background Ambient Glow */}
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-brand-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-brand-400/30 transition-all duration-500" />
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Avatar Graphic Frame */}
      <div className="relative shrink-0">
        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-amber-400 p-0.5 shadow-lg shadow-brand-500/20 transition-transform duration-300 ${isSpeaking ? 'scale-105' : 'hover:scale-105'}`}>
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center relative overflow-hidden">
            {/* Robot Eye & Expression Overlay */}
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full transition-all duration-300 ${
                mood === 'thinking' ? 'bg-amber-400 animate-ping' : mood === 'funny' ? 'bg-emerald-400 scale-125' : 'bg-cyan-400 shadow-sm shadow-cyan-400'
              }`} />
              <div className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full transition-all duration-300 ${
                mood === 'thinking' ? 'bg-amber-400' : mood === 'funny' ? 'bg-emerald-400 scale-125' : 'bg-cyan-400 shadow-sm shadow-cyan-400'
              }`} />
            </div>

            {/* Dynamic Mouth / Voice Wave Indicator */}
            <div className="flex items-center gap-1 h-3 mt-1">
              {isSpeaking ? (
                <>
                  <span className={`w-1 bg-brand-400 rounded-full transition-all duration-150 ${pulseMouth ? 'h-3' : 'h-1'}`} />
                  <span className={`w-1 bg-indigo-400 rounded-full transition-all duration-150 ${!pulseMouth ? 'h-3' : 'h-1.5'}`} />
                  <span className={`w-1 bg-amber-400 rounded-full transition-all duration-150 ${pulseMouth ? 'h-3.5' : 'h-1'}`} />
                  <span className={`w-1 bg-brand-400 rounded-full transition-all duration-150 ${!pulseMouth ? 'h-2.5' : 'h-1.5'}`} />
                </>
              ) : (
                <div className={`h-1 rounded-full bg-slate-600 transition-all duration-300 ${
                  mood === 'funny' ? 'w-5 bg-amber-400' : mood === 'happy' ? 'w-4 bg-brand-400' : 'w-3 bg-slate-500'
                }`} />
              )}
            </div>

            {/* Mood Icon Badge */}
            <div className="absolute top-1 right-1 text-xs bg-slate-900/90 rounded-md px-1 py-0.5 border border-slate-800">
              {getMoodEmoji()}
            </div>
          </div>
        </div>

        {/* Live Speaking Badge */}
        {isSpeaking && (
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-950" />
          </span>
        )}
      </div>

      {/* Tutor Name & Message */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-white text-base tracking-tight flex items-center gap-1.5">
              {tutorName}
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Mentor
              </span>
            </h3>
          </div>

          {/* Voice Toggle Button */}
          {onToggleVoice && (
            <button
              onClick={onToggleVoice}
              title={voiceEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
              className={`p-2 rounded-xl transition-all duration-200 ${
                voiceEnabled
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30 hover:bg-brand-500/30'
                  : 'bg-slate-800/80 text-slate-500 border border-slate-700 hover:text-slate-300'
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          )}
        </div>

        <p className="text-xs text-slate-300 font-medium leading-relaxed italic line-clamp-2">
          "{getMoodTagline()}"
        </p>
      </div>
    </div>
  );
};
