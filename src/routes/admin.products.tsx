import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fmtEGP } from "@/lib/format";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X, Upload, ImagePlus } from "lucide-react";

export const Route = createFileRoute("/admin/products")({ component: ProductsPage });

type ProductRow = {
  id: string; name: string; slug: string; price: number; old_price: number | null;
  stock: number; active: boolean; badge: string | null; gender: string;
  category_id: string | null; images: string[]; sizes: string[]; colors: string[];
  short_description: string | null; description: string | null;
  categories?: { name: string } | null;
};

function ProductsPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<ProductRow | "new" | null>(null);

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data as ProductRow[];
    },
  });

  const remove = async (id: string) => {
    if (!confirm("حذف المنتج نهائياً؟")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("تم الحذف");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  const toggleActive = async (p: ProductRow) => {
    const { error } = await supabase.from("products").update({ active: !p.active }).eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-extrabold text-navy">المنتجات</h1>
        <button onClick={() => setEditing("new")} className="bg-navy text-white px-5 py-2.5 rounded-2xl font-bold inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> منتج جديد
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.length === 0 && <div className="col-span-full text-center text-muted-foreground py-10">لا توجد منتجات بعد</div>}
        {products.map((p) => (
          <div key={p.id} className="bg-card rounded-3xl overflow-hidden shadow-card">
            <div className="aspect-square bg-muted relative">
              {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
              {!p.active && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">معطّل</div>}
              {p.badge && <div className="absolute top-2 right-2 bg-pink text-white text-xs px-2 py-1 rounded-full font-bold">{p.badge}</div>}
            </div>
            <div className="p-4 space-y-2">
              <h3 className="font-bold text-navy line-clamp-1">{p.name}</h3>
              <div className="text-xs text-muted-foreground">{p.categories?.name ?? "—"} · مخزون: {p.stock}</div>
              <div className="font-extrabold text-navy">{fmtEGP(p.price)}</div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => toggleActive(p)} className="flex-1 text-xs font-bold bg-muted px-3 py-2 rounded-xl">
                  {p.active ? "تعطيل" : "تفعيل"}
                </button>
                <button onClick={() => setEditing(p)} className="bg-sky/30 text-navy p-2 rounded-xl"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => remove(p.id)} className="bg-destructive/10 text-destructive p-2 rounded-xl"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <ProductForm initial={editing === "new" ? null : editing} onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); qc.invalidateQueries({ queryKey: ["admin-products"] }); }} />
      )}
    </div>
  );
}

