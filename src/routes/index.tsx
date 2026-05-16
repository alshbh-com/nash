import { createFileRoute } from "@tanstack/react-router";
import { ProductGrid } from "@/components/site/ProductGrid";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "ناصح Little Stars — ملابس أطفال فاخرة بألوان مرحة" },
      { name: "description", content: "متجر ناصح لملابس الأطفال: تشكيلة مختارة من ملابس الأولاد والبنات والبيبي بخامات آمنة، دفع عند الاستلام، واستبدال خلال 15 يوم." },
    ],
  }),
});

function Index() {
  return (
    <div className="pt-6">
      <ProductGrid />
    </div>
  );
}
