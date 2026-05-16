import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fmtEGP, GOVERNORATES } from "@/lib/format";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/shipping")({ component: ShippingPage });

function ShippingPage() {
  const qc = useQueryClient();
  const [gov, setGov] = useState("");
  const [cost, setCost] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: rates = [] } = useQuery({
    queryKey: ["admin-shipping"],
    queryFn: async () => {
      const { data, error } = await supabase.from("shipping_rates").select("*").order("governorate");
      if (error) throw error;
      return data;
    },
  });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gov || !cost) { toast.error("اختر محافظة وسعر"); return; }
    setBusy(true);
    // upsert by governorate
    const existing = rates.find((r) => r.governorate === gov);
    const { error } = existing
      ? await supabase.from("shipping_rates").update({ cost: Number(cost) }).eq("id", existing.id)
      : await supabase.from("shipping_rates").insert({ governorate: gov, cost: Number(cost) });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("تم الحفظ");
    setGov(""); setCost("");
    qc.invalidateQueries({ queryKey: ["admin-shipping"] });
    qc.invalidateQueries({ queryKey: ["shipping"] });
  };

  const remove = async (id: string) => {
    if (!confirm("حذف هذه المحافظة؟")) return;
    const { error } = await supabase.from("shipping_rates").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("تم الحذف");
    qc.invalidateQueries({ queryKey: ["admin-shipping"] });
    qc.invalidateQueries({ queryKey: ["shipping"] });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-navy">إدارة الشحن</h1>
      <p className="text-sm text-muted-foreground">سعر المحافظة يُضاف تلقائياً على سعر المنتجات عند الدفع.</p>

      <form onSubmit={add} className="bg-card rounded-3xl p-5 shadow-card grid sm:grid-cols-[1fr_1fr_auto] gap-3">
        <div>
          <label className="block text-xs font-bold text-navy mb-1">المحافظة</label>
          <select value={gov} onChange={(e) => setGov(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border-2 border-border bg-white text-sm">
            <option value="">اختر المحافظة</option>
            {GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-navy mb-1">سعر الشحن (جنيه)</label>
          <input type="number" value={cost} onChange={(e) => setCost(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border-2 border-border bg-white text-sm" />
        </div>
        <button type="submit" disabled={busy} className="bg-navy text-white px-5 py-2.5 rounded-xl font-bold sm:self-end inline-flex items-center gap-2 disabled:opacity-50">
          <Plus className="w-4 h-4" /> حفظ
        </button>
      </form>

      <div className="bg-card rounded-3xl p-5 shadow-card">
        <h2 className="font-bold text-navy mb-3">المحافظات المضافة ({rates.length})</h2>
        {rates.length === 0 ? (
          <div className="text-center text-muted-foreground py-6 text-sm">لم تتم إضافة أسعار شحن بعد</div>
        ) : (
          <div className="divide-y divide-border">
            {rates.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-3">
                <div className="font-semibold text-navy">{r.governorate}</div>
                <div className="flex items-center gap-3">
                  <div className="font-extrabold text-navy">{fmtEGP(r.cost)}</div>
                  <button onClick={() => remove(r.id)} className="bg-destructive/10 text-destructive p-2 rounded-xl">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
