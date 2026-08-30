"use client";

/**
 * `Section` — قسمٌ ظاهرٌ داخل شاشة الإدارة.
 * ------------------------------------------------------------------
 * كانت الشاشاتُ تُقسَّم بألواحٍ **تُطوى** (`Fold`). والطيُّ يحلّ مشكلةَ
 * الطول ويصنع مشكلةً أسوأَ منها: من لا يعرف أين الحقلُ يفتح الألواحَ
 * واحداً واحداً ليبحث فيها، ومن يعرفه يضغط ضغطةً زائدةً في كلّ زيارة.
 * والمشرفُ لا يقرأ الشاشةَ مرّةً ويمضي — يعمل فيها كلَّ يوم.
 *
 * فصارت أقساماً **مفتوحةً دائماً**: عنوانٌ واضحٌ فوق كلّ مجموعة، وسطرٌ
 * يقول ما تفعله، وحدٌّ يفصلها عمّا قبلها. فتُقرأ الشاشةُ بالتمرير — وهو
 * أسرعُ من الضغط — ويُعرف ما فيها بنظرةٍ واحدةٍ لا بفتحٍ متتابع.
 *
 * **وقاعدةُ القسم: مهمّةٌ واحدة.** قسمٌ يجمع مهمّتين يعود إلى التداخل
 * الذي فُرّ منه؛ وقسمٌ لمهمّةٍ نصفِ مهمّةٍ يُكثر العناوينَ بلا فائدة.
 *
 * **والطيُّ يبقى في القائمة الجانبية وحدَها**: هناك المطلوبُ الانتقالُ لا
 * العمل، والقائمةُ الطويلةُ تُخفي أقسامَها في شاشةٍ واحدة.
 *
 * ولا حالةَ تُحفظ ولا `storageKey`: القسمُ لا يُطوى، فلا شيءَ يُذكَر.
 */

import { useId, type ReactNode } from "react";
import { useSectionTab } from "./section-tabs";

export function Section({
  title,
  subtitle,
  icon,
  count,
  actions,
  tone,
  children,
  className = "",
}: {
  title: ReactNode;
  /** سطرٌ يقول ما يفعله القسم — لا تكرارٌ للعنوان. */
  subtitle?: ReactNode;
  icon?: ReactNode;
  /** عددٌ يُعرض شارةً — لا يُعرض إن كان صفراً بلا معنى. */
  count?: number;
  /** أزرارٌ تخصّ القسم كلَّه — تُوضع في ترويسته لا في متنه. */
  actions?: ReactNode;
  /** `alert` يصبغ الترويسةَ حين ينتظر القسمُ عملاً. */
  tone?: "alert" | "calm";
  children: ReactNode;
  className?: string;
}) {
  const alert = tone === "alert";
  /*
    البطاقةُ تُسجّل نفسَها في شريط التبويب، فيُبنى من الموجود فعلاً.
    والعنوانُ نصٌّ حين يكون نصّاً؛ وما ليس نصّاً لا اسمَ له في الشريط
    فيُسمّى «قسم».
  */
  const uid = useId();
  const label = typeof title === "string" ? title : "قسم";
  const { hidden } = useSectionTab(uid, label);
  /*
    ويُخفى بـ`hidden` لا بالإزالة من الشجرة: الإزالةُ تُفقد ما كُتب في
    حقوله وترجعه فارغاً عند العودة إليه — وهو أسوأُ ما يقع في نموذجٍ طويل.
  */

  return (
    <section
      /*
        `data-section` هو ما يجده الشريطُ العائم — فلا يُوصَل بيدٍ في كلّ
        صفحة، ولا تحتاج صفحةٌ تُضاف غداً سطراً يُكتب لها.
        والعنوانُ نصٌّ حين يكون نصّاً؛ وإن كان عنصراً فلا اسمَ له فيُترك.
      */
      data-section={typeof title === "string" ? title : undefined}
      hidden={hidden}
      className={`glass scroll-mt-24 overflow-hidden rounded-3xl shadow-bento ${hidden ? "hidden" : ""} ${className}`}
    >
      <header
        className={`flex flex-wrap items-center gap-3 border-b px-4 py-3 sm:px-5 ${
          alert ? "border-rose-500/30 bg-rose-500/[0.07]" : "border-border bg-muted/40"
        }`}
      >
        {icon && (
          <span
            className={`grid size-8 shrink-0 place-items-center rounded-xl ${
              alert ? "bg-rose-500/15 text-rose-600 dark:text-rose-400" : "bg-primary/12 text-primary"
            }`}
          >
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-kufi flex items-center gap-2 text-sm font-bold leading-tight">
            {title}
            {count !== undefined && count > 0 && (
              <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-extrabold text-primary">
                {count.toLocaleString("ar-EG")}
              </span>
            )}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </header>

      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

/**
 * عنوانُ مجموعةٍ من الأقسام — لِما زاد على خمسةٍ في شاشةٍ واحدة.
 * الأقسامُ الكثيرةُ المتساويةُ في الوزن تعود قائمةً طويلةً وإن كانت
 * مقسَّمة؛ وعنوانٌ فوق كلّ ثلاثةٍ أو أربعةٍ يعيد الترتيبَ طبقتين.
 */
export function SectionGroup({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-3 mt-8 first:mt-0">
      <p className="font-display text-base font-extrabold">{title}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
