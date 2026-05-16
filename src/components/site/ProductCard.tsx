import { Link } from "@tanstack/react-router";
import type { Database } from "@/integrations/supabase/types";
import { fmtEGP } from "@/lib/format";

type Product = Database["public"]["Tables"]["products"]["Row"];

const badgeStyles: Record<string, string> = {
  new: "bg-mint text-navy",
  bestseller: "bg-sunny text-navy",
  sale: "bg-pink text-navy",
};
const badgeText: Record<string, string> = {
  new: "جديد ✨",
  bestseller: "الأكثر مبيعاً 🔥",
  sale: "خصم",
};

export function ProductCard({ product }: { product: Product }) {
  const discount = product.old_price
    ? Math.round(((Number(product.old_price) - Number(product.price)) / Number(product.old_price)) * 100)
    : 0;
  const img = product.images?.[0];

  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="group bg-card rounded-3xl overflow-hidden shadow-card hover:shadow-hover transition-all hover:-translate-y-1 block"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {img && (
          <img
            src={img}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        )}
        {product.badge && (
          <span className={`absolute top-3 right-3 ${badgeStyles[product.badge]} text-xs font-bold px-3 py-1.5 rounded-full shadow-soft`}>
            {product.badge === "sale" ? `${badgeText.sale} ${discount}%` : badgeText[product.badge]}
          </span>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <div className="absolute bottom-3 left-3 right-3 bg-destructive/90 text-white text-[11px] font-bold px-3 py-1.5 rounded-full text-center backdrop-blur">
            ⚡ باقي {product.stock} قطع فقط
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-navy font-bold px-4 py-2 rounded-2xl">نفذ المخزون</span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-bold text-navy line-clamp-1">{product.name}</h3>
        <div className="flex items-center gap-1.5">
          {product.colors?.slice(0, 4).map((c) => (
            <span key={c} className="w-4 h-4 rounded-full border-2 border-white shadow-sm ring-1 ring-border" style={{ backgroundColor: c }} />
          ))}
        </div>
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-xl font-extrabold text-navy">{fmtEGP(product.price)}</span>
          {product.old_price && (
            <span className="text-sm text-muted-foreground line-through">{fmtEGP(product.old_price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
