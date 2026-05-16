import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Categories } from "@/components/site/Categories";
import { PromoBanner } from "@/components/site/PromoBanner";
import { ProductGrid } from "@/components/site/ProductGrid";
import { Features } from "@/components/site/Features";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "ناصح Little Stars — ملابس أطفال فاخرة بألوان مرحة" },
      { name: "description", content: "متجر ناصح لملابس الأطفال: تشكيلة مختارة من ملابس الأولاد والبنات والبيبي بخامات آمنة، دفع عند الاستلام، واستبدال خلال 15 يوم." },
      { property: "og:title", content: "ناصح Little Stars — ملابس أطفال فاخرة" },
      { property: "og:description", content: "ألبس صغيرك أحلى حاجة — ملابس أطفال بألوان مرحة وخامات آمنة." },
      { property: "og:type", content: "website" },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Categories />
        <PromoBanner />
        <ProductGrid />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
