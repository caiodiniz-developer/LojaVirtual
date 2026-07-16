import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/providers/theme-provider';
import { Tooltip } from '@/components/ui/tooltip';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <Tooltip content={isDark ? 'Modo claro' : 'Modo escuro'} side="bottom">
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
        className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-muted"
      >
        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
    </Tooltip>
  );
}
