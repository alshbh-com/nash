import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fmtEGP } from "@/lib/format";
import { toast } from "sonner";
import { Eye, X } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({ component: OrdersPage });

const STATUS = [
  { id: "all", label: "الكل" },
  { id: "pending", label: "قيد المعالجة" },
  { id: "confirmed", label: "تم التأكيد" },
  { id: "shipped", label: "تم الشحن" },
  { id: "delivered", label: "تم التسليم" },
  { id: "cancelled", label: "ملغي" },
];

function OrdersPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders-full"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!o.order_number.toLowerCase().includes(s) && !o.customer_name.toLowerCase().includes(s) && !o.phone.includes(s))
          return false;
      }
      return true;
    });
  }, [orders, filter, search]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("تم تحديث الحالة");
    qc.invalidateQueries({ queryKey: ["admin-orders-full"] });
  };

  const current = selected ? orders.find((o) => o.id === selected) : null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-navy">الطلبات</h1>

      <div className="bg-card rounded-3xl p-4 shadow-card space-y-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحثي برقم الطلب أو الاسم أو الهاتف"
          className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-white" />
        <div className="flex flex-wrap gap-2">
          {STATUS.map((s) => (
            <button key={s.id} onClick={() => setFilter(s.id)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full ${filter === s.id ? "bg-navy text-white" : "bg-muted"}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-3xl shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-right text-xs text-muted-foreground bg-muted/40">
            <tr>
              <th className="p-3">رقم</th><th>العميل</th><th>الهاتف</th><th>المحافظة</th>
              <th>الإجمالي</th><th>الحالة</th><th>التاريخ</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">لا توجد طلبات</td></tr>}
            {filtered.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="p-3 font-bold">{o.order_number}</td>
                <td>{o.customer_name}</td>
                <td className="text-xs">{o.phone}</td>
                <td className="text-xs">{o.governorate}</td>
                <td className="font-bold">{fmtEGP(o.total)}</td>
                <td><span className="text-xs bg-muted px-2 py-1 rounded-full">{STATUS.find((s) => s.id === o.status)?.label ?? o.status}</span></td>
                <td className="text-xs">{new Date(o.created_at).toLocaleDateString("ar-EG")}</td>
                <td><button onClick={() => setSelected(o.id)} className="p-2 hover:bg-muted rounded-lg"><Eye className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {current && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-card rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-navy">طلب {current.order_number}</h2>
              <button onClick={() => setSelected(null)}><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4 text-sm">
              <section className="bg-muted/40 rounded-2xl p-4">
                <h3 className="font-bold mb-2">بيانات العميل</h3>
                <div><b>الاسم:</b> {current.customer_name}</div>
                <div><b>الهاتف:</b> {current.phone}</div>
                <div><b>المحافظة:</b> {current.governorate}</div>
                <div><b>العنوان:</b> {current.address}</div>
                {current.notes && <div><b>ملاحظات:</b> {current.notes}</div>}
              </section>

              <section>
                <h3 className="font-bold mb-2">المنتجات</h3>
                <div className="space-y-2">
                  {current.order_items?.map((it) => (
                    <div key={it.id} className="flex gap-3 bg-muted/30 rounded-xl p-2">
                      {it.product_image && <img src={it.product_image} alt="" className="w-14 h-14 rounded-lg object-cover" />}
                      <div className="flex-1 text-xs">
                        <div className="font-bold">{it.product_name}</div>
                        <div className="text-muted-foreground">{it.size} / {it.color} × {it.qty}</div>
                      </div>
                      <div className="font-bold text-sm">{fmtEGP(Number(it.qty) * Number(it.unit_price))}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-muted/40 rounded-2xl p-4 space-y-1">
                <Row label="المجموع" value={fmtEGP(current.subtotal)} />
                <Row label="الشحن" value={fmtEGP(current.shipping_cost)} />
                {Number(current.discount) > 0 && <Row label="الخصم" value={`- ${fmtEGP(current.discount)}`} />}
                {current.coupon_code && <Row label="كوبون" value={current.coupon_code} />}
                <div className="border-t pt-2 flex justify-between font-extrabold text-lg text-navy">
                  <span>الإجمالي</span><span>{fmtEGP(current.total)}</span>
                </div>
              </section>

              <section>
                <h3 className="font-bold mb-2">تغيير الحالة</h3>
                <select value={current.status} onChange={(e) => updateStatus(current.id, e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-border bg-white">
                  {STATUS.filter((s) => s.id !== "all").map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><b>{value}</b></div>;
}
