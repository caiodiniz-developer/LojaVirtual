import { Suspense, useState } from 'react';
import Link from '@/components/common/link';
import { useRouter, useSearchParams } from '@/lib/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/stores/toast-store';
import { getApiErrorMessage } from '@/lib/api';
import { AuthCard } from '@/features/auth/auth-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
});

type LoginValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get('next') ?? '/';
  const { setSession } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    setLoading(true);
    try {
      const session = await authService.login(values);
      setSession(session);
      toast.success(`Bem-vindo de volta, ${session.user.name.split(' ')[0]}! 👋`);
      router.push(session.user.role === 'ADMIN' ? '/admin' : next);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Entre na sua conta"
      description="Acesse seus pedidos, favoritos e ofertas exclusivas."
      footer={
        <>
          Ainda não tem conta?{' '}
          <Link
            href="/register"
            className="font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            Criar conta grátis
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="voce@email.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <div className="relative">
          <Input
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            className="absolute right-3 top-9 text-muted-foreground transition-colors hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground transition-colors hover:text-brand-600 dark:hover:text-brand-400"
          >
            Esqueceu a senha?
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full" isLoading={loading}>
          Entrar
        </Button>
        <p className="rounded-xl bg-muted/60 p-3 text-center text-xs text-muted-foreground"></p>
      </form>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
