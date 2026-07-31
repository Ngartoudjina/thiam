'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'thiam-admin-theme';

const OPTIONS: ReadonlyArray<{ value: Theme; label: string; Icon: typeof Sun }> = [
  { value: 'light', label: 'Clair', Icon: Sun },
  { value: 'dark', label: 'Sombre', Icon: Moon },
  { value: 'system', label: 'Système', Icon: Monitor },
];

function applyTheme(theme: Theme): void {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
  document.documentElement.classList.toggle('dark', isDark);
}

/** Sélecteur de thème du tableau de bord — clair, sombre ou selon le système. */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const initial: Theme =
      stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';

    setTheme(initial);
    applyTheme(initial);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (): void => {
      if (window.localStorage.getItem(STORAGE_KEY) === 'system') applyTheme('system');
    };

    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const select = (next: Theme): void => {
    setTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  };

  return (
    <div
      role="radiogroup"
      aria-label="Thème de l’interface"
      className="inline-flex rounded-lg border border-panel-border p-0.5 dark:border-panel-dark-border"
    >
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          aria-label={label}
          onClick={() => select(value)}
          className={cn(
            'flex size-7 items-center justify-center rounded-[0.3125rem] transition-colors duration-150 ease-out',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
            theme === value
              ? 'bg-panel-sunken text-panel-ink dark:bg-panel-dark-sunken dark:text-panel-dark-ink'
              : 'text-panel-faint hover:text-panel-ink dark:hover:text-panel-dark-ink',
          )}
        >
          <Icon size={14} strokeWidth={1.8} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

/**
 * Applique le thème mémorisé avant la peinture, pour éviter le flash clair.
 * Injecté dans la mise en page du tableau de bord uniquement.
 */
export function ThemeScript() {
  const script = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}')||'system';var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(t==='system'&&d))document.documentElement.classList.add('dark');}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
