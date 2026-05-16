const features = [
  { icon: "🚚", title: "شحن سريع", desc: "خلال 24-48 ساعة لكل المحافظات", bg: "bg-gradient-sky" },
  { icon: "💵", title: "دفع عند الاستلام", desc: "ادفعي بعد ما تستلمي طلبك", bg: "bg-gradient-mint" },
  { icon: "🔄", title: "استبدال 15 يوم", desc: "ضمان الاستبدال أو الاسترجاع", bg: "bg-gradient-pink" },
  { icon: "🌿", title: "خامات آمنة", desc: "قطن طبيعي 100% آمن على البشرة", bg: "bg-gradient-sunny" },
];

export function Features() {
  return (
    <section id="why" className="py-16 bg-white/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-navy">ليه ناصح؟ ⭐</h2>
          <p className="text-muted-foreground mt-2">لأن صغيرك يستاهل الأحسن</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-card rounded-3xl p-6 text-center shadow-card hover:shadow-hover hover:-translate-y-2 transition-all">
              <div className={`${f.bg} w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-soft`}>
                {f.icon}
              </div>
              <h3 className="font-bold text-navy mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
