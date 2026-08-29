"use client";

/**
 * عمقُ الواجهة الرئيسية.
 * ------------------------------------------------------------------
 * ثلاثيُّ الأبعاد هنا **ليس مشهداً مُجسَّماً** بل عمقٌ حقيقيٌّ في المستوى:
 * الطبقاتُ تتباعد عن العين بمقاديرَ مختلفة، فتتحرّك بسرعاتٍ مختلفة مع
 * حركة المؤشّر أو ميل الهاتف. وهذا هو ما تراه العينُ عمقاً فعلاً — لا
 * كثرةُ المضلّعات.
 *
 * **ولماذا لا three.js؟** لأنّ ثمنَه لا يُدفع هنا: نصفُ ميجابايت تُحمَّل
 * قبل أوّل رسم، وسياسةُ المحتوى تمنع جلبَه من خارج النطاق، وبطاقةُ رسومٍ
 * تُشغَّل على هاتفٍ متوسّط من أجل ميلةِ صورة. والنتيجةُ نفسُها تُنال
 * بـ`transform: perspective()` — وهي مسرَّعةٌ بالعتاد أصلاً.
 *
 * **والحركةُ تُقاد بمتغيّرات CSS لا بإعادة رسم React.** كلُّ حركةِ مؤشّرٍ
 * تكتب رقمين في الجذر، فيتحرّك كلُّ شيءٍ في طبقة التركيب — بلا إعادة
 * تصييرٍ ولا إعادة تخطيط.
 */

import { useEffect, useRef } from "react";

export type Depth3D = "off" | "soft" | "deep" | "tilt";

export function Hero3D({ mode = "soft" }: { mode?: Depth3D }) {
  const raf = useRef(0);

  useEffect(() => {
    if (mode === "off") return;
    const root = document.getElementById("hero");
    if (!root) return;

    /* من فضّل تقليل الحركة لا يُمال عنده شيء. */
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (still.matches) return;

    root.classList.add("h3d", `h3d-${mode}`);

    let tx = 0;
    let ty = 0;
    const write = () => {
      raf.current = 0;
      root.style.setProperty("--h3d-x", tx.toFixed(3));
      root.style.setProperty("--h3d-y", ty.toFixed(3));
    };
    const queue = () => {
      if (!raf.current) raf.current = requestAnimationFrame(write);
    };

    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      /* من ‎-١ إلى ١ حول مركز القسم — لا حول الشاشة، فالقسمُ هو المسرح. */
      tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      queue();
    };

    /* الهاتفُ لا مؤشّرَ له، فيُقاد بميله — وهو أصدقُ إحساساً بالعمق. */
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      tx = Math.max(-1, Math.min(1, e.gamma / 30));
      ty = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
      queue();
    };

    const reset = () => {
      tx = 0;
      ty = 0;
      queue();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", reset);
    window.addEventListener("deviceorientation", onTilt);

    return () => {
      window.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", reset);
      window.removeEventListener("deviceorientation", onTilt);
      if (raf.current) cancelAnimationFrame(raf.current);
      root.classList.remove("h3d", `h3d-${mode}`);
      root.style.removeProperty("--h3d-x");
      root.style.removeProperty("--h3d-y");
    };
  }, [mode]);

  return null;
}
