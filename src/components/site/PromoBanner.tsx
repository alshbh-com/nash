export function PromoBanner() {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-sunny p-8 md:p-12 shadow-card">
        <div className="absolute top-4 right-4 text-6xl opacity-30 animate-bounce-slow">🌞</div>
        <div className="absolute bottom-4 left-8 text-5xl opacity-30 animate-float">🌸</div>
        <div className="relative max-w-xl">
          <div className="inline-block bg-navy text-white text-xs font-bold px-3 py-1.5 rounded-full mb-3">عرض الصيف</div>
          <h3 className="text-3xl md:text-5xl font-extrabold text-navy mb-3">
            خصم 30% على<br />ملابس الصيف ☀️
          </h3>
          <p className="text-navy/80 mb-5">على تشكيلة مختارة من فساتين وتيشيرتات الصيف لفترة محدودة.</p>
          <button className="bg-navy text-white px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-transform shadow-soft">
            تسوّق العرض
          </button>
        </div>
      </div>
    </section>
  );
}
