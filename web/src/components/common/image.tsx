import { forwardRef, useState, type ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// Neutral sporty placeholder shown if a remote image ever breaks
const FALLBACK =
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80';

export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** Absolutely fills the nearest positioned parent (mirrors next/image). */
  fill?: boolean;
  /** Eager-loads above-the-fold images. */
  priority?: boolean;
}

/**
 * Plain <img> with lazy loading, graceful error fallback and a
 * next/image-compatible API so components stay framework-agnostic.
 */
const Image = forwardRef<HTMLImageElement, ImageProps>(
  ({ fill, priority, className, alt = '', src, ...props }, ref) => {
    const [failed, setFailed] = useState(false);

    return (
      <img
        ref={ref}
        src={failed ? FALLBACK : src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => setFailed(true)}
        className={cn(fill && 'absolute inset-0 h-full w-full', className)}
        {...props}
      />
    );
  }
);

Image.displayName = 'Image';

export default Image;
