import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addressService } from '@/services/account.service';
import { toast } from '@/stores/toast-store';
import { getApiErrorMessage } from '@/lib/api';
import { formatZipCode } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Address } from '@/types';

const addressSchema = z.object({
  label: z.string().min(1, 'Informe um nome').max(30),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  street: z.string().min(2, 'Informe a rua'),
  number: z.string().min(1, 'Informe o número'),
  complement: z.string().optional(),
  district: z.string().min(2, 'Informe o bairro'),
  city: z.string().min(2, 'Informe a cidade'),
  state: z.string().length(2, 'UF com 2 letras'),
  isDefault: z.boolean(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressFormProps {
  address?: Address;
  onSuccess?: (address: Address) => void;
  onCancel?: () => void;
}

export function AddressForm({ address, onSuccess, onCancel }: AddressFormProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: address
      ? { ...address, complement: address.complement ?? '' }
      : { label: 'Casa', isDefault: true, state: '' },
  });

  const mutation = useMutation({
    mutationFn: (values: AddressFormValues) =>
      address
        ? addressService.update(address.id, { ...values, complement: values.complement || null })
        : addressService.create({ ...values, complement: values.complement || null }),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success(address ? 'Endereço atualizado' : 'Endereço adicionado');
      onSuccess?.(saved);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Identificação" placeholder="Casa, Trabalho…" error={errors.label?.message} {...register('label')} />
        <Input
          label="CEP"
          placeholder="00000-000"
          inputMode="numeric"
          error={errors.zipCode?.message}
          {...register('zipCode', {
            onChange: (e) => setValue('zipCode', formatZipCode(e.target.value)),
          })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_130px]">
        <Input label="Rua" error={errors.street?.message} {...register('street')} />
        <Input label="Número" error={errors.number?.message} {...register('number')} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Complemento (opcional)" {...register('complement')} />
        <Input label="Bairro" error={errors.district?.message} {...register('district')} />
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_110px]">
        <Input label="Cidade" error={errors.city?.message} {...register('city')} />
        <Input
          label="UF"
          maxLength={2}
          placeholder="SP"
          error={errors.state?.message}
          {...register('state', {
            onChange: (e) => setValue('state', e.target.value.toUpperCase()),
          })}
        />
      </div>
      <label className="flex cursor-pointer items-center gap-2.5 text-sm">
        <input type="checkbox" className="h-4 w-4 rounded accent-brand-600" {...register('isDefault')} />
        Definir como endereço padrão
      </label>
      <div className="flex gap-2 pt-2">
        <Button type="submit" isLoading={mutation.isPending}>
          {address ? 'Salvar alterações' : 'Adicionar endereço'}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
