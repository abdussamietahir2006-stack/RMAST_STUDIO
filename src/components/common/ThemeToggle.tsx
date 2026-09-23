import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  showLabel = true
}) => {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
      title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
      className={`group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 cursor-pointer select-none text-xs font-mono tracking-wider ${
        isLight
          ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 shadow-sm'
          : 'bg-[#121624]/90 hover:bg-[#1A2033] border-[#252B3D] text-[#D0D4E0] hover:text-[#FAF8F5] hover:border-[#C9A96E]/50'
      } ${className}`}
    >
      <div
        className={`w-4 h-4 rounded-full flex items-center justify-center transition-transform duration-300 ${
          isLight
            ? 'rotate-0 text-amber-600'
            : 'rotate-180 text-[#C9A96E]'
        }`}
      >
        {isLight ? (
          <Sun className="w-3.5 h-3.5 fill-amber-500/20 stroke-[2.2]" />
        ) : (
          <Moon className="w-3.5 h-3.5 fill-[#C9A96E]/20 stroke-[2]" />
        )}
      </div>

      {showLabel && (
        <span className="font-semibold uppercase text-[10px]">
          {isLight ? 'Light' : 'Dark'}
        </span>
      )}

      {/* Subtle indicator ring */}
      <span
        className={`w-1.5 h-1.5 rounded-full transition-colors ${
          isLight ? 'bg-amber-500' : 'bg-[#C9A96E]'
        }`}
      />
    </button>
  );
};
