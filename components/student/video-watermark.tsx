"use client";

/**
 * علامةٌ مائيّةٌ باسم المشاهد.
 * ------------------------------------------------------------------
 * **هذه هي الحمايةُ الحقيقيّة، لا منعُ اللقطة.** لا موقعَ في الدنيا يمنع
 * تصويرَ الشاشة: يلتقطها نظامُ التشغيل، أو كاميرا هاتفٍ ثانٍ موجَّهةٍ
 * إلى الشاشة — ولا واجهةَ برمجيّةً في أيّ متصفّحٍ تمنع ذلك. فمن وعد
 * بالمنع باع وهماً.
 *
 * والعلامةُ تعمل من جهةٍ أخرى: لا تمنع النسخَ بل **تجعل الناسخَ
 * معروفاً**. مقطعٌ مسرَّبٌ عليه اسمُ صاحبه ورقمُه يعود إليه في دقيقة،
 * وهذا وحدَه يردع أكثرَ ممّا يردع كلُّ اختصارٍ يُصدّ.
 *
 * وثلاثةُ قيودٍ تجعلها تصلح للاستعمال لا للزينة:
 *
 * ١ ــ **`pointer-events: none`.** المشغّلُ تحتها، والضغطُ يجب أن يبلغه.
 *      علامةٌ تبتلع ضغطةَ التشغيل عيبٌ لا حماية.
 *
 * ٢ ــ **موضعان متقابلان — أسفلُ اليمين وأعلى اليسار.** قصُّ حافّةٍ
 *      واحدةٍ يُذهب واحدةً ويُبقي الأخرى، وقصُّ الاثنتين معاً يأكل
 *      المقطعَ نفسَه.
 *
 * ٣ ــ **تتنقّل ببطء.** موضعٌ ثابتٌ يُغطّى بمستطيلٍ أسود مرّةً واحدة،
 *      وموضعٌ يزحف يلزمه تتبّعٌ في كلّ لقطة. والحركةُ بطيئةٌ (كلُّ اثنتي
 *      عشرة ثانية) فلا تُشتّت المشاهد، وتقف عند `prefers-reduced-motion`.
 *
 * والنصُّ خافتٌ يُقرأ ولا يُزعج: أبيضُ بشفافيّةٍ وظلٌّ تحته، فيظهر على
 * المشهد الفاتح والداكن معاً.
 */

import { useEffect, useState } from "react";

/** أربعةُ مواضعَ في كلّ ركن — تتناوب عليها العلامتان. */
const SPOTS = [
  { bottom: "6%", right: "4%" },
  { bottom: "14%", right: "10%" },
  { bottom: "8%", right: "16%" },
  { bottom: "18%", right: "5%" },
] as const;

const SPOTS_TL = [
  { top: "6%", left: "4%" },
  { top: "14%", left: "10%" },
  { top: "8%", left: "16%" },
  { top: "18%", left: "5%" },
] as const;

export function VideoWatermark({
  name,
  /** رقمُ الحساب — يختصر التتبّعَ حين يتشابه اسمان. */
  tag,
}: {
  name?: string;
  tag?: string;
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    /* من طلب تقليلَ الحركة يأخذ علامةً ثابتة — والحمايةُ تبقى. */
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((v) => (v + 1) % SPOTS.length), 12_000);
    return () => clearInterval(t);
  }, []);

  /* بلا اسمٍ لا علامة: «مشاهد» لا تدلّ على أحدٍ فلا تردع أحداً. */
  if (!name) return null;

  const label = tag ? `${name} · ${tag}` : name;

  const mark = (style: React.CSSProperties, key: string) => (
    <span
      key={key}
      aria-hidden="true"
      style={{
        ...style,
        position: "absolute",
        color: "rgba(255,255,255,0.34)",
        textShadow: "0 1px 3px rgba(0,0,0,0.75)",
        fontSize: "clamp(0.6rem, 1.35vw, 0.85rem)",
        fontWeight: 700,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
        transition: "top 1.6s ease, bottom 1.6s ease, left 1.6s ease, right 1.6s ease",
        mixBlendMode: "difference",
      }}
    >
      {label}
    </span>
  );

  return (
    /*
      طبقةٌ فوق المشغّل لا تمسّه: `inset-0` لتغطّي المساحة، و
      `pointer-events-none` كي تمرّ كلُّ ضغطةٍ إلى ما تحتها، و`z-20` كي
      تعلو غطاءَ درايف الذي يجلس عند `z-10`.
    */
    <span className="pointer-events-none absolute inset-0 z-20 select-none overflow-hidden">
      {mark(SPOTS[i], "br")}
      {mark(SPOTS_TL[i], "tl")}
    </span>
  );
}
