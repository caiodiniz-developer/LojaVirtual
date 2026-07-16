import { Outlet } from 'react-router-dom';
import {
  ArrowLeft,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tags,
  TicketPercent,
  Users,
} from 'lucide-react';
import Link from '@/components/common/link';
import { usePathname } from '@/lib/navigation';
import { AuthGuard } from '@/components/common/auth-guard';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Produtos', icon: Package },
  { href: '/admin/orders', label: 'Pedidos', icon: ShoppingCart },
  { href: '/admin/categories', label: 'Categorias', icon: Tags },
  { href: '/admin/coupons', label: 'Cupons', icon: TicketPercent },
  { href: '/admin/users', label: 'Usuários', icon: Users },
];

export default function AdminLayout() {
  const pathname = usePathname();

  return (
    <AuthGuard admin>
      <div className="container grid gap-10 py-10 lg:grid-cols-[230px_1fr]">
        <nav aria-label="Menu administrativo" className="h-fit lg:sticky lg:top-24">
          <p className="mb-3 px-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Administração
          </p>
          <ul className="flex gap-1 overflow-x-auto lg:flex-col">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = href === '/admin' ? pathname === href : pathname.startsWith(href);
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
            <li className="mt-2 border-t border-border pt-2">
              <Link
                href="/"
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Voltar à loja
              </Link>
            </li>
          </ul>
        </nav>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </AuthGuard>
  );
}
