"use client";

/**
 * زرُّ العودة إلى أعلى الصفحة.
 * ------------------------------------------------------------------
 * ثلاثةُ قراراتٍ تجعله زرّاً محترفاً لا سهماً معلّقاً:
 *
 * ١ ــ **لا يظهر إلّا حين يُحتاج.** زرُّ صعودٍ ظاهرٌ وأنت في الأعلى
 *      عبثٌ يشغل ركناً. فيظهر بعد نزول شاشةٍ ونصف، ويغيب بالعودة.
 *
 * ٢ ــ **يقول كم بقي.** حلقةٌ حوله تمتلئ بمقدار ما قُرئ من الصفحة —
 *      فيصير مؤشّرَ تقدّمٍ وزرَّ عودةٍ في آنٍ، ويُخبر القارئ أين هو.
 *
 * ٣ ــ **يُحسب في إطار الرسم لا مع كلّ نقطة تمرير.** حدثُ التمرير يقع
 *      عشراتِ المرّات في الثانية، والقراءةُ من `document` فيه تُجبر
 *      المتصفّح على إعادة حساب التخطيط. فتُقرأ مرّةً في الإطار.
 *
 * والحلقةُ تُرسم بـ`stroke-dashoffset` على دائرةٍ واحدة: لا مكتبةَ
 * مخطّطاتٍ ولا حسابَ زوايا — محيطُ الدائرة معلومٌ ونسبةُ الامتلاء تُطرح
 * منه.
 */

import { useEffect, useRef, useState } from "react";

/** نصفُ قطر الحلقة ومحيطُها — يُحسبان مرّةً لا في كلّ رسم. */
const R = 22;
const C = 2 * Math.PI * R;

export function ToTop() {
  const [shown, setShown] = useState(false);
  const [pct, setPct] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    const read = () => {
      frame.current = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setShown(y > window.innerHeight * 1.5);
      setPct(max > 0 ? Math.min(1, y / max) : 0);
    };
    const queue = () => {
      if (!frame.current) frame.current = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  return (
    <button
      type="button"
      aria-label="العودة إلى أعلى الصفحة"
      title="أعلى الصفحة"
      onClick={() =>
        window.scrollTo({
          top: 0,
          /* من فضّل تقليل الحركة يقفز ولا ينزلق. */
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        })
      }
      className={`to-top ${shown ? "to-top-on" : ""}`}
    >
      <svg viewBox="0 0 52 52" className="size-full" aria-hidden="true">
        {/* السطح */}
        <circle cx="26" cy="26" r="24" className="tt-face" />
        {/* مسارُ الحلقة */}
        <circle cx="26" cy="26" r={R} className="tt-track" fill="none" />
        {/* الامتلاء — يبدأ من الأعلى ويدور مع القراءة */}
        <circle
          cx="26"
          cy="26"
          r={R}
          className="tt-fill"
          fill="none"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - pct)}
          transform="rotate(-90 26 26)"
        />
        {/* السهم — ضلعان وساقٌ، لا حرفٌ من خطّ */}
        <path d="M26 33V19M19.5 25.5 26 19l6.5 6.5" className="tt-arrow" fill="none" />
      </svg>
    </button>
  );
}
