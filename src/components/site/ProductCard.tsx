import { Heart, ShoppingBag } from "lucide-react";
import type { Product } from "@/data/mock";

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
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <article className="group bg-card rounded-3xl overflow-hidden shadow-card hover:shadow-hover transition-all hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          width={768}
          height={768}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {product.badge && (
          <span className={`absolute top-3 right-3 ${badgeStyles[product.badge]} text-xs font-bold px-3 py-1.5 rounded-full shadow-soft`}>
            {product.badge === "sale" ? `${badgeText.sale} ${discount}%` : badgeText[product.badge]}
          </span>
        )}
        <button className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-pink hover:scale-110 transition-all" aria-label="أضف للمفضلة">
          <Heart className="w-4 h-4 text-navy" />
        </button>
        {product.stock <= 5 && (
          <div className="absolute bottom-3 left-3 right-3 bg-destructive/90 text-white text-[11px] font-bold px-3 py-1.5 rounded-full text-center backdrop-blur">
            ⚡ باقي {product.stock} قطع فقط
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <h3 className="font-bold text-navy line-clamp-1">{product.name}</h3>

        <div className="flex items-center gap-1.5">
          {product.colors.map((c) => (
            <span
              key={c}
              className="w-4 h-4 rounded-full border-2 border-white shadow-sm ring-1 ring-border"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-navy">{product.price}</span>
              <span className="text-xs text-muted-foreground">ج.م</span>
            </div>
            {product.oldPrice && (
              <span className="text-sm text-muted-foreground line-through">{product.oldPrice} ج.م</span>
            )}
          </div>
          <button className="w-11 h-11 rounded-2xl bg-gradient-pink hover:scale-110 transition-transform flex items-center justify-center shadow-soft" aria-label="أضف للسلة">
            <ShoppingBag className="w-5 h-5 text-navy" />
          </button>
        </div>
      </div>
    </article>
  );
}
