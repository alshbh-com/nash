import { Link } from "@tanstack/react-router";
import { ShoppingBag, Heart, Search } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-cream/80 border-b border-border/50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-pink flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform">
            <span className="text-2xl">⭐</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-navy leading-none">ناصح</h1>
            <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Little Stars</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
          <Link to="/" className="hover:text-pink transition-colors">الرئيسية</Link>
          <a href="#categories" className="hover:text-pink transition-colors">الأقسام</a>
          <a href="#products" className="hover:text-pink transition-colors">المنتجات</a>
          <a href="#why" className="hover:text-pink transition-colors">ليه إحنا؟</a>
        </nav>

        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors" aria-label="بحث">
            <Search className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors" aria-label="المفضلة">
            <Heart className="w-5 h-5" />
          </button>
          <button className="relative w-10 h-10 rounded-full bg-gradient-pink hover:scale-110 transition-transform flex items-center justify-center shadow-soft" aria-label="السلة">
            <ShoppingBag className="w-5 h-5 text-navy" />
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-navy text-white text-[10px] font-bold flex items-center justify-center">0</span>
          </button>
        </div>
      </div>
    </header>
  );
}
