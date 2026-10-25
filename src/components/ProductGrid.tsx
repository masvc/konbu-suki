import { ProductCard } from "./ProductCard";

type Product = {
  id: number;
  name: string;
  brand: string;
  category: string;
  price?: number | null;
  imageUrl?: string | null;
  origin?: string | null;
  rating?: number | null;
};

type Props = {
  products: Product[];
  columns?: 2 | 3 | 4;
};

export function ProductGrid({ products, columns = 4 }: Props) {
  const colClass =
    columns === 2 ? "grid-cols-2" :
    columns === 3 ? "grid-cols-2 sm:grid-cols-3" :
    "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";

  return (
    <div className={`grid ${colClass} gap-3`}>
      {products.map((p) => (
        <ProductCard key={p.id} {...p} />
      ))}
    </div>
  );
}