function ProductForm({ initial, onClose, onSaved }: { initial: ProductRow | null; onClose: () => void; onSaved: () => void }) {
  const { data: categories = [] } = useQuery({
    queryKey: ["all-cats"],
    queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data ?? [],
  });
  const [f, setF] = useState({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    price: initial?.price?.toString() ?? "",
    old_price: initial?.old_price?.toString() ?? "",
    stock: initial?.stock?.toString() ?? "10",
    category_id: initial?.category_id ?? "",
    gender: initial?.gender ?? "unisex",
    badge: initial?.badge ?? "",
    images: initial?.images ?? [],
    sizes: initial?.sizes ?? [],
    colors: initial?.colors ?? [],
    short_description: initial?.short_description ?? "",
    description: initial?.description ?? "",
    active: initial?.active ?? true,
  });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sizeInput, setSizeInput] = useState("");
  const [colorInput, setColorInput] = useState("#FFB6C1");

  const addSize = () => {
    const v = sizeInput.trim();
    if (!v || f.sizes.includes(v)) return;
    setF((x) => ({ ...x, sizes: [...x.sizes, v] }));
    setSizeInput("");
  };
  const removeSize = (s: string) => setF((x) => ({ ...x, sizes: x.sizes.filter((y) => y !== s) }));
  const addColor = () => {
    if (!colorInput || f.colors.includes(colorInput)) return;
    setF((x) => ({ ...x, colors: [...x.colors, colorInput] }));
  };
  const removeColor = (c: string) => setF((x) => ({ ...x, colors: x.colors.filter((y) => y !== c) }));

  const uploadFiles = async (files: FileList) => {
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage.from("product-images").upload(path, file);
        if (error) { toast.error(error.message); continue; }
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
      setF((x) => ({ ...x, images: [...x.images, ...urls] }));
    } finally { setUploading(false); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (f.images.length === 0) { toast.error("لازم تضيف صورة واحدة على الأقل"); return; }
    setBusy(true);
    const payload = {
      name: f.name,
      slug: f.slug || f.name.toLowerCase().replace(/\s+/g, "-"),
      price: Number(f.price),
      old_price: f.old_price ? Number(f.old_price) : null,
      stock: Number(f.stock),
      category_id: f.category_id || null,
      gender: f.gender,
      badge: f.badge || null,
      images: f.images,
      sizes: f.sizes,
      colors: f.colors,
      short_description: f.short_description || null,
      description: f.description || null,
      active: f.active,
    };
    const { error } = initial
      ? await supabase.from("products").update(payload).eq("id", initial.id)
      : await supabase.from("products").insert(payload);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(initial ? "تم الحفظ" : "تمت الإضافة");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto grid md:grid-cols-2 gap-3">
        <div className="md:col-span-2 flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-navy">{initial ? "تعديل منتج" : "منتج جديد"}</h2>
          <button type="button" onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <Field label="الاسم *" value={f.name} onChange={(v) => setF({ ...f, name: v })} />
        <Field label="Slug" value={f.slug} onChange={(v) => setF({ ...f, slug: v })} placeholder="auto" />
        <Field label="السعر *" type="number" value={f.price} onChange={(v) => setF({ ...f, price: v })} />
        <Field label="السعر قبل الخصم" type="number" value={f.old_price} onChange={(v) => setF({ ...f, old_price: v })} />
        <Field label="المخزون" type="number" value={f.stock} onChange={(v) => setF({ ...f, stock: v })} />

        <div>
          <label className="block text-xs font-bold text-navy mb-1">القسم</label>
          <select value={f.category_id} onChange={(e) => setF({ ...f, category_id: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border-2 border-border bg-white text-sm">
            <option value="">— بدون —</option>
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

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-navy mb-2">صور المنتج * <span className="text-xs font-normal text-muted-foreground">(اضغط على المربع لاختيار الصور)</span></label>
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-pink rounded-2xl bg-pink/5 hover:bg-pink/10 cursor-pointer py-8 transition-colors">
            <ImagePlus className="w-10 h-10 text-pink" />
            <span className="text-sm font-bold text-navy">اضغط هنا لرفع الصور</span>
            <span className="text-xs text-muted-foreground">JPG / PNG / WEBP — أكثر من صورة مسموح</span>
            <input type="file" multiple accept="image/*" onChange={(e) => e.target.files && uploadFiles(e.target.files)}
              className="hidden" />
          </label>
          {uploading && <div className="text-xs text-pink font-bold mt-2 flex items-center gap-2"><Upload className="w-3 h-3 animate-pulse" /> جاري رفع الصور...</div>}
          {f.images.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {f.images.map((url, i) => (
                <div key={i} className="relative aspect-square">
                  <img src={url} alt="" className="w-full h-full object-cover rounded-lg border-2 border-border" />
                  <button type="button" onClick={() => setF({ ...f, images: f.images.filter((_, j) => j !== i) })}
                    className="absolute -top-1 -right-1 bg-destructive text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow">×</button>
                </div>
              ))}
            </div>
          )}
          {f.images.length === 0 && <div className="text-xs text-destructive mt-2">⚠️ لازم تضيف صورة واحدة على الأقل</div>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-navy mb-2">المقاسات</label>
          <div className="flex gap-2">
            <input value={sizeInput} onChange={(e) => setSizeInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSize(); } }}
              placeholder="مثال: 3-6 شهور"
              className="flex-1 px-3 py-2 rounded-xl border-2 border-border bg-white text-sm" />
            <button type="button" onClick={addSize}
              className="bg-pink text-white px-4 py-2 rounded-xl font-bold inline-flex items-center gap-1">
              <Plus className="w-4 h-4" /> إضافة
            </button>
          </div>
          {f.sizes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {f.sizes.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 bg-mint/40 text-navy px-3 py-1.5 rounded-full text-sm font-semibold">
                  {s}
                  <button type="button" onClick={() => removeSize(s)} className="text-destructive font-bold hover:scale-110">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-navy mb-2">الألوان</label>
          <div className="flex gap-2 items-center">
            <input type="color" value={colorInput} onChange={(e) => setColorInput(e.target.value)}
              className="w-14 h-11 rounded-xl border-2 border-border cursor-pointer bg-white" />
            <input type="text" value={colorInput} onChange={(e) => setColorInput(e.target.value)}
              placeholder="#FFB6C1"
              className="flex-1 px-3 py-2 rounded-xl border-2 border-border bg-white text-sm font-mono" />
            <button type="button" onClick={addColor}
              className="bg-pink text-white px-4 py-2 rounded-xl font-bold inline-flex items-center gap-1">
              <Plus className="w-4 h-4" /> إضافة
            </button>
          </div>
          {f.colors.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {f.colors.map((c) => (
                <span key={c} className="inline-flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full text-xs font-semibold">
                  <span className="w-5 h-5 rounded-full border-2 border-white shadow" style={{ backgroundColor: c }} />
                  {c}
                  <button type="button" onClick={() => removeColor(c)} className="text-destructive font-bold hover:scale-110">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

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

        <label className="md:col-span-2 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} />
          <span>نشط (يظهر في المتجر)</span>
        </label>

        <button type="submit" disabled={busy} className="md:col-span-2 bg-navy text-white py-3 rounded-2xl font-bold disabled:opacity-50">
          {busy ? "جاري الحفظ..." : (initial ? "حفظ التعديلات" : "إضافة المنتج")}
        </button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-bold text-navy mb-1">{label}</label>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl border-2 border-border bg-white text-sm" />
    </div>
  );
}
