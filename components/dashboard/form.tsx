"use client";

/**
 * حقولُ لوحة الإدارة — طقمٌ واحد.
 * ------------------------------------------------------------------
 * كان تعريفُ `.inp` و`.lbl` **منسوخاً حرفيّاً في عشر شاشات** داخل وسم
 * `<style>` في كلٍّ منها، ومعه ثمانيةُ تنويعاتٍ من أصنافٍ محلّيّة. فكلُّ
 * شاشةٍ تُعرّف حقولَها بنفسها، وأيُّ تحسينٍ يلزم تكرارُه عشراً — فلا
 * يُكرَّر، فتتباعد الشاشاتُ حتّى تبدو من منصّاتٍ مختلفة.
 *
 * **وهذا الطقمُ يُنهي ذلك**: تعريفٌ واحدٌ في `globals.css` وأغلفةٌ هنا.
 *
 * وثلاثُ قواعدَ تحكمه:
 *
 * ١ ــ **التسميةُ فوق الحقل لا داخلَه.** التسميةُ داخل الحقل (placeholder)
 *      تختفي أوّلَ ما يُكتب — فمن عاد إلى نموذجٍ ملأه لا يعرف ما هذا
 *      الحقل. وهي فوقَه تبقى.
 *
 * ٢ ــ **التلميحُ تحت الحقل لا فوقَه.** يُقرأ بعد أن يُرى الحقل، لا قبله.
 *
 * ٣ ــ **الخطأُ يُزيح التلميحَ لا يُضاف إليه.** سطران أحدُهما يشرح والآخرُ
 *      يُنكر يجعل القارئَ يوازن بينهما.
 *
 * ولا ألوانَ جديدة: الطقمُ يستعمل رموزَ الهوية كما هي — الحدُّ من
 * `--border`، والتركيزُ من `--primary`، والسطحُ من `--card`.
 */

import type { ReactNode } from "react";

/* ــ الأصنافُ الأساسيّة، مصدرٌ واحدٌ يُستعمل ولا يُنسخ ــ */
export const inputCls =
  "w-full rounded-2xl border border-border bg-card/60 px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary/60 focus:ring-2 focus:ring-primary/15 disabled:opacity-50";

export const labelCls = "mb-1.5 block text-xs font-semibold text-muted-foreground";

export function Field({
  label, hint, error, required, children, className = "",
}: {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className={labelCls}>
          {label}
          {required && <span className="text-rose-500"> *</span>}
        </span>
      )}
      {children}
      {/* الخطأُ يُزيح التلميحَ — لا يُصفّان معاً فيتنازعا */}
      {error ? (
        <span className="mt-1.5 block text-[11px] font-bold leading-relaxed text-rose-600 dark:text-rose-400">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-[11px] leading-relaxed text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}

export function Input(p: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className={`${inputCls} ${p.className ?? ""}`} />;
}

export function Textarea(p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...p} className={`${inputCls} resize-y ${p.className ?? ""}`} />;
}

export function Select(p: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...p} className={`${inputCls} ${p.className ?? ""}`} />;
}

/**
 * مفتاحٌ يُدار — لا مربّعُ اختيار.
 * المربّعُ يقول «مؤشَّرٌ أو لا»، والمفتاحُ يقول «يعمل أو لا» — وأكثرُ
 * إعدادات اللوحة من النوع الثاني.
 */
export function Toggle({
  on, onChange, label, hint, disabled,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
  hint?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className="flex w-full items-start gap-3 rounded-2xl border border-border bg-card/60 p-3.5 text-right transition hover:border-primary/40 disabled:opacity-50"
    >
      <span
        className={`mt-0.5 relative h-5 w-9 shrink-0 rounded-full transition ${on ? "bg-[hsl(var(--primary))]" : "bg-muted"}`}
      >
        {/*
          الزرُّ يتحرّك بـ`inset-inline-start` لا بـ`left`: الصفحةُ من
          اليمين لليسار، و`left` تُصيبها هنا وتُخطئها في أيّ سياقٍ يُقلب.
        */}
        <span
          className="absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-[inset-inline-start]"
          style={{ insetInlineStart: on ? "1.125rem" : "0.125rem" }}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold">{label}</span>
        {hint && <span className="mt-0.5 block text-[11px] leading-relaxed text-muted-foreground">{hint}</span>}
      </span>
    </button>
  );
}

/**
 * اختيارٌ من قليل — أزرارٌ ظاهرةٌ لا قائمةٌ منسدلة.
 * القائمةُ تُخفي الخياراتِ كلَّها إلّا واحداً وتحتاج ضغطتين؛ وثلاثةُ
 * خياراتٍ أو أقلُّ تُعرض كلُّها وتُختار بضغطة.
 */
export function Choice<T extends string | number>({
  value, onChange, options, className = "",
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode; hint?: ReactNode }[];
  className?: string;
}) {
  return (
    <div className={`grid gap-2 ${options.length > 2 ? "sm:grid-cols-3" : "sm:grid-cols-2"} ${className}`}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={on}
            className={`rounded-2xl border px-3.5 py-2.5 text-right transition ${
              on ? "border-primary bg-primary/[0.07] ring-2 ring-primary/25" : "border-border hover:border-primary/40"
            }`}
          >
            <span className="block text-sm font-bold">{o.label}</span>
            {o.hint && <span className="mt-0.5 block text-[11px] leading-relaxed text-muted-foreground">{o.hint}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** صفٌّ من حقلين أو ثلاثة — بدل تكرار `grid gap-3 sm:grid-cols-2` في كلّ شاشة. */
export function Row({ cols = 2, children, className = "" }: { cols?: 2 | 3 | 4; children: ReactNode; className?: string }) {
  const c = cols === 4 ? "sm:grid-cols-4" : cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
  return <div className={`grid gap-3 ${c} ${className}`}>{children}</div>;
}

/**
 * حالةٌ فارغةٌ موحّدة.
 * كلُّ شاشةٍ كانت تكتب فقرتَها بحدٍّ متقطّع؛ وهي أوّلُ ما يراه الأستاذُ في
 * منصّةٍ جديدة، فيجب أن تقول **ما يفعل** لا «لا يوجد».
 */
export function Empty({
  icon, title, hint, action,
}: {
  icon?: ReactNode;
  title: string;
  hint?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-border px-6 py-12 text-center">
      {icon && <span className="grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">{icon}</span>}
      <p className="font-display text-sm font-extrabold">{title}</p>
      {hint && <p className="max-w-sm text-[11px] leading-relaxed text-muted-foreground">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
