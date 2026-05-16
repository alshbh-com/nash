import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/contexts/cart";
import { fmtEGP } from "@/lib/format";
import { fetchShipping, validateCoupon } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({ meta: [{ title: "إتمام الشراء — ناصح" }] }),
});

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const { data: rates = [] } = useQuery({ queryKey: ["shipping"], queryFn: fetchShipping });

  const [form, setForm] = useState({ name: "", phone: "", governorate: "", address: "", notes: "" });
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const shipping = useMemo(() => {
    const r = rates.find((x) => x.governorate === form.governorate);
    return r ? Number(r.cost) : 0;
  }, [rates, form.governorate]);

  const discount = appliedCoupon ? Math.round((subtotal * appliedCoupon.percent) / 100) : 0;
  const total = Math.max(0, subtotal - discount) + shipping;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">السلة فاضية</p>
        <Link to="/" className="text-pink font-bold">← العودة للرئيسية</Link>
      </div>
    );
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    const c = await validateCoupon(couponCode.trim());
    if (!c) { toast.error("الكوبون غير صالح"); return; }
    setAppliedCoupon({ code: c.code, percent: c.percent });
    toast.success(`تم تطبيق خصم ${c.percent}%`);
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.governorate || !form.address) {
      toast.error("املئي كل البيانات المطلوبة"); return;
    }
    if (!/^01[0-2,5]\d{8}$/.test(form.phone)) {
      toast.error("رقم الموبايل غير صحيح"); return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc("create_order_with_items", {
        _customer_name: form.name.trim(),
        _phone: form.phone.trim(),
        _governorate: form.governorate,
        _address: form.address.trim(),
        _notes: form.notes.trim() || "",
        _subtotal: subtotal,
        _shipping_cost: shipping,
        _discount: discount,
        _total: total,
        _coupon_code: appliedCoupon?.code ?? "",
        _items: items.map((it) => ({
          product_id: it.productId,
          product_name: it.name,
          product_image: it.image,
          size: it.size,
          color: it.color,
          qty: it.qty,
          unit_price: it.price,
        })),
      });
      if (error) throw error;
      const orderNumber = Array.isArray(data) ? data[0]?.order_number : (data as { order_number: string } | null)?.order_number;
      if (!orderNumber) throw new Error("لم يتم إنشاء الطلب");

      clear();
      navigate({ to: "/order/$number", params: { number: orderNumber } });
    } catch (err) {
      console.error(err);
      toast.error("حصل خطأ، جرّبي تاني");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-bold text-navy mb-8">إتمام الشراء</h1>
      <form onSubmit={placeOrder} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4 bg-card rounded-3xl p-6 shadow-card">
          <h2 className="text-xl font-bold text-navy">بيانات التوصيل</h2>
          <Field label="الاسم بالكامل *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="رقم الموبايل *" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="01xxxxxxxxx" />
          <div>
            <label className="block text-sm font-bold text-navy mb-1.5">المحافظة *</label>
            {rates.length === 0 ? (
              <div className="px-4 py-3 rounded-2xl border-2 border-dashed border-border bg-muted text-sm text-muted-foreground">
                لا توجد محافظات متاحة للشحن حالياً
              </div>
            ) : (
              <select required value={form.governorate} onChange={(e) => setForm({ ...form, governorate: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border-2 border-border bg-white focus:border-pink outline-none">
                <option value="">اختر المحافظة</option>
                {rates.map((r) => (
                  <option key={r.id} value={r.governorate}>
                    {r.governorate} — شحن {fmtEGP(Number(r.cost))}
                  </option>
                ))}
              </select>
            )}
            {form.governorate && (
              <div className="text-xs text-muted-foreground mt-1.5">سعر الشحن: {fmtEGP(shipping)}</div>
            )}
          </div>
          <Field label="العنوان بالتفصيل *" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
          <div>
            <label className="block text-sm font-bold text-navy mb-1.5">ملاحظات (اختياري)</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3}
              className="w-full px-4 py-3 rounded-2xl border-2 border-border bg-white focus:border-pink outline-none" />
          </div>
          <div className="bg-mint/30 rounded-2xl p-4 text-sm">
            💵 الدفع عند الاستلام فقط
          </div>
        </div>

        <aside className="bg-card rounded-3xl p-6 shadow-card h-fit sticky top-24 space-y-4">
          <h2 className="text-xl font-bold text-navy">ملخص الطلب</h2>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {items.map((it) => (
              <div key={`${it.productId}-${it.size}-${it.color}`} className="flex gap-2 text-sm">
                <img src={it.image} alt="" className="w-12 h-12 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="line-clamp-1 font-semibold">{it.name}</div>
                  <div className="text-xs text-muted-foreground">{it.qty} × {fmtEGP(it.price)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex gap-2">
              <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="كود الخصم"
                className="flex-1 px-3 py-2 rounded-xl border-2 border-border bg-white text-sm" />
              <button type="button" onClick={applyCoupon} className="bg-sunny text-navy px-4 py-2 rounded-xl font-bold text-sm">تطبيق</button>
            </div>
            {appliedCoupon && <div className="text-xs text-green-700">✓ {appliedCoupon.code} (-{appliedCoupon.percent}%)</div>}
          </div>

          <div className="border-t pt-4 space-y-2 text-sm">
            <Row label="الإجمالي الفرعي" value={fmtEGP(subtotal)} />
            {discount > 0 && <Row label="الخصم" value={`- ${fmtEGP(discount)}`} className="text-green-700" />}
            <Row label="الشحن" value={shipping ? fmtEGP(shipping) : "—"} />
            <div className="border-t pt-2 flex justify-between text-lg font-extrabold text-navy">
              <span>الإجمالي</span><span>{fmtEGP(total)}</span>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="w-full bg-navy text-white px-6 py-4 rounded-2xl font-bold shadow-soft hover:scale-[1.02] transition-all disabled:opacity-50">
            {submitting ? "جاري إرسال الطلب..." : "تأكيد الطلب 🎉"}
          </button>
        </aside>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-bold text-navy mb-1.5">{label}</label>
      <input required value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-2xl border-2 border-border bg-white focus:border-pink outline-none" />
    </div>
  );
}

function Row({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return <div className={`flex justify-between ${className}`}><span>{label}</span><span>{value}</span></div>;
}
