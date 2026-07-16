import { Suspense, useState } from 'react';
import Link from '@/components/common/link';
import { useRouter, useSearchParams } from '@/lib/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '@/services/auth.service';
import { toast } from '@/stores/toast-store';
import { getApiErrorMessage } from '@/lib/api';
import { AuthCard } from '@/features/auth/auth-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const schema = z
  .object({
    password: z.string().min(8, 'Mínimo de 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  });

type Values = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get('token') ?? '';
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    setLoading(true);
    try {
      await authService.resetPassword({ token, password: values.password });
      toast.success('Senha redefinida!', 'Entre com a nova senha.');
      router.push('/login');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Nova senha"
      description="Escolha uma nova senha para a sua conta."
      footer={
        <Link href="/login" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
          Voltar para o login
        </Link>
      }
    >
      {token ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Nova senha"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirmar nova senha"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" size="lg" className="w-full" isLoading={loading}>
            Redefinir senha
          </Button>
        </form>
      ) : (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Link inválido. Solicite uma nova recuperação de senha.
        </p>
      )}
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
