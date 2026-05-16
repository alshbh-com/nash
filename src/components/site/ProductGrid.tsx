import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/queries";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ categoryId, title }: { categoryId?: string; title?: string }) {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", categoryId ?? "all"],
    queryFn: () => fetchProducts({ categoryId }),
  });

  return (
    <section id="products" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-navy">{title ?? "منتجاتنا المختارة"}</h2>
          <p className="text-muted-foreground mt-2">بحب وعناية لكل صغير 💕</p>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">لا توجد منتجات في هذا القسم حالياً</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
