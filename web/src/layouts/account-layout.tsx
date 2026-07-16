import { Outlet } from 'react-router-dom';
import { Award, Heart, MapPin, Package, ShieldCheck, User } from 'lucide-react';
import Link from '@/components/common/link';
import { usePathname } from '@/lib/navigation';
import { AuthGuard } from '@/components/common/auth-guard';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/account', label: 'Meu perfil', icon: User },
  { href: '/account/orders', label: 'Pedidos', icon: Package },
  { href: '/account/wishlist', label: 'Favoritos', icon: Heart },
  { href: '/account/rewards', label: 'Recompensas', icon: Award },
  { href: '/account/addresses', label: 'Endereços', icon: MapPin },
  { href: '/account/security', label: 'Segurança', icon: ShieldCheck },
];

export default function AccountLayout() {
  const pathname = usePathname();

  return (
    <AuthGuard>
      <div className="container grid gap-10 py-10 lg:grid-cols-[240px_1fr]">
        <nav aria-label="Menu da conta" className="h-fit lg:sticky lg:top-24">
          <ul className="flex gap-1 overflow-x-auto lg:flex-col">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = href === '/account' ? pathname === href : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </AuthGuard>
  );
}
