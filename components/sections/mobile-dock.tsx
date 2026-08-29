"use client";

/**
 * الدعوة الثابتة أسفل شاشة الهاتف.
 * ------------------------------------------------------------------
 * الإبهام يصل إلى أسفل الشاشة لا أعلاها، فزرُّ التسجيل هناك أقرب إليه
 * من زرٍّ في الهيرو اختفى بعد أوّل تمريرة.
 *
 * الظهور كلُّه من CSS (‎.mh-cta-*‎) — فالمكوّن يُرسم دائماً ولا يعرف
 * التنسيق المختار، ولا يُعاد بناء الصفحة لتغييره.
 */

import Link from "next/link";
import { IconWhatsapp, IconArrowLeft } from "@/components/brand/icons";
import { useContent } from "@/components/content/content-provider";

export function MobileDock() {
  const { content, wa } = useContent();
  const cta = content.cta ?? {};
  /* زرّ واتساب يتبع نفس مفتاح إظهاره في الهيرو — مصدر واحد. */
  const showWa = content.ui?.["hero.whatsapp"]?.hidden !== true;

  return (
    <div
      className="mh-dock fixed inset-x-0 bottom-0 z-[80] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 md:!hidden"
      /* شريطٌ سفليّ: خلفية مضبّبة تفصله عن المحتوى المارّ تحته */
      style={{
        background: "linear-gradient(to top, hsl(var(--background)) 55%, transparent)",
      }}
    >
      <div className="mh-dock-inner flex items-center gap-2">
        <Link
          href={cta.registerUrl || "/register"}
          className="btn-glow inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold text-white shadow-glow"
        >
          {cta.heroPrimaryLabel || "أنشئ حساب طالب"}
          <IconArrowLeft className="size-4" />
        </Link>

        {showWa && (
          <a
            href={cta.whatsappUrl || wa(cta.whatsappText)}
            target="_blank"
            rel="noreferrer"
            aria-label="تواصل على واتساب"
            className="grid size-12 shrink-0 place-items-center rounded-2xl border border-[hsl(var(--gold))] bg-card text-[hsl(var(--primary))] shadow-bento"
          >
            <IconWhatsapp className="size-5" />
          </a>
        )}
      </div>
    </div>
  );
}
