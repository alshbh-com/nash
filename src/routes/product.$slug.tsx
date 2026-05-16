import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchProductBySlug } from "@/lib/queries";
import { fmtEGP } from "@/lib/format";
import { useCart } from "@/contexts/cart";
import { ShoppingBag, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$slug")({
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
  });

  const [imgIdx, setImgIdx] = useState(0);
  const [size, setSize] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [qty, setQty] = useState(1);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-20"><div className="aspect-square max-w-md mx-auto bg-muted rounded-3xl animate-pulse" /></div>;
  }
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-navy">المنتج غير موجود</h1>
        <Link to="/" className="text-pink mt-4 inline-block">← العودة للرئيسية</Link>
      </div>
    );
  }

  const sizes: string[] = product.sizes ?? [];
  const colors: string[] = product.colors ?? [];
  const images: string[] = product.images ?? [];
  const discount = product.old_price
    ? Math.round(((Number(product.old_price) - Number(product.price)) / Number(product.old_price)) * 100)
    : 0;

  const handleAdd = (goCheckout = false) => {
    if (sizes.length && !size) { toast.error("اختر المقاس أولاً"); return; }
    if (colors.length && !color) { toast.error("اختر اللون أولاً"); return; }
    add({
      productId: product.id,
      name: product.name,
      image: images[0] ?? "",
      price: Number(product.price),
      size: size || "—",
      color: color || "—",
      qty,
    });
    toast.success("تمت الإضافة للسلة 🎉");
    if (goCheckout) navigate({ to: "/cart" });
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <nav className="text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-pink">الرئيسية</Link> / {product.name}
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <div className="aspect-square rounded-3xl overflow-hidden bg-muted shadow-card">
            {images[imgIdx] && <img src={images[imgIdx]} alt={product.name} className="w-full h-full object-cover" />}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {images.map((src, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={`w-20 h-20 rounded-2xl overflow-hidden border-2 ${i === imgIdx ? "border-pink" : "border-transparent"}`}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          {product.badge && (
            <span className="inline-block bg-pink text-navy text-xs font-bold px-3 py-1.5 rounded-full">
              {product.badge === "sale" ? `خصم ${discount}%` : product.badge === "new" ? "جديد ✨" : "الأكثر مبيعاً 🔥"}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl font-extrabold text-navy">{product.name}</h1>
          {product.short_description && <p className="text-muted-foreground">{product.short_description}</p>}

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-navy">{fmtEGP(product.price)}</span>
            {product.old_price && <span className="text-xl text-muted-foreground line-through">{fmtEGP(product.old_price)}</span>}
          </div>

          {product.stock > 0 && product.stock <= 5 && (
            <div className="bg-destructive/10 text-destructive text-sm font-bold px-4 py-2 rounded-2xl inline-block">
              ⚡ باقي {product.stock} قطع فقط
            </div>
          )}

          {sizes.length > 0 && (
            <div>
              <div className="font-bold text-navy mb-2">المقاس (بالعمر)</div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button key={s} onClick={() => setSize(s)}
                    className={`px-4 py-2 rounded-2xl border-2 text-sm font-semibold transition-all ${size === s ? "border-pink bg-pink text-navy" : "border-border bg-white hover:border-pink"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {colors.length > 0 && (
            <div>
              <div className="font-bold text-navy mb-2">اللون</div>
              <div className="flex gap-3">
                {colors.map((c) => (
                  <button key={c} onClick={() => setColor(c)} aria-label={c}
                    className={`w-10 h-10 rounded-full border-4 transition-all ${color === c ? "border-pink scale-110" : "border-white shadow-sm ring-1 ring-border"}`}
                    style={{ backgroundColor: c }}>
                    {color === c && <Check className="w-4 h-4 text-navy mx-auto" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="font-bold text-navy">الكمية:</div>
            <div className="flex items-center gap-2 bg-white rounded-2xl border-2 border-border px-2">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 font-bold text-lg">−</button>
              <span className="w-10 text-center font-bold">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="w-9 h-9 font-bold text-lg">+</button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button disabled={product.stock === 0} onClick={() => handleAdd(false)}
              className="flex-1 min-w-40 bg-navy text-white px-6 py-4 rounded-2xl font-bold shadow-soft hover:shadow-hover hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              <ShoppingBag className="w-5 h-5" /> أضف للسلة
            </button>
            <button disabled={product.stock === 0} onClick={() => handleAdd(true)}
              className="flex-1 min-w-40 bg-gradient-pink text-navy px-6 py-4 rounded-2xl font-bold shadow-soft hover:scale-[1.02] transition-all disabled:opacity-50">
              اشتري الآن
            </button>
          </div>

          {product.description && (
            <div className="bg-white rounded-3xl p-6 shadow-card mt-4">
              <h3 className="font-bold text-navy mb-2">تفاصيل المنتج</h3>
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
