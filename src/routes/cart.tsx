import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/contexts/cart";
import { fmtEGP } from "@/lib/format";
import { Trash2, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({ meta: [{ title: "سلة التسوق — ناصح" }] }),
});

function CartPage() {
  const { items, remove, updateQty, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-7xl mb-4">🛒</div>
        <h1 className="text-3xl font-bold text-navy mb-2">السلة فاضية</h1>
        <p className="text-muted-foreground mb-6">يلا نضيف حاجة حلوة لصغيرك</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-navy text-white px-6 py-3 rounded-2xl font-bold">
          <ShoppingBag className="w-5 h-5" /> ابدئي التسوق
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-bold text-navy mb-8">سلة التسوق ({items.length})</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((it) => (
            <div key={`${it.productId}-${it.size}-${it.color}`} className="bg-card rounded-3xl p-4 shadow-card flex gap-4 items-center">
              <img src={it.image} alt={it.name} className="w-24 h-24 rounded-2xl object-cover bg-muted" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-navy line-clamp-1">{it.name}</h3>
                <div className="text-xs text-muted-foreground mt-1">
                  المقاس: {it.size} · اللون:
                  <span className="inline-block w-3 h-3 rounded-full mx-1 align-middle" style={{ backgroundColor: it.color }} />
                </div>
                <div className="font-bold text-navy mt-2">{fmtEGP(it.price)}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button onClick={() => remove(it.productId, it.size, it.color)} className="text-destructive hover:scale-110 transition-transform" aria-label="حذف">
                  <Trash2 className="w-5 h-5" />
                </button>
                <div className="flex items-center bg-white rounded-2xl border-2 border-border px-1">
                  <button onClick={() => updateQty(it.productId, it.size, it.color, it.qty - 1)} className="w-8 h-8 font-bold">−</button>
                  <span className="w-8 text-center font-bold text-sm">{it.qty}</span>
                  <button onClick={() => updateQty(it.productId, it.size, it.color, it.qty + 1)} className="w-8 h-8 font-bold">+</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="bg-card rounded-3xl p-6 shadow-card h-fit sticky top-24 space-y-4">
          <h2 className="text-xl font-bold text-navy">ملخص الطلب</h2>
          <div className="flex justify-between text-muted-foreground">
            <span>الإجمالي الفرعي</span><span>{fmtEGP(subtotal)}</span>
          </div>
          <div className="text-xs text-muted-foreground">الشحن يحسب عند إدخال المحافظة</div>
          <div className="border-t pt-4 flex justify-between text-lg font-extrabold text-navy">
            <span>الإجمالي</span><span>{fmtEGP(subtotal)}</span>
          </div>
          <Link to="/checkout" className="block w-full text-center bg-navy text-white px-6 py-4 rounded-2xl font-bold shadow-soft hover:shadow-hover hover:scale-[1.02] transition-all">
            إتمام الشراء ←
          </Link>
        </aside>
      </div>
    </div>
  );
}
