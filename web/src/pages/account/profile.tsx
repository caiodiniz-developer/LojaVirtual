import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/stores/toast-store';
import { getApiErrorMessage } from '@/lib/api';
import { getInitials, formatDate } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const profileSchema = z.object({
  name: z.string().min(2, 'Informe seu nome'),
});

type ProfileValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: { name: user?.name ?? '' },
  });

  async function onSubmit(values: ProfileValues) {
    setLoading(true);
    try {
      const updated = await authService.updateMe(values);
      updateUser(updated);
      toast.success('Perfil atualizado!');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-brand text-xl font-bold text-white shadow-glow">
          {getInitials(user.name)}
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold">{user.name}</h1>
          <p className="text-sm text-muted-foreground">
            Membro desde {formatDate(user.createdAt)}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados pessoais</CardTitle>
          <CardDescription>Atualize as informações da sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4" noValidate>
            <Input label="Nome" error={errors.name?.message} {...register('name')} />
            <Input label="E-mail" value={user.email} disabled hint="O e-mail não pode ser alterado." />
            <Button type="submit" isLoading={loading}>
              Salvar alterações
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
