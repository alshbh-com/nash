import { products } from "@/data/mock";
import { ProductCard } from "./ProductCard";

export function ProductGrid() {
  return (
    <section id="products" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-navy">منتجاتنا المختارة</h2>
          <p className="text-muted-foreground mt-2">بحب وعناية لكل صغير 💕</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
