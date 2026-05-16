import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fmtEGP } from "@/lib/format";
import { toast } from "sonner";
import { LogOut, Package, ShoppingCart, TrendingUp, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "لوحة التحكم — ناصح" }] }),
});

function Dashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"overview" | "orders" | "products">("overview");
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { navigate({ to: "/admin" }); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
      if (!roles?.some((r) => r.role === "admin")) { navigate({ to: "/admin" }); return; }
      setAuthed(true);
    };
    check();
  }, [navigate]);

  const logout = async () => { await supabase.auth.signOut(); navigate({ to: "/admin" }); };

  if (!authed) return <div className="container mx-auto px-4 py-20 text-center">جاري التحقق...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-navy">⭐ لوحة التحكم</h1>
        <button onClick={logout} className="flex items-center gap-2 bg-white border-2 border-border px-4 py-2 rounded-2xl font-semibold hover:border-destructive hover:text-destructive">
          <LogOut className="w-4 h-4" /> خروج
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: "overview", label: "نظرة عامة", icon: TrendingUp },
          { id: "orders", label: "الطلبات", icon: ShoppingCart },
          { id: "products", label: "المنتجات", icon: Package },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all ${tab === t.id ? "bg-navy text-white shadow-soft" : "bg-white border-2 border-border"}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <Overview />}
      {tab === "orders" && <OrdersTab />}
      {tab === "products" && <ProductsTab />}
    </div>
  );
}

