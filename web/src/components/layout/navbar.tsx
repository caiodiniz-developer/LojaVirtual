import { useState } from 'react';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import Link from '@/components/common/link';
import { usePathname } from '@/lib/navigation';
import {
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  User as UserIcon,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useCartStore, selectCartCount } from '@/stores/cart-store';
import { useUiStore } from '@/stores/ui-store';
import { ThemeToggle } from './theme-toggle';
import { NotificationBell } from './notification-bell';
import { Dropdown, DropdownItem } from '@/components/ui/dropdown';
import { Drawer } from '@/components/ui/drawer';
import { useRouter } from '@/lib/navigation';

// 1. No Vite, você importa a imagem direto da pasta public referenciando a raiz
import logoUrl from '/logo-inteira.png';

const links = [
  { href: '/', label: 'Início' },
  { href: '/products', label: 'Produtos' },
  { href: '/products?onSale=true', label: 'Ofertas' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, logout } = useAuth();
  const cartCount = useCartStore(selectCartCount);
  const { setCartOpen, setSearchOpen, mobileMenuOpen, setMobileMenuOpen } = useUiStore();

  // Hide when scrolling down, reappear on the first scroll up
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setHidden(latest > previous && latest > 160);
  });

  return (
    <motion.header
      animate={{ y: hidden ? '-100%' : 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="sticky top-0 z-50 glass"
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          {/* 2. CORREÇÃO AQUI: Usando a tag <img> normal do HTML com o src correto */}
          <Link href="/" className="flex items-center">
            <img
              src={logoUrl}
              alt="ShopSphere Logo"
              className="h-12 w-auto object-contain" // Ajuste a altura (h-10) como preferir
            />
          </Link>

          <nav aria-label="Navegação principal" className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-xl px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                  pathname === link.href.split('?')[0] &&
                    !link.href.includes('?') &&
                    'text-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Buscar produtos (Ctrl+K)"
            className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            <Search className="h-5 w-5" />
            <span className="hidden lg:inline">Buscar…</span>
            <kbd className="hidden rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold lg:inline">
              Ctrl K
            </kbd>
          </button>

          <ThemeToggle />

          <NotificationBell />

          <Link
            href="/account/wishlist"
            aria-label="Favoritos"
            className="hidden h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-muted sm:flex"
          >
            <Heart className="h-5 w-5" />
          </Link>

          <button
            onClick={() => setCartOpen(true)}
            aria-label={`Carrinho com ${cartCount} itens`}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-muted"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full gradient-brand px-1 text-[10px] font-bold text-white">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>

          {user ? (
            <Dropdown
              trigger={
                <span className="ml-1 flex h-9 w-9 items-center justify-center rounded-full gradient-brand text-xs font-bold text-white ring-2 ring-border">
                  {getInitials(user.name)}
                </span>
              }
            >
              <div className="border-b border-border px-3 py-2.5">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
              <div className="pt-1.5">
                <DropdownItem onClick={() => router.push('/account')}>
                  <UserIcon className="h-4 w-4" /> Minha conta
                </DropdownItem>
                <DropdownItem onClick={() => router.push('/account/orders')}>
                  <Package className="h-4 w-4" /> Meus pedidos
                </DropdownItem>
                <DropdownItem onClick={() => router.push('/account/wishlist')}>
                  <Heart className="h-4 w-4" /> Favoritos
                </DropdownItem>
                {isAdmin && (
                  <DropdownItem onClick={() => router.push('/admin')}>
                    <LayoutDashboard className="h-4 w-4" /> Painel admin
                  </DropdownItem>
                )}
                <DropdownItem onClick={logout} className="text-red-500 hover:bg-red-500/10">
                  <LogOut className="h-4 w-4" /> Sair
                </DropdownItem>
              </div>
            </Dropdown>
          ) : (
            <Link
              href="/login"
              className="ml-1 hidden h-10 items-center rounded-xl gradient-brand px-4 text-sm font-medium text-white shadow-soft transition-all hover:shadow-glow sm:flex"
            >
              Entrar
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Abrir menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-muted md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <Drawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title="Menu"
        side="left"
      >
        <nav aria-label="Menu móvel" className="flex flex-col gap-1 p-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
          {!user && (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 rounded-xl gradient-brand px-4 py-3 text-center text-sm font-medium text-white"
            >
              Entrar
            </Link>
          )}
        </nav>
      </Drawer>
    </motion.header>
  );
}
