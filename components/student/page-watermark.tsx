"use client";

/**
 * علامةٌ مائيّةٌ على البوّابة كلِّها.
 * ------------------------------------------------------------------
 * `VideoWatermark` تحمي المقطع، وهذه تحمي ما سواه: **أسئلةُ الواجبات
 * تُصوَّر وتُنشر** أكثرَ ممّا يُصوَّر الفيديو — لقطةٌ واحدةٌ تكفي لنقل
 * الامتحان كلِّه إلى مجموعةٍ فيها مئة طالب. والفيديو يحتاج تسجيلاً
 * وحجماً ورفعاً؛ السؤالُ يحتاج ضغطةً واحدة.
 *
 * وثلاثةُ قيودٍ تجعلها تصلح للاستعمال لا للزينة:
 *
 * ١ ــ **خافتةٌ جدّاً (٤٪).** علامةٌ تُزاحم القراءةَ تُطفأ في أوّل شكوى،
 *      فلا تحمي شيئاً. وهذه تُرى في اللقطة ولا تُلاحَظ في القراءة.
 *
 * ٢ ــ **مبلَّطةٌ مائلة.** الواحدةُ في ركنٍ تُقصّ، والمبلَّطةُ تغطّي المتنَ
 *      نفسَه — فقصُّها قصٌّ للمحتوى. والميلُ يُصعّب محوَها آليّاً.
 *
 * ٣ ــ **صورةُ خلفيّةٍ لا عناصرُ DOM.** نمطٌ واحدٌ في `background-image`
 *      يُرسم مرّةً ويتكرّر بلا تكلفة، ولا يُثقل الشجرةَ بمئة عنصرٍ فارغ.
 *
 * وهي `fixed` تحت `<body>` مباشرةً لا داخل غلافٍ متحوّل: `position:
 * fixed` تسقط إلى نسبيّةٍ تحت سلفٍ عليه `transform` أو `filter`.
 */

import { useMemo } from "react";

export function PageWatermark({ name, tag }: { name?: string; tag?: string }) {
  const bg = useMemo(() => {
    if (!name) return null;
    const label = tag ? `${name} · ${tag}` : name;
    /*
      النصُّ يمرّ في `data:` فيلزمه ترميزٌ آمن: `encodeURIComponent`
      وحدَها لا تكفي لـ`#` في الألوان، والمحارفُ العربيّة تمرّ بها سليمة.
      و`&` و`<` تُهرَّب لأنّها من نحو XML لا من نحو الروابط.
    */
    const safe = label.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="380" height="200">
<text x="50%" y="50%" fill="#0b1a33" font-family="system-ui,Segoe UI,Tahoma,sans-serif"
 font-size="17" font-weight="700" text-anchor="middle" dominant-baseline="middle"
 transform="rotate(-28 190 100)">${safe}</text></svg>`;
    return `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`;
  }, [name, tag]);

  /* بلا اسمٍ لا علامة: نصٌّ لا يدلّ على أحدٍ لا يردع أحداً. */
  if (!bg) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        pointerEvents: "none",
        backgroundImage: bg,
        backgroundRepeat: "repeat",
        opacity: 0.04,
        /* لا تُطبع ولا تُحدَّد ولا تُنسخ */
        userSelect: "none",
      }}
    />
  );
}
