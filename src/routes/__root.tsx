import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";
import { CartProvider } from "@/contexts/cart";
import { Header } from "@/components/site/Header";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="text-7xl mb-3">🧸</div>
        <h1 className="text-5xl font-extrabold text-navy">404</h1>
        <p className="mt-3 text-muted-foreground">الصفحة اللي بتدوّري عليها مش موجودة</p>
        <Link to="/" className="mt-6 inline-block bg-navy text-white px-6 py-3 rounded-2xl font-bold">العودة للرئيسية</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-navy">حصل خطأ</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-4 bg-navy text-white px-5 py-2.5 rounded-2xl font-bold">إعادة المحاولة</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ناصح Little Stars — ملابس أطفال فاخرة" },
      { name: "description", content: "ملابس أطفال بألوان مرحة وخامات آمنة، دفع عند الاستلام، استبدال خلال 15 يوم." },
      { property: "og:title", content: "ناصح Little Stars — ملابس أطفال فاخرة" },
      { property: "og:description", content: "ملابس أطفال بألوان مرحة وخامات آمنة، دفع عند الاستلام، استبدال خلال 15 يوم." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "ناصح Little Stars — ملابس أطفال فاخرة" },
      { name: "twitter:description", content: "ملابس أطفال بألوان مرحة وخامات آمنة، دفع عند الاستلام، استبدال خلال 15 يوم." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/36a48476-f7ff-4fec-9411-756667661326" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/36a48476-f7ff-4fec-9411-756667661326" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function Layout() {
  const loc = useLocation();
  const isAdmin = loc.pathname.startsWith("/admin");
  return (
    <>
      {!isAdmin && <Header />}
      <main className="min-h-[60vh]"><Outlet /></main>
      <Toaster position="top-center" richColors />
    </>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <Layout />
      </CartProvider>
    </QueryClientProvider>
  );
}