function Overview() {
  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("total, status, created_at");
      if (error) throw error;
      return data;
    },
  });
  const { data: productsCount = 0 } = useQuery({
    queryKey: ["admin-products-count"],
    queryFn: async () => {
      const { count, error } = await supabase.from("products").select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const revenue = orders.filter((o) => o.status !== "cancelled").reduce((a, b) => a + Number(b.total), 0);
  const pending = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Stat title="إجمالي الإيرادات" value={fmtEGP(revenue)} bg="bg-gradient-pink" />
      <Stat title="عدد الطلبات" value={orders.length.toString()} bg="bg-gradient-sky" />
      <Stat title="طلبات معلّقة" value={pending.toString()} bg="bg-gradient-sunny" />
      <Stat title="عدد المنتجات" value={productsCount.toString()} bg="bg-gradient-mint" />
    </div>
  );
}

function Stat({ title, value, bg }: { title: string; value: string; bg: string }) {
  return (
    <div className={`${bg} rounded-3xl p-6 shadow-card`}>
      <div className="text-sm font-bold text-navy/70">{title}</div>
      <div className="text-3xl font-extrabold text-navy mt-1">{value}</div>
    </div>
  );
}

const STATUS = [
  { id: "pending", label: "معلّق", color: "bg-sunny text-navy" },
  { id: "confirmed", label: "مؤكد", color: "bg-sky text-navy" },
  { id: "shipped", label: "تم الشحن", color: "bg-mint text-navy" },
  { id: "delivered", label: "تم التسليم", color: "bg-green-200 text-navy" },
  { id: "cancelled", label: "ملغي", color: "bg-destructive/20 text-destructive" },
];

function OrdersTab() {
  const qc = useQueryClient();
  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("تم تحديث الحالة");
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  return (
    <div className="space-y-4">
      {orders.length === 0 && <div className="text-center text-muted-foreground py-10">لا توجد طلبات بعد</div>}
      {orders.map((o) => (
        <div key={o.id} className="bg-card rounded-3xl p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div>
              <div className="font-bold text-navy">{o.order_number}</div>
              <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("ar-EG")}</div>
            </div>
            <div className="text-lg font-extrabold text-navy">{fmtEGP(o.total)}</div>
          </div>
          <div className="grid md:grid-cols-2 gap-3 text-sm mb-3">
            <div><span className="text-muted-foreground">العميل:</span> <b>{o.customer_name}</b> ({o.phone})</div>
            <div><span className="text-muted-foreground">العنوان:</span> {o.governorate} — {o.address}</div>
          </div>
          {o.order_items && o.order_items.length > 0 && (
            <details className="mb-3">
              <summary className="cursor-pointer font-semibold text-sm">المنتجات ({o.order_items.length})</summary>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                {o.order_items.map((it) => (
                  <div key={it.id}>• {it.product_name} — {it.size} / {it.color} × {it.qty} = {fmtEGP(Number(it.qty) * Number(it.unit_price))}</div>
                ))}
              </div>
            </details>
          )}
          <div className="flex flex-wrap gap-2">
            {STATUS.map((s) => (
              <button key={s.id} onClick={() => updateStatus(o.id, s.id)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${o.status === s.id ? s.color + " ring-2 ring-navy" : "bg-muted hover:bg-muted/70"}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductsTab() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const remove = async (id: string) => {
    if (!confirm("حذف المنتج؟")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("تم الحذف");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  const toggleActive = async (id: string, active: boolean) => {
    const { error } = await supabase.from("products").update({ active: !active }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  return (
    <div className="space-y-4">
      <button onClick={() => setShowForm(!showForm)} className="bg-navy text-white px-5 py-2.5 rounded-2xl font-bold inline-flex items-center gap-2">
        <Plus className="w-4 h-4" /> {showForm ? "إخفاء النموذج" : "إضافة منتج جديد"}
      </button>
      {showForm && <ProductForm onDone={() => { setShowForm(false); qc.invalidateQueries({ queryKey: ["admin-products"] }); }} />}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.id} className="bg-card rounded-3xl overflow-hidden shadow-card">
            <div className="aspect-square bg-muted relative">
              {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
              {!p.active && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">معطّل</div>}
            </div>
            <div className="p-4 space-y-2">
              <h3 className="font-bold text-navy line-clamp-1">{p.name}</h3>
              <div className="text-xs text-muted-foreground">{p.categories?.name} · مخزون: {p.stock}</div>
              <div className="font-extrabold text-navy">{fmtEGP(p.price)}</div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => toggleActive(p.id, p.active)} className="flex-1 text-xs font-bold bg-muted px-3 py-2 rounded-xl hover:bg-muted/70">
                  {p.active ? "تعطيل" : "تفعيل"}
                </button>
                <button onClick={() => remove(p.id)} className="bg-destructive/10 text-destructive p-2 rounded-xl hover:bg-destructive/20">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductForm({ onDone }: { onDone: () => void }) {
  const { data: categories = [] } = useQuery({
    queryKey: ["all-cats"],
    queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data ?? [],
  });
  const [f, setF] = useState({
    name: "", slug: "", price: "", old_price: "", stock: "10",
    category_id: "", gender: "unisex", badge: "",
    image_url: "", sizes: "0-3 شهور,3-6 شهور,6-12 شهور", colors: "#FFB6C1,#B5EAD7",
    short_description: "", description: "",
  });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("products").insert({
      name: f.name,
      slug: f.slug || f.name.toLowerCase().replace(/\s+/g, "-"),
      price: Number(f.price),
      old_price: f.old_price ? Number(f.old_price) : null,
      stock: Number(f.stock),
      category_id: f.category_id || null,
      gender: f.gender,
      badge: f.badge || null,
      images: f.image_url ? [f.image_url] : [],
      sizes: f.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: f.colors.split(",").map((s) => s.trim()).filter(Boolean),
      short_description: f.short_description || null,
      description: f.description || null,
      active: true,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("تمت إضافة المنتج");
    onDone();
  };

  const Inp = (p: { k: keyof typeof f; label: string; type?: string; placeholder?: string }) => (
    <div>
      <label className="block text-xs font-bold text-navy mb-1">{p.label}</label>
      <input type={p.type ?? "text"} value={f[p.k]} placeholder={p.placeholder} onChange={(e) => setF({ ...f, [p.k]: e.target.value })}
        className="w-full px-3 py-2 rounded-xl border-2 border-border bg-white text-sm" />
    </div>
  );

  return (
    <form onSubmit={submit} className="bg-card rounded-3xl p-6 shadow-card grid md:grid-cols-2 gap-3">
      <Inp k="name" label="اسم المنتج *" />
      <Inp k="slug" label="Slug (اختياري)" placeholder="auto" />
      <Inp k="price" label="السعر *" type="number" />
      <Inp k="old_price" label="السعر قبل الخصم" type="number" />
      <Inp k="stock" label="المخزون" type="number" />
      <div>
        <label className="block text-xs font-bold text-navy mb-1">القسم</label>
        <select value={f.category_id} onChange={(e) => setF({ ...f, category_id: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border-2 border-border bg-white text-sm">
          <option value="">— بدون قسم —</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold text-navy mb-1">الجنس</label>
        <select value={f.gender} onChange={(e) => setF({ ...f, gender: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border-2 border-border bg-white text-sm">
          <option value="unisex">يونيسكس</option><option value="boy">ولد</option><option value="girl">بنت</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold text-navy mb-1">الشارة</label>
        <select value={f.badge} onChange={(e) => setF({ ...f, badge: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border-2 border-border bg-white text-sm">
          <option value="">— بدون —</option>
          <option value="new">جديد</option><option value="bestseller">الأكثر مبيعاً</option><option value="sale">تخفيض</option>
        </select>
      </div>
      <Inp k="image_url" label="رابط الصورة" placeholder="https://..." />
      <Inp k="sizes" label="المقاسات (مفصولة بفاصلة)" />
      <Inp k="colors" label="الألوان (هكس مفصولة بفاصلة)" />
      <div className="md:col-span-2">
        <label className="block text-xs font-bold text-navy mb-1">وصف قصير</label>
        <input value={f.short_description} onChange={(e) => setF({ ...f, short_description: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border-2 border-border bg-white text-sm" />
      </div>
      <div className="md:col-span-2">
        <label className="block text-xs font-bold text-navy mb-1">وصف تفصيلي</label>
        <textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} rows={3}
          className="w-full px-3 py-2 rounded-xl border-2 border-border bg-white text-sm" />
      </div>
      <button type="submit" disabled={busy} className="md:col-span-2 bg-navy text-white py-3 rounded-2xl font-bold disabled:opacity-50">
        {busy ? "جاري الإضافة..." : "إضافة المنتج"}
      </button>
    </form>
  );
}
