import { useRouter } from '@/lib/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from '@/stores/toast-store';

export function useAuth() {
  const { user, hydrated, setSession, clearSession, updateUser } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  async function logout() {
    await authService.logout();
    clearSession();
    queryClient.clear();
    toast.info('Você saiu da sua conta');
    router.push('/');
  }

  return {
    user,
    hydrated,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'ADMIN',
    setSession,
    updateUser,
    logout,
  };
}
