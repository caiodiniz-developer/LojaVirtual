import { useEffect } from 'react';

const SITE_NAME = 'ShopSphere';
const DEFAULT_DESCRIPTION =
  'E-commerce moderno com tecnologia, moda, casa e muito mais. Frete simulado, cupons e as melhores ofertas.';

/** SPA equivalent of per-page metadata: keeps <title> and description in sync. */
export function usePageMeta(title?: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Descubra o novo em cada compra`;

    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (meta) meta.content = description ?? DEFAULT_DESCRIPTION;

    return () => {
      document.title = `${SITE_NAME} — Descubra o novo em cada compra`;
    };
  }, [title, description]);
}
