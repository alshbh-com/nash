import { Facebook, Instagram, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-navy text-white mt-16">
      <div className="container mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-pink flex items-center justify-center">
              <span className="text-2xl">⭐</span>
            </div>
            <div>
              <h3 className="text-xl font-bold">ناصح</h3>
              <p className="text-xs opacity-70">Little Stars</p>
            </div>
          </div>
          <p className="text-sm opacity-80 leading-relaxed">
            متجر ملابس أطفال متخصص في تقديم أحدث الموديلات بأعلى جودة وأفضل الأسعار.
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-sunny">سياسة الاستبدال 🔄</h4>
          <p className="text-sm opacity-80 leading-relaxed">
            يمكنك معاينة الأوردر أو استرجاعه خلال 15 يوم من تاريخ الاستلام عندما يكون غير مطابق للمواصفات.
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-sunny">تابعينا</h4>
          <div className="flex gap-3">
            {[
              { icon: Facebook, label: "Facebook" },
              { icon: Instagram, label: "Instagram" },
              { icon: MessageCircle, label: "WhatsApp" },
            ].map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-pink hover:text-navy flex items-center justify-center transition-colors"
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
          <p className="text-sm opacity-70 mt-4">📞 01000000000</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs opacity-70">
        © {new Date().getFullYear()} ناصح Little Stars — جميع الحقوق محفوظة
      </div>
    </footer>
  );
}
