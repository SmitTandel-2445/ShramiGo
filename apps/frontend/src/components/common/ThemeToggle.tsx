import { Moon, Sun } from "lucide-react";
import { useTheme } from '@/app/providers/ThemeContext';

/**
 * Floating quick-toggle button that sits gracefully in the corner of screens,
 * positioned above bottom navigation bars to prevent blocking user actions,
 * allowing instant 1-click toggling between Light and Dark mode anywhere in the app.
 */
export function FloatingThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <aside
      aria-label="Theme switcher"
      className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-50 pointer-events-auto"
    >
      <button
        type="button"
        onClick={toggleTheme}
        className={`w-11 h-11 rounded-full flex items-center justify-center shadow-xl backdrop-blur-md transition-all duration-300 active:scale-90 border ${
          isDark
            ? "bg-[#162032]/95 border-cyan-500/40 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:border-cyan-400 hover:scale-105"
            : "bg-white/95 border-gray-200 text-amber-500 shadow-gray-300/60 hover:border-amber-400 hover:scale-105"
        }`}
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {isDark ? (
          <Moon
            size={20}
            className="text-cyan-300 transition-transform duration-500 rotate-0"
          />
        ) : (
          <Sun
            size={20}
            className="text-amber-500 transition-transform duration-500 rotate-0"
          />
        )}
      </button>
    </aside>
  );
}

/**
 * Inline toggle switch designed for Settings and Profile pages
 */
export function InlineThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
        isDark ? "bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.4)]" : "bg-gray-300"
      }`}
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
    >
      <span
        className={`toggle-knob inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white transition-transform duration-300 shadow-sm ${
          isDark ? "translate-x-8 text-cyan-700" : "translate-x-1 text-amber-500"
        }`}
      >
        {isDark ? (
          <Moon size={12} strokeWidth={2.5} />
        ) : (
          <Sun size={12} strokeWidth={2.5} />
        )}
      </span>
    </button>
  );
}

/**
 * Compact icon button for headers and navigation bars
 */
export function HeaderThemeToggle({ className = "" }: { className?: string }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`header-theme-toggle w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 active:scale-90 ${className}`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? (
        <Moon size={17} className="transition-transform duration-300" />
      ) : (
        <Sun size={17} className="transition-transform duration-300" />
      )}
    </button>
  );
}
