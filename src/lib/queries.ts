import { supabase } from "@/integrations/supabase/client";

export async function fetchCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return data;
}

export async function fetchProducts(opts?: { categoryId?: string }) {
  let q = supabase.from("products").select("*, categories(slug,name)").eq("active", true);
  if (opts?.categoryId) q = q.eq("category_id", opts.categoryId);
  const { data, error } = await q.order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(slug,name)")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchCategoryBySlug(slug: string) {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchShipping() {
  const { data, error } = await supabase.from("shipping_rates").select("*").order("governorate");
  if (error) throw error;
  return data;
}

export async function validateCoupon(code: string) {
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("active", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}
