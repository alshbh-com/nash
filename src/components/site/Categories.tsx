import { categories } from "@/data/mock";

const colorMap: Record<string, string> = {
  pink: "bg-gradient-pink",
  sky: "bg-gradient-sky",
  mint: "bg-gradient-mint",
  sunny: "bg-gradient-sunny",
};

export function Categories() {
  return (
    <section id="categories" className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-navy">تصفحي الأقسام</h2>
            <p className="text-muted-foreground mt-2">كل اللي صغيرك محتاجه في مكان واحد ✨</p>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className="group flex-shrink-0 snap-start w-32 md:w-40 text-center transition-transform hover:-translate-y-2"
            >
              <div className={`${colorMap[cat.color]} aspect-square rounded-3xl flex items-center justify-center shadow-card group-hover:shadow-hover transition-shadow mb-3`}>
                <span className="text-5xl md:text-6xl group-hover:scale-110 transition-transform inline-block">{cat.emoji}</span>
              </div>
              <h3 className="font-bold text-navy text-sm md:text-base">{cat.name}</h3>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
