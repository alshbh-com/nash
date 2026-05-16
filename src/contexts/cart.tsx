import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
  productId: string;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string;
  qty: number;
};

type CartCtx = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (productId: string, size: string, color: string) => void;
  updateQty: (productId: string, size: string, color: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "nasih-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify(items));
    }
  }, [items, ready]);

  const sameKey = (a: CartItem, p: string, s: string, c: string) =>
    a.productId === p && a.size === s && a.color === c;

  const add = (it: CartItem) =>
    setItems((curr) => {
      const ex = curr.findIndex((c) => sameKey(c, it.productId, it.size, it.color));
      if (ex >= 0) {
        const copy = [...curr];
        copy[ex] = { ...copy[ex], qty: copy[ex].qty + it.qty };
        return copy;
      }
      return [...curr, it];
    });

  const remove = (p: string, s: string, c: string) =>
    setItems((curr) => curr.filter((it) => !sameKey(it, p, s, c)));

  const updateQty = (p: string, s: string, c: string, qty: number) =>
    setItems((curr) =>
      curr.map((it) => (sameKey(it, p, s, c) ? { ...it, qty: Math.max(1, qty) } : it))
    );

  const clear = () => setItems([]);

  const count = items.reduce((a, b) => a + b.qty, 0);
  const subtotal = items.reduce((a, b) => a + b.qty * b.price, 0);

  return <Ctx.Provider value={{ items, add, remove, updateQty, clear, count, subtotal }}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
