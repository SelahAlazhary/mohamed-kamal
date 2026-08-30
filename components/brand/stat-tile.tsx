"use client";

/**
 * بطاقة مؤشّر — تصميم عصري خفيف.
 * ------------------------------------------------------------------
 * بديل «لوح المؤشّر» المزخرف: بطاقة زجاجية بحواف طرية، شارة أيقونة
 * متدرّجة، رقم كبير بارز، وشريط رفيع يوضّح النسبة. الزخرفة الوحيدة
 * وهج متدرّج خفيف في الركن — يعطي إحساساً شاباً بلا ثقل.
 *
 * الحلقة (حين تُطلب) مرسومة SVG بحدّ سميك وطرف مدوّر وتدرّج، وتُملأ
 * عند الظهور.
 *
 * الأرقام والعناوين HTML — لقارئات الشاشة والاتجاه RTL.
 */
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useUid } from "./use-uid";

export function StatTile({
  value,
  unit,
  label,
  icon,
  /** ٠..١٠٠ — يرسم حلقة بدل الرقم الكبير. */
  ring,
  /** ٠..١٠٠ — شريط رفيع أسفل البطاقة. */
  bar,
  /** نصّ صغير يظهر كشارة أعلى اليسار. */
  badge,
  index = 0,
  className = "",
  shape,
  tone = "ink",
  bareIcon = false,
}: {
  value?: ReactNode;
  unit?: string;
  label: string;
  icon?: ReactNode;
  ring?: number;
  bar?: number;
  badge?: string;
  index?: number;
  className?: string;
  /** شكل البطاقة من الهيئة المختارة — قصّ أو انحناء. */
  shape?: React.CSSProperties;
  /**
   * أين تجلس البطاقة:
   * ink     = فوق لوح الحبر الداكن (نصّ أبيض).
   * surface = على خلفية الصفحة (نصّ من الثيم) — وإلا صار النصّ أبيض على
   *           ورق فاتح فاختفى، وهو ما يقع في التخطيطات التي تُخرج
   *           المؤشّرات من اللوح.
   */
  tone?: "ink" | "surface";
  /**
   * يُعرض الرمزُ بلا صندوقٍ حوله.
   * الصورةُ المتحرّكة الملوّنة تحمل شكلَها ولونَها، فصندوقٌ داكنٌ حولها
   * يقصّها ويزاحم ألوانَها. والصندوقُ إنّما وُضع لرمزٍ خطّيٍّ بلا جسم.
   */
  bareIcon?: boolean;
}) {
  const ink = tone === "ink";
  const uid = useUid("tile");
  const pct = Math.max(0, Math.min(100, ring ?? 0));
  /* نصفُ القطر يتّسع ليحيط بلوح الصورة لا ليجاوره. */
  const r = 29;
  const circ = 2 * Math.PI * r;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      style={shape}
      /* الحشو = حشو البطاقة + هامش أمان الشكل، فلا يقصّ القصّ النصّ. */
      className={`stat-tile group relative overflow-hidden backdrop-blur-sm transition-shadow [padding-block:calc(1rem+var(--shape-pad-y,0px))] [padding-inline:calc(1rem+var(--shape-pad-x,0px))] sm:[padding-block:calc(1.25rem+var(--shape-pad-y,0px))] sm:[padding-inline:calc(1.25rem+var(--shape-pad-x,0px))] ${
        ink
          ? "bg-white/[0.07] ring-1 ring-white/15 hover:ring-white/30"
          : "bg-card ring-1 ring-[hsl(var(--gold)/0.35)] hover:ring-[hsl(var(--gold)/0.6)]"
      } ${shape ? "" : "rounded-[1.4rem]"} ${className}`}
    >
      {/*
        صورة البطاقة المرفوعة — طبقة زينة خلف النصّ.
        تُرسم دائماً ولا تظهر إلا حين يُضبط ‎--tile-art‎، فيبقى الترتيب
        واحداً في كل البطاقات ولا يعتمد المكوّن على قراءة الإعداد.
      */}
      <span aria-hidden="true" className="tile-art" />

      {/* وهج متدرّج في الركن — يضيء قليلاً عند المرور */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-10 -top-12 size-32 rounded-full opacity-35 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
        style={{ background: "radial-gradient(circle, hsl(var(--gold)) 0%, transparent 70%)" }}
      />

      {/* الشارةُ النصّية في الركن الأيمن — فوق كلّ شيء ولا تُزاحم */}
      {badge && (
        <span
          className={`tile-badge-text font-kufi absolute end-4 top-4 rounded-full px-2.5 py-1 text-[10px] font-bold ${
            ink
              ? "bg-[hsl(var(--primary-foreground)/0.15)] text-[hsl(var(--primary-foreground)/0.9)]"
              : "bg-[hsl(var(--gold)/0.28)] text-[hsl(var(--primary))]"
          }`}
        >
          {badge}
        </span>
      )}

      {/*
        صفٌّ واحدٌ لا كتلتان.
        كانت الشارةُ في صفٍّ والنصُّ في كتلةٍ تحتها، فيتباعدان على البطاقة
        العريضة ويبقى بينهما فراغٌ لا يملؤه شيء. والصفُّ الواحد يجعل
        الصورةَ والرقمَ يتحاذيان مهما اتّسعت البطاقة.

        و`flex-row-reverse` يضع أوّلَ عنصرٍ يساراً في العربية — فالصورةُ
        يساراً والنصُّ يمينَها، بلا هوامشَ تلقائيّةٍ تنكسر إذا غاب أحدُهما.
      */}
      <div className="tile-head relative flex flex-row-reverse items-center gap-4">
        {icon && (
          <span className="relative grid shrink-0 place-items-center" style={{ width: "5.75rem", height: "5.75rem" }}>
            {/*
              حلقةُ التقدّم تحيط بالصورة لا تجاورها.
              كانتا شيئين متجاورين يقتسمان العرض؛ وإحاطتُها بها تجعل
              الرقمَ والصورةَ شيئاً واحداً يُقرأ دفعةً، وتُفرغ العرضَ
              للنصّ.
            */}
            {ring !== undefined && (
              <svg viewBox="0 0 64 64" className="absolute inset-0 size-full -rotate-90" fill="none" aria-hidden="true">
                <defs>
                  <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="hsl(var(--gold))" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" />
                  </linearGradient>
                </defs>
                <circle
                  cx="32"
                  cy="32"
                  r={r}
                  stroke={ink ? "hsl(0 0% 100% / 0.16)" : "hsl(var(--gold) / 0.28)"}
                  strokeWidth="4"
                />
                <motion.circle
                  cx="32"
                  cy="32"
                  r={r}
                  stroke={`url(#${uid}-g)`}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  initial={{ strokeDashoffset: circ }}
                  animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
                  transition={{ duration: 1.1, ease: "easeOut", delay: 0.25 + index * 0.08 }}
                />
              </svg>
            )}

            {/* لوحُ الصورة — أبيضُ بظلٍّ غائر، والصورةُ تملؤه */}
            <span
              className="ic-frame tile-badge grid place-items-center overflow-hidden rounded-[1.15rem] bg-white"
              style={{
                /* اللوحُ يتّسع للصورة المتحرّكة: صورةٌ بتفاصيلَ في ٧٠ بكسل
                   تُرى رمزاً لا صورة. */
                width: "5.6rem",
                height: "5.6rem",
                boxShadow: "0 2px 5px -2px rgb(0 0 0 / 0.22), 0 10px 22px -10px rgb(0 0 0 / 0.45)",
              }}
            >
              {icon}
            </span>
          </span>
        )}

        {/* النصّ — يملأ ما بقي فلا يبقى فراغٌ في البطاقة العريضة */}
        <div className="tile-body relative min-w-0 flex-1">
          {ring !== undefined ? (
            <p
              className={`tile-text font-display leading-none ${
                ink ? "text-[hsl(var(--primary-foreground))]" : "text-foreground"
              }`}
            >
              <span className="text-[2.4rem] font-bold tracking-tight">{pct.toLocaleString("ar-EG")}</span>
              <span className="font-kufi ms-1 text-base font-bold opacity-70">٪</span>
            </p>
          ) : (
            <p
              className={`tile-text font-display flex items-baseline gap-1.5 leading-none ${
                ink ? "text-[hsl(var(--primary-foreground))]" : "text-foreground"
              }`}
            >
              <span className="text-[2.4rem] font-bold tracking-tight">{value}</span>
              {unit && (
                <span
                  className={`font-kufi text-sm font-bold ${
                    ink ? "text-[hsl(var(--primary-foreground)/0.7)]" : "text-muted-foreground"
                  }`}
                >
                  {unit}
                </span>
              )}
            </p>
          )}

          <p
            className={`tile-text font-kufi mt-2 text-[0.82rem] font-bold leading-snug ${
              ink ? "text-[hsl(var(--primary-foreground)/0.8)]" : "text-muted-foreground"
            }`}
          >
            {label}
          </p>

          {/* شريط النسبة — تحت النصّ لا تحت البطاقة، فيقيس ما فوقه */}
          {bar !== undefined && (
            <div className={`relative mt-3 h-1.5 overflow-hidden rounded-full ${ink ? "bg-white/15" : "bg-[hsl(var(--gold)/0.25)]"}`}>
              <motion.span
                className="block h-full rounded-full"
                style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--gold)))" }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, Math.min(100, bar))}%` }}
                transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 + index * 0.08 }}
              />
            </div>
          )}
        </div>
      </div>

    </motion.div>
  );
}
