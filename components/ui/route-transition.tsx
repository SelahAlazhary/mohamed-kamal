"use client";

/**
 * RouteTransition — انتقالات صفحات ناعمة:
 * • شريط تقدّم علوي متدرّج عند تغيير المسار.
 * • دخول لطيف للمحتوى الجديد (بدون AnimatePresence/exit حتى لا تظهر شاشة بيضاء عند التنقّل).
 * يحترم prefers-reduced-motion.
 */

import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [barKey, setBarKey] = useState(0);

  useEffect(() => { setBarKey((k) => k + 1); }, [pathname]);

  /** اللوحاتُ: قشرةٌ ثابتةٌ فيها عناصرُ `fixed` لا تحتمل غلافاً متحوّلاً. */
  const app = pathname.startsWith("/admin") || pathname.startsWith("/student");

  return (
    <>
      {/* شريط التقدّم العلوي */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[3px]">
        <motion.div
          key={barKey}
          initial={{ width: "0%", opacity: 1 }}
          animate={{ width: "100%", opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--glow)))",
            boxShadow: "0 0 12px hsl(var(--glow) / 0.7)",
          }}
        />
      </div>

      {/*
        اللوحاتُ خارج الحركة.
        ------------------------------------------------------------------
        `position: fixed` تتصرّف تصرّفَ `absolute` إن كان في أسلافها عنصرٌ
        عليه `transform` أو `filter`. وغلافُ الحركة يضع الاثنين — والأسوأُ
        أنّ `filter: blur(0px)` **تبقى في الأسلوب المحسوب بعد انتهاء
        الحركة**، فلا تعود `none` أبداً. فيبقى الغلافُ حاجزاً دائماً لا
        نصفَ ثانية.

        وأثرُه أنّ لوحَ اللوحة الجانبيَّ — وهو `fixed` — كان يتمرّر مع
        الصفحة فينزل إلى أسفلها كلّما تحرّك المشرفُ في قسم. وكذلك لوحُ
        الحفظ وكلُّ ما ثُبِّت في هذه الشجرة.

        والحركةُ زينةُ تصفُّحٍ لا تصلح للوحاتِ العمل أصلاً: القشرةُ ثابتةٌ
        والمتنُ وحدَه يتغيّر، فتحريكُ الشاشة كلِّها عند كلّ نقرةٍ إزعاج.
        فتُلغى في `/admin` و`/student`، ويبقى شريطُ التقدّم فوقُ يقول
        إنّ شيئاً يُحمَّل.
      */}
      {app ? (
        children
      ) : (
        <motion.div
          key={pathname}
          /*
            ولا `filter` هنا كذلك: البابُ الذي يُغلق في اللوحات لا يُترك
            مفتوحاً في الموقع. و`transform` تعود `none` من تلقائها حين
            تنتهي الحركةُ عند قيمها المحايدة — و`blur(0px)` لا تعود.
          */
          initial={reduce ? false : { opacity: 0, y: 18, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      )}
    </>
  );
}
