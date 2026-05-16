import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchCategoryBySlug, fetchProducts } from "@/lib/queries";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/category/$slug")({
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data: category } = useQuery({ queryKey: ["category", slug], queryFn: () => fetchCategoryBySlug(slug) });
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", "cat", category?.id],
    queryFn: () => fetchProducts({ categoryId: category!.id }),
    enabled: !!category?.id,
  });

  if (!category && !isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-navy">القسم غير موجود</h1>
        <Link to="/" className="text-pink mt-4 inline-block">← العودة للرئيسية</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <nav className="text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-pink">الرئيسية</Link> / {category?.name}
      </nav>
      <div className="bg-gradient-pink rounded-3xl p-8 md:p-12 mb-10 text-center shadow-card">
        <div className="text-7xl mb-3">{category?.emoji}</div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-navy">{category?.name}</h1>
        <p className="text-navy/70 mt-2">{products.length} منتج متاح</p>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[3/4] bg-muted rounded-3xl animate-pulse" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">لا توجد منتجات في هذا القسم حالياً</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
