import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fmtEGP } from "@/lib/format";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/order/$number")({
  component: OrderPage,
  head: () => ({ meta: [{ title: "تأكيد الطلب — ناصح" }] }),
});

function OrderPage() {
  const { number } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["order-public", number],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_order_public", { _order_number: number });
      if (error) throw error;
      return data?.[0];
    },
  });

  if (isLoading) return <div className="container mx-auto px-4 py-20 text-center">جاري التحميل...</div>;
  if (!data) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-navy">الطلب غير موجود</h1>
      <Link to="/" className="text-pink mt-4 inline-block">← العودة للرئيسية</Link>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="bg-card rounded-3xl p-8 md:p-10 shadow-card text-center">
        <div className="w-20 h-20 mx-auto bg-mint rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-12 h-12 text-navy" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-navy mb-2">تم استلام طلبك! 🎉</h1>
        <p className="text-muted-foreground mb-6">هنتواصل معاكي قريباً جداً لتأكيد الطلب</p>

        <div className="bg-gradient-sunny rounded-2xl p-4 mb-6">
          <div className="text-xs text-navy/70">رقم الطلب</div>
          <div className="text-2xl font-extrabold text-navy">{data.order_number}</div>
        </div>

        <div className="text-right space-y-3 bg-muted/40 rounded-2xl p-5">
          <Row label="الاسم" value={data.customer_name} />
          <Row label="الموبايل" value={data.phone} />
          <Row label="المحافظة" value={data.governorate} />
          <Row label="العنوان" value={data.address} />
          <div className="border-t pt-3 space-y-2">
            <Row label="الإجمالي الفرعي" value={fmtEGP(data.subtotal)} />
            {Number(data.discount) > 0 && <Row label="الخصم" value={`- ${fmtEGP(data.discount)}`} />}
            <Row label="الشحن" value={fmtEGP(data.shipping_cost)} />
            <div className="flex justify-between text-lg font-extrabold text-navy pt-2 border-t">
              <span>الإجمالي</span><span>{fmtEGP(data.total)}</span>
            </div>
          </div>
        </div>

        <div className="bg-mint/30 rounded-2xl p-4 mt-6 text-sm text-navy">💵 الدفع عند الاستلام</div>

        <Link to="/" className="inline-block mt-6 bg-navy text-white px-6 py-3 rounded-2xl font-bold">العودة للرئيسية</Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return <div className="flex justify-between text-sm"><span className="text-muted-foreground">{label}</span><span className="font-bold text-navy">{value}</span></div>;
}
