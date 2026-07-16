import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { wishlistService } from '@/services/account.service';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from '@/stores/toast-store';
import { getApiErrorMessage } from '@/lib/api';

export function useWishlist() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistService.list(),
    enabled: Boolean(user),
  });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const mutation = useMutation({
    mutationFn: (productId: string) => wishlistService.toggle(productId),
    onSuccess: ({ wished }) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success(wished ? 'Adicionado aos favoritos ❤️' : 'Removido dos favoritos');
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  return {
    toggle: (productId: string) => {
      if (!user) {
        toast.info('Faça login para salvar favoritos');
        return;
      }
      mutation.mutate(productId);
    },
    isPending: mutation.isPending,
  };
}

export function useIsWished(productId: string) {
  const { data } = useWishlist();
  return data?.some((item) => item.product.id === productId) ?? false;
}
