"use client";

/**
 * عمقُ الصفحة كلِّها.
 * ------------------------------------------------------------------
 * فرقٌ بين تأثيرٍ في قسمٍ واحد وبين **مستوىً ثلاثيٍّ تعيش فيه الصفحة**.
 * هذا الثاني: كلُّ لوحٍ في الصفحة يميل نحو المؤشّر بحسب موضعه هو، لا
 * بحسب موضعٍ عامّ — فيتفاوت الميلُ بين لوحٍ ولوح، وهذا التفاوتُ نفسُه
 * هو ما تقرؤه العينُ مجسّماً.
 *
 * **ثلاث مسائلَ حُلّت هنا:**
 *
 * ١ ــ **الكلفة.** حسابُ ميلِ كلّ لوحٍ مع كلّ حركةِ مؤشّرٍ يقتل الأداء
 *      في صفحةٍ فيها خمسون لوحاً. فلا يُحسب إلّا للألواح الظاهرةِ في
 *      الشاشة — يعرفها `IntersectionObserver` — والكتابةُ مرّةً واحدة
 *      في إطارِ الرسم.
 *
 * ٢ ــ **الوميض.** كتابةُ `transform` مباشرةً تُلغي أيَّ حركةِ دخولٍ
 *      يكتبها framer-motion على العنصر نفسِه. فتُكتب على **غلافٍ**
 *      مستقلّ يُنشأ حول كلّ لوح، فتتراكب الحركتان ولا تتزاحمان.
 *
 * ٣ ــ **الدوار.** ميلٌ قويٌّ على كلّ شيءٍ يُتعب العين. فالنصُّ يميل
 *      أقلَّ من الصورة، والخلفيةُ تعاكس، والشدّةُ تُختار من اللوحة.
 */

import { useEffect } from "react";

export type Depth3D = "off" | "soft" | "deep" | "tilt" | "extreme";

/** ما يميل في الصفحة — ولكلٍّ نصيبُه من الميل. */
const TARGETS = ".sx-card, .plan-card, .stat-tile, .course-card, .fq-item, .ct-panel, .hero-media, .hero-text";

export function Page3D({ mode = "off" }: { mode?: Depth3D }) {
  useEffect(() => {
    if (mode === "off") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.querySelector("main") ?? document.body;
    root.classList.add("p3d", `p3d-${mode}`);

    const live = new Set<HTMLElement>();
    const io = new IntersectionObserver(
      (rows) => {
        for (const r of rows) {
          const el = r.target as HTMLElement;
          if (r.isIntersecting) live.add(el);
          else {
            live.delete(el);
            el.style.removeProperty("--t3d-x");
            el.style.removeProperty("--t3d-y");
          }
        }
      },
      { rootMargin: "120px" }
    );

    const found = Array.from(root.querySelectorAll<HTMLElement>(TARGETS));
    for (const el of found) {
      el.classList.add("t3d");
      io.observe(el);
    }

    let px = 0;
    let py = 0;
    let frame = 0;

    const paint = () => {
      frame = 0;
      for (const el of live) {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        /*
          الموضعُ نسبةً إلى اللوح نفسِه لا إلى الشاشة — ولهذا يتفاوت
          الميلُ بين لوحٍ وآخر، وهو التفاوتُ الذي يُقرأ عمقاً.
        */
        const cx = (px - (r.left + r.width / 2)) / (r.width / 2);
        const cy = (py - (r.top + r.height / 2)) / (r.height / 2);
        el.style.setProperty("--t3d-x", Math.max(-1.4, Math.min(1.4, cx)).toFixed(3));
        el.style.setProperty("--t3d-y", Math.max(-1.4, Math.min(1.4, cy)).toFixed(3));
      }
      /* المتغيّرُ العامّ للخلفيات والزخارف */
      (root as HTMLElement).style.setProperty("--h3d-x", ((px / window.innerWidth) * 2 - 1).toFixed(3));
      (root as HTMLElement).style.setProperty("--h3d-y", ((py / window.innerHeight) * 2 - 1).toFixed(3));
    };

    const queue = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      queue();
    };
    /* الهاتفُ لا مؤشّرَ له، فيُقاد بميله — وهو أصدقُ إحساساً بالعمق. */
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      px = window.innerWidth / 2 + (Math.max(-30, Math.min(30, e.gamma)) / 30) * (window.innerWidth / 2);
      py = window.innerHeight / 2 + (Math.max(-30, Math.min(30, e.beta - 45)) / 30) * (window.innerHeight / 2);
      queue();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("deviceorientation", onTilt);
    window.addEventListener("scroll", queue, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("deviceorientation", onTilt);
      window.removeEventListener("scroll", queue);
      if (frame) cancelAnimationFrame(frame);
      io.disconnect();
      for (const el of found) {
        el.classList.remove("t3d");
        el.style.removeProperty("--t3d-x");
        el.style.removeProperty("--t3d-y");
      }
      root.classList.remove("p3d", `p3d-${mode}`);
    };
  }, [mode]);

  return null;
}
