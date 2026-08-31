"use client";

/**
 * معاينةٌ تُسحب فيها البطاقة إلى موضعها.
 * ------------------------------------------------------------------
 * ثلاثةُ أزرارٍ تقول «داخل اللوح» و«تحته» تصفُ الموضعَ ولا تُريه. ومن لم
 * يفتح بوّابةَ الطالب لا يعرف ما الفرقُ حتّى يُبدّل ويخرج ويفتح ويرجع.
 *
 * فهذه معاينةٌ مصغّرةٌ لشاشة الطالب فيها موضعان، وبطاقةُ المؤشّرات تُسحب
 * بينهما. فيُرى الأثرُ قبل الحفظ في الموضع الذي يُقرَّر فيه.
 *
 * **والسحبُ لا يكفي وحدَه.** `draggable` في HTML لا يعمل باللمس أصلاً —
 * فمن يفتح اللوحةَ من جوّاله لا يستطيع تحريكَ شيء. ولا يبلغه من يستعمل
 * لوحةَ المفاتيح. فكلُّ موضعٍ **زرٌّ أيضاً**: يُضغط فتنتقل إليه البطاقة.
 * والسحبُ زينةٌ فوق ذلك لا شرطٌ له.
 *
 * **والمعاينةُ ليست الشاشة.** هي مخطّطٌ لا نسخةٌ مصغّرة: مستطيلٌ للوح
 * وثلاثةٌ للبطاقات. ومحاكاةُ الشاشة بدقّةٍ تُوهم بما لا يقع — خطٌّ يختلف،
 * وصورةٌ تنقص، ولونٌ يتبدّل بإعدادٍ آخر.
 */

import { useState } from "react";
import { GripVertical, LayoutPanelTop, Rows3, Check } from "lucide-react";

type Where = "in" | "out";

export function StatsPlacement({
  value, onChange, busy,
}: {
  /** `auto` = يتبع التخطيط — والمعاينةُ تُري ما يقرّره فعلاً. */
  value: "auto" | "in" | "out";
  effective?: Where;
  onChange: (v: Where) => void | Promise<void>;
  busy?: boolean;
}) {
  const [over, setOver] = useState<Where | null>(null);
  const [dragging, setDragging] = useState(false);

  /* في وضع «يتبع التخطيط» تُعرض البطاقةُ تحت اللوح — وهو الأشيع. */
  const at: Where = value === "in" ? "in" : "out";

  const chip = (
    <div
      draggable={!busy}
      onDragStart={(e) => {
        setDragging(true);
        e.dataTransfer.effectAllowed = "move";
        /* بعضُ المتصفّحات لا تبدأ السحبَ بلا حمولة */
        e.dataTransfer.setData("text/plain", "stats");
      }}
      onDragEnd={() => { setDragging(false); setOver(null); }}
      className={`sp-chip ${dragging ? "is-drag" : ""}`}
      title="اسحبني إلى الموضع الذي تريد"
    >
      <GripVertical className="size-3.5 shrink-0 opacity-60" />
      <span className="sp-chip-t">بطاقات المؤشّرات</span>
      <span className="sp-chip-m">
        <i /><i /><i />
      </span>
    </div>
  );

  const zone = (w: Where, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      disabled={busy}
      onClick={() => at !== w && onChange(w)}
      onDragOver={(e) => { e.preventDefault(); setOver(w); }}
      onDragLeave={() => setOver((c) => (c === w ? null : c))}
      onDrop={(e) => {
        e.preventDefault();
        setOver(null);
        setDragging(false);
        if (at !== w) onChange(w);
      }}
      className={`sp-zone ${over === w ? "is-over" : ""} ${at === w ? "is-here" : ""}`}
      aria-pressed={at === w}
    >
      {at === w ? chip : (
        <span className="sp-hint">
          {icon}
          {label}
        </span>
      )}
    </button>
  );

  return (
    <div className="sp">
      {/* لوحُ الترحيب — مخطّطٌ لا نسخة */}
      <div className="sp-panel">
        <div className="sp-panel-head">
          <span className="sp-ava" />
          <span className="sp-lines">
            <i className="sp-l1" />
            <i className="sp-l2" />
          </span>
        </div>
        {zone("in", "أفلِتها هنا — داخل اللوح", <LayoutPanelTop className="size-3.5" />)}
      </div>

      {zone("out", "أفلِتها هنا — تحت اللوح", <Rows3 className="size-3.5" />)}

      {/* بقيّةُ الصفحة — تُري أنّ الموضعَ يُزيح ما تحته */}
      <div className="sp-rest">
        <span /><span /><span />
      </div>

      <p className="sp-note">
        {value === "auto" ? (
          <>الموضعُ يتبع التخطيطَ المختار الآن. اسحب البطاقةَ — أو اضغط موضعاً — لتثبيتها.</>
        ) : (
          <><Check className="inline size-3 text-emerald-600" /> مثبَّتةٌ {at === "in" ? "داخل اللوح" : "تحت اللوح"} مهما تغيّر التخطيط.</>
        )}
      </p>
    </div>
  );
}
