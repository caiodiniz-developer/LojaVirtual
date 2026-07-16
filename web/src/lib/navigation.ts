import { useMemo } from 'react';
import {
  useLocation,
  useNavigate,
  useSearchParams as useRouterSearchParams,
} from 'react-router-dom';

/** Imperative navigation with a stable, framework-agnostic surface. */
export function useRouter() {
  const navigate = useNavigate();

  return useMemo(
    () => ({
      push: (to: string) => navigate(to),
      replace: (to: string, _options?: { scroll?: boolean }) => navigate(to, { replace: true }),
      back: () => navigate(-1),
    }),
    [navigate]
  );
}

export function usePathname(): string {
  return useLocation().pathname;
}

export function useSearchParams(): URLSearchParams {
  return useRouterSearchParams()[0];
}
