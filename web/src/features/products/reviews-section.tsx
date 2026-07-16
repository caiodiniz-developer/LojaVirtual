import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, ImagePlus, Loader2, MessageSquare, ThumbsUp, X } from 'lucide-react';
import Image from '@/components/common/image';
import { productService } from '@/services/product.service';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/stores/toast-store';
import { getApiErrorMessage } from '@/lib/api';
import { cn, formatDate, getInitials } from '@/lib/utils';
import { RatingStars } from '@/components/ui/rating-stars';
import { Button } from '@/components/ui/button';
import { Textarea, Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import type { RatingBucket } from '@/types';

type SortKey = 'recent' | 'helpful' | 'rating';

function RatingHistogram({ distribution, total }: { distribution: RatingBucket[]; total: number }) {
  return (
    <div className="space-y-1.5">
      {distribution.map((bucket) => {
        const pct = total > 0 ? (bucket.count / total) * 100 : 0;
        return (
          <div key={bucket.rating} className="flex items-center gap-2 text-xs">
            <span className="w-6 text-muted-foreground">{bucket.rating}★</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-amber-400 transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-8 text-right tabular-nums text-muted-foreground">{bucket.count}</span>
          </div>
        );
      })}
    </div>
  );
}

export function ReviewsSection({ productId }: { productId: string }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortKey>('recent');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', productId, page, sort],
    queryFn: () => productService.reviews(productId, page, sort),
  });

  const createReview = useMutation({
    mutationFn: () =>
      productService.createReview({ productId, rating, title: title || undefined, comment, images }),
    onSuccess: () => {
      toast.success('Avaliação publicada! ⭐', 'Você ganhou 50 pontos Sphere.');
      setTitle('');
      setComment('');
      setImages([]);
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      queryClient.invalidateQueries({ queryKey: ['loyalty'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const markHelpful = useMutation({
    mutationFn: (reviewId: string) => productService.markReviewHelpful(reviewId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews', productId] }),
  });

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls = await productService.uploadReviewImages(Array.from(files));
      setImages((prev) => [...prev, ...urls].slice(0, 4));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setUploading(false);
    }
  }

  return (
    <section aria-labelledby="reviews-heading" className="space-y-8">
      <h2 id="reviews-heading" className="font-display text-2xl font-bold">
        Avaliações {data ? `(${data.meta.total})` : ''}
      </h2>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          {/* Summary: average + histogram */}
          {data && data.meta.total > 0 && (
            <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-soft sm:flex-row sm:items-center">
              <div className="text-center sm:w-32">
                <p className="font-display text-4xl font-bold">
                  {(
                    data.distribution.reduce((s, b) => s + b.rating * b.count, 0) /
                    Math.max(1, data.meta.total)
                  ).toFixed(1)}
                </p>
                <RatingStars
                  rating={
                    data.distribution.reduce((s, b) => s + b.rating * b.count, 0) /
                    Math.max(1, data.meta.total)
                  }
                  size="sm"
                  className="justify-center"
                />
                <p className="mt-1 text-xs text-muted-foreground">{data.meta.total} avaliações</p>
              </div>
              <div className="flex-1">
                <RatingHistogram distribution={data.distribution} total={data.meta.total} />
              </div>
            </div>
          )}

          {/* Sort */}
          {data && data.meta.total > 0 && (
            <div className="flex gap-1 rounded-xl bg-muted p-1">
              {(
                [
                  ['recent', 'Recentes'],
                  ['helpful', 'Mais úteis'],
                  ['rating', 'Melhor nota'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSort(key);
                    setPage(1);
                  }}
                  className={cn(
                    'flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                    sort === key ? 'bg-card shadow-soft' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}

          {data && data.data.length === 0 && (
            <EmptyState
              icon={MessageSquare}
              title="Ainda sem avaliações"
              description="Seja o primeiro a avaliar este produto."
            />
          )}

          {data?.data.map((review) => (
            <article key={review.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full gradient-brand text-xs font-bold text-white">
                  {getInitials(review.user.name)}
                </span>
                <div className="flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    {review.user.name}
                    {review.verified && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <BadgeCheck className="h-3 w-3" aria-hidden /> Compra verificada
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                </div>
                <RatingStars rating={review.rating} size="sm" />
              </div>
              {review.title && <h3 className="mb-1 text-sm font-semibold">{review.title}</h3>}
              <p className="text-sm leading-relaxed text-muted-foreground">{review.comment}</p>

              {review.images.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {review.images.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative h-16 w-16 overflow-hidden rounded-lg bg-muted"
                    >
                      <Image src={url} alt={`Foto ${i + 1} da avaliação`} fill sizes="64px" className="object-cover" />
                    </a>
                  ))}
                </div>
              )}

              <button
                onClick={() => markHelpful.mutate(review.id)}
                className="mt-3 flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ThumbsUp className="h-3.5 w-3.5" aria-hidden /> Útil ({review.helpfulCount})
              </button>
            </article>
          ))}

          {data && data.meta.hasNextPage && (
            <Button variant="outline" onClick={() => setPage((p) => p + 1)} className="w-full">
              Carregar mais avaliações
            </Button>
          )}
        </div>

        <div className="h-fit rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="mb-4 font-display text-base font-semibold">Avalie este produto</h3>
          {isAuthenticated ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createReview.mutate();
              }}
              className="space-y-4"
            >
              <div>
                <p className="mb-1.5 text-sm font-medium">Sua nota</p>
                <RatingStars rating={rating} interactive onChange={setRating} size="lg" />
              </div>
              <Input
                label="Título (opcional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Resuma sua experiência"
                maxLength={100}
              />
              <Textarea
                label="Comentário"
                required
                minLength={5}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Conte o que achou do produto…"
              />

              {/* Photo upload */}
              <div>
                <p className="mb-1.5 text-sm font-medium">Fotos (opcional)</p>
                <div className="flex flex-wrap gap-2">
                  {images.map((url, i) => (
                    <div key={i} className="group relative h-16 w-16 overflow-hidden rounded-lg bg-muted">
                      <Image src={url} alt="" fill sizes="64px" className="object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                        aria-label="Remover foto"
                        className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {images.length < 4 && (
                    <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-brand-500 hover:text-brand-500">
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ImagePlus className="h-4 w-4" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        onChange={(e) => handleUpload(e.target.files)}
                      />
                    </label>
                  )}
                </div>
              </div>

              <Button type="submit" isLoading={createReview.isPending} className="w-full">
                Publicar avaliação
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Ganhe <strong className="text-brand-600 dark:text-brand-400">50 pontos</strong> ao avaliar.
              </p>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">
              <a href="/login" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
                Entre na sua conta
              </a>{' '}
              para avaliar este produto.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
