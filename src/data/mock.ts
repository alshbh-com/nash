import p1 from "@/assets/product-1.jpg";
import p2 from "@/assets/product-2.jpg";
import p3 from "@/assets/product-3.jpg";
import p4 from "@/assets/product-4.jpg";

export const categories = [
  { id: "boys", name: "ملابس أولاد", emoji: "👦", color: "sky" },
  { id: "girls", name: "ملابس بنات", emoji: "👧", color: "pink" },
  { id: "baby", name: "حديثي الولادة", emoji: "👶", color: "mint" },
  { id: "sleep", name: "ملابس نوم", emoji: "🌙", color: "sunny" },
  { id: "shoes", name: "أحذية", emoji: "👟", color: "pink" },
  { id: "accessories", name: "إكسسوارات", emoji: "🎀", color: "mint" },
  { id: "occasions", name: "مناسبات وأعياد", emoji: "🎉", color: "sunny" },
] as const;

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  badge?: "new" | "bestseller" | "sale";
  stock: number;
  colors: string[];
};

export const products: Product[] = [
  {
    id: "1",
    name: "بادي بيبي ناعم وردي",
    category: "baby",
    price: 180,
    oldPrice: 250,
    image: p1,
    badge: "sale",
    stock: 3,
    colors: ["#FFB6C1", "#B5EAD7", "#FFE5A0"],
  },
  {
    id: "2",
    name: "طقم ولادي قميص وبنطلون",
    category: "boys",
    price: 320,
    image: p2,
    badge: "new",
    stock: 12,
    colors: ["#87CEEB", "#2D3561"],
  },
  {
    id: "3",
    name: "بيجاما غيوم صفراء",
    category: "sleep",
    price: 220,
    oldPrice: 290,
    image: p3,
    badge: "bestseller",
    stock: 8,
    colors: ["#FFE5A0", "#B5EAD7"],
  },
  {
    id: "4",
    name: "حذاء أطفال وردي",
    category: "shoes",
    price: 280,
    image: p4,
    stock: 5,
    colors: ["#FFB6C1", "#FFFFFF"],
  },
  {
    id: "5",
    name: "فستان بناتي صيفي",
    category: "girls",
    price: 350,
    oldPrice: 450,
    image: p1,
    badge: "sale",
    stock: 7,
    colors: ["#FFB6C1", "#FFE5A0"],
  },
  {
    id: "6",
    name: "طقم نوم بيبي",
    category: "sleep",
    price: 195,
    image: p3,
    badge: "new",
    stock: 15,
    colors: ["#B5EAD7", "#87CEEB"],
  },
  {
    id: "7",
    name: "جاكيت ولادي شتوي",
    category: "boys",
    price: 480,
    image: p2,
    stock: 2,
    colors: ["#2D3561", "#87CEEB"],
  },
  {
    id: "8",
    name: "ربطة شعر فيونكة",
    category: "accessories",
    price: 45,
    image: p4,
    badge: "bestseller",
    stock: 30,
    colors: ["#FFB6C1", "#B5EAD7", "#FFE5A0"],
  },
];
