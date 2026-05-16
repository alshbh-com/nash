import heroImg from "@/assets/hero-child.jpg";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      {/* Floating decorations */}
      <div className="absolute top-10 left-10 text-5xl animate-float opacity-70" style={{ animationDelay: "0s" }}>☁️</div>
      <div className="absolute top-32 right-20 text-4xl animate-float opacity-70" style={{ animationDelay: "1s" }}>⭐</div>
      <div className="absolute bottom-20 left-1/4 text-5xl animate-bounce-slow opacity-70">🌈</div>
      <div className="absolute top-1/2 right-10 text-4xl animate-float opacity-70" style={{ animationDelay: "2s" }}>💖</div>
      <div className="absolute bottom-32 right-1/3 text-3xl animate-bounce-slow opacity-60">🧸</div>

      <div className="container mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center relative">
        <div className="text-center md:text-right space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur rounded-full px-4 py-2 text-sm font-semibold shadow-soft">
            <span>🌟</span>
            <span>ملابس أطفال بجودة فاخرة</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-navy">
            ألبس صغيرك<br />
            <span className="bg-gradient-pink bg-clip-text text-transparent">أحلى حاجة</span> 🌈
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto md:mx-0">
            تشكيلة مختارة بعناية من ملابس الأطفال الناعمة والآمنة على بشرة طفلك، بألوان مرحة وخامات فاخرة.
          </p>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <a href="#products" className="bg-navy text-white px-7 py-4 rounded-2xl font-bold shadow-soft hover:shadow-hover hover:scale-105 transition-all">
              تسوقي الآن 🛍️
            </a>
            <a href="#categories" className="bg-white/80 backdrop-blur text-navy px-7 py-4 rounded-2xl font-bold shadow-card hover:scale-105 transition-all">
              تصفحي الأقسام
            </a>
          </div>

          <div className="flex gap-6 justify-center md:justify-start pt-4 text-sm">
            <div><span className="text-2xl font-bold text-pink">15+</span><div className="text-muted-foreground">يوم استبدال</div></div>
            <div><span className="text-2xl font-bold text-sky">100%</span><div className="text-muted-foreground">قطن آمن</div></div>
            <div><span className="text-2xl font-bold text-mint">24س</span><div className="text-muted-foreground">شحن سريع</div></div>
          </div>
        </div>

        <div className="relative flex justify-center">
          <div className="absolute inset-0 bg-gradient-pink rounded-full blur-3xl opacity-40 scale-90" />
          <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden border-8 border-white shadow-hover">
            <img src={heroImg} alt="طفلة سعيدة بملابس ملونة" width={1024} height={1024} className="w-full h-full object-cover" />
          </div>
          <div className="absolute -top-4 -right-4 bg-sunny rounded-2xl px-4 py-3 shadow-soft rotate-6 animate-wiggle">
            <div className="text-xs font-bold text-navy">خصم</div>
            <div className="text-2xl font-extrabold text-navy">30%</div>
          </div>
          <div className="absolute -bottom-2 -left-4 bg-white rounded-2xl px-4 py-3 shadow-soft -rotate-6 flex items-center gap-2">
            <span className="text-2xl">🚚</span>
            <div>
              <div className="text-[10px] text-muted-foreground">شحن مجاني</div>
              <div className="text-xs font-bold text-navy">فوق 500 ج.م</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
