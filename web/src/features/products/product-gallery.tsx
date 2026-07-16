import { useState, type MouseEvent } from 'react';
import Image from '@/components/common/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  return (
    <div className="space-y-3">
      <motion.div
        key={selected}
        initial={{ opacity: 0.4 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="relative aspect-square cursor-zoom-in overflow-hidden rounded-3xl bg-muted"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={handleMouseMove}
      >
        {images[selected] && (
          <Image
            src={images[selected]}
            alt={`${title} — imagem ${selected + 1}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-200"
            style={{
              transformOrigin: origin,
              transform: zoom ? 'scale(1.8)' : 'scale(1)',
            }}
          />
        )}
      </motion.div>

      {images.length > 1 && (
        <div role="tablist" aria-label="Imagens do produto" className="flex gap-2.5">
          {images.map((image, index) => (
            <button
              key={image}
              role="tab"
              aria-selected={index === selected}
              aria-label={`Ver imagem ${index + 1}`}
              onClick={() => setSelected(index)}
              className={cn(
                'relative h-20 w-20 overflow-hidden rounded-xl bg-muted ring-2 ring-offset-2 ring-offset-background transition-all',
                index === selected ? 'ring-brand-500' : 'ring-transparent opacity-70 hover:opacity-100'
              )}
            >
              <Image src={image} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
