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
      className={`group relative inline-flex items-center gap-2 px-3 py-2 rounded-full border transition-all duration-300 cursor-pointer select-none text-xs font-mono tracking-wider ${
        isLight
          ? 'bg-surface hover:bg-surface-2 border-line-strong text-fg shadow-sm'
          : 'bg-surface-2/90 hover:bg-surface-2 border-line-strong text-fg hover:text-fg hover:border-primary/50'
      } ${className}`}
    >
      <div
        className={`w-4 h-4 rounded-full flex items-center justify-center transition-transform duration-300 ${
          isLight
            ? 'rotate-0 text-amber-600'
            : 'rotate-180 text-brand'
        }`}
      >
        {isLight ? (
          <Sun className="w-3.5 h-3.5 fill-amber-500/20 stroke-[2.2]" />
        ) : (
          <Moon className="w-3.5 h-3.5 fill-primary/20 stroke-[2]" />
        )}
      </div>

      {showLabel && (
        <span className="font-semibold uppercase text-xs">
          {isLight ? 'Light' : 'Dark'}
        </span>
      )}

      {/* Subtle indicator ring */}
      <span
        className={`w-1.5 h-1.5 rounded-full transition-colors ${
          isLight ? 'bg-amber-500' : 'bg-primary'
        }`}
      />
    </button>
  );
};
