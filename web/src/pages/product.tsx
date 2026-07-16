import { useParams } from 'react-router-dom';
import { ProductDetail } from '@/features/products/product-detail';

export default function ProductPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  return <ProductDetail slug={slug} />;
}
