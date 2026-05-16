import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/cart";

export function Header() {
  const { count } = useCart();
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
          <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "text-pink" }} className="hover:text-pink transition-colors">الرئيسية</Link>
          <Link to="/category/$slug" params={{ slug: "girls" }} className="hover:text-pink transition-colors">بنات</Link>
          <Link to="/category/$slug" params={{ slug: "boys" }} className="hover:text-pink transition-colors">أولاد</Link>
          <Link to="/category/$slug" params={{ slug: "baby" }} className="hover:text-pink transition-colors">بيبي</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/cart" className="relative w-11 h-11 rounded-full bg-gradient-pink hover:scale-110 transition-transform flex items-center justify-center shadow-soft" aria-label="السلة">
            <ShoppingBag className="w-5 h-5 text-navy" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-navy text-white text-[10px] font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
