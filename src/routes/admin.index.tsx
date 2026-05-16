import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fmtEGP } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

const STATUS_LABEL: Record<string, string> = {
  pending: "قيد المعالجة", confirmed: "تم التأكيد", shipped: "تم الشحن",
  delivered: "تم التسليم", cancelled: "ملغي",
};

function Dashboard() {
  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const { data: productsCount = 0 } = useQuery({
    queryKey: ["admin-products-active-count"],
    queryFn: async () => {
      const { count, error } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("active", true);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const revenue30 = orders.filter((o) => o.status !== "cancelled" && o.created_at >= monthAgo)
    .reduce((a, b) => a + Number(b.total), 0);
  const pending = orders.filter((o) => o.status === "pending").length;
  const recent = orders.slice(0, 8);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold text-navy">الرئيسية</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat title="إجمالي الطلبات" value={orders.length.toString()} bg="bg-gradient-sky" />
        <Stat title="قيد المعالجة" value={pending.toString()} bg="bg-gradient-sunny" />
        <Stat title="منتجات نشطة" value={productsCount.toString()} bg="bg-gradient-mint" />
        <Stat title="إيرادات 30 يوم" value={fmtEGP(revenue30)} bg="bg-gradient-pink" />
      </div>

      <section className="bg-card rounded-3xl p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-navy">آخر الطلبات</h2>
          <Link to="/admin/orders" className="text-sm font-bold text-pink">عرض الكل ←</Link>
        </div>
        {recent.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">لا توجد طلبات بعد</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-right text-xs text-muted-foreground">
                <tr><th className="py-2">رقم الطلب</th><th>العميل</th><th>الإجمالي</th><th>الحالة</th><th>التاريخ</th></tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id} className="border-t border-border">
                    <td className="py-3 font-bold">{o.order_number}</td>
                    <td>{o.customer_name}</td>
                    <td className="font-bold">{fmtEGP(o.total)}</td>
                    <td><span className="text-xs bg-muted px-2 py-1 rounded-full">{STATUS_LABEL[o.status] ?? o.status}</span></td>
                    <td className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("ar-EG")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ title, value, bg }: { title: string; value: string; bg: string }) {
  return (
    <div className={`${bg} rounded-3xl p-5 shadow-card`}>
      <div className="text-sm font-bold text-navy/70">{title}</div>
      <div className="text-2xl font-extrabold text-navy mt-1">{value}</div>
    </div>
  );
}
