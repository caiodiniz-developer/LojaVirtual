import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from '@/lib/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface AuthGuardProps {
  children: ReactNode;
  /** Require the ADMIN role in addition to authentication. */
  admin?: boolean;
}

/**
 * Client-side route guard. Waits for the persisted session to hydrate,
 * then redirects unauthenticated (or non-admin) visitors.
 */
export function AuthGuard({ children, admin = false }: AuthGuardProps) {
  const { user, hydrated, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const allowed = hydrated && Boolean(user) && (!admin || isAdmin);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (admin && !isAdmin) {
      router.replace('/');
    }
  }, [hydrated, user, admin, isAdmin, router, pathname]);

  if (!allowed) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Carregando">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return <>{children}</>;
}
