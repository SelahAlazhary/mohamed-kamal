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
}) {
  const ink = tone === "ink";
  const uid = useUid("tile");
  const pct = Math.max(0, Math.min(100, ring ?? 0));
  const r = 26;
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
        className="pointer-events-none absolute -left-8 -top-10 size-28 rounded-full opacity-40 blur-2xl transition-opacity duration-500 group-hover:opacity-70"
        style={{ background: "radial-gradient(circle, hsl(var(--gold-light)) 0%, transparent 70%)" }}
      />

      <div className="tile-head relative flex items-start justify-between gap-2">
        {icon && (
          <span
            /*
              الشارةُ بيضاءُ بظلٍّ غائر.
              والرمزُ فيها كحليٌّ لا ذهبيّ — لا اختياراً بل قياساً: الذهبُ
              على الأبيض ١٫٥١:١ فلا يُظهر شكلاً، والكحليُّ ٩٫٢٩:١. فلو
              وُضع الذهبُ هنا لبدت الشارةُ فارغةً لا رمزَ فيها.
            */
            className="ic-frame tile-badge grid size-10 place-items-center rounded-2xl bg-white text-[hsl(var(--primary))]"
            style={{ boxShadow: "0 2px 4px -1px rgb(0 0 0 / 0.28), 0 8px 18px -8px rgb(0 0 0 / 0.55)" }}
          >
            {icon}
          </span>
        )}
        {badge && (
          <span className={`font-kufi rounded-full px-2.5 py-1 text-[10px] font-bold ${ink ? "bg-[hsl(var(--primary-foreground)/0.15)] text-[hsl(var(--primary-foreground)/0.9)]" : "bg-accent/15 text-accent"}`}>
            {badge}
          </span>
        )}
      </div>

      {/* الجسم: حلقة أو رقم */}
      {ring !== undefined ? (
        <div className="tile-body relative mt-3 flex items-center gap-3">
          <span className="relative grid size-[4.5rem] shrink-0 place-items-center">
            <svg viewBox="0 0 64 64" className="size-full -rotate-90" fill="none" aria-hidden="true">
              <defs>
                <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="hsl(var(--gold-light))" />
                  <stop offset="100%" stopColor="hsl(var(--gold))" />
                </linearGradient>
              </defs>
              <circle cx="32" cy="32" r={r} stroke={ink ? "hsl(0 0% 100% / 0.16)" : "hsl(var(--muted))"} strokeWidth="7" />
              <motion.circle
                cx="32"
                cy="32"
                r={r}
                stroke={`url(#${uid}-g)`}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={circ}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
                transition={{ duration: 1.1, ease: "easeOut", delay: 0.25 + index * 0.08 }}
              />
            </svg>
            <span className={`tile-text font-display absolute text-base font-bold ${ink ? "text-[hsl(var(--primary-foreground))]" : "text-foreground"}`}>
              {pct.toLocaleString("ar-EG")}٪
            </span>
          </span>
          <span className={`tile-text font-kufi min-w-0 text-[0.78rem] font-bold leading-snug ${ink ? "text-[hsl(var(--primary-foreground)/0.8)]" : "text-muted-foreground"}`}>
            {label}
          </span>
        </div>
      ) : (
        <div className="tile-body relative mt-4">
          <p className={`tile-text font-display flex items-baseline gap-1.5 leading-none ${ink ? "text-[hsl(var(--primary-foreground))]" : "text-foreground"}`}>
            <span className="text-[2.35rem] font-bold tracking-tight">{value}</span>
            {unit && <span className={`font-kufi text-sm font-bold ${ink ? "text-[hsl(var(--primary-foreground)/0.7)]" : "text-muted-foreground"}`}>{unit}</span>}
          </p>
          <p className={`tile-text font-kufi mt-2 text-[0.78rem] font-bold ${ink ? "text-[hsl(var(--primary-foreground)/0.75)]" : "text-muted-foreground"}`}>{label}</p>
        </div>
      )}

      {/* شريط النسبة */}
      {bar !== undefined && (
        <div className={`relative mt-4 h-1.5 overflow-hidden rounded-full ${ink ? "bg-white/15" : "bg-muted"}`}>
          <motion.span
            className="block h-full rounded-full"
            style={{ background: "linear-gradient(90deg, hsl(var(--gold)), hsl(var(--gold-light)))" }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(0, Math.min(100, bar))}%` }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 + index * 0.08 }}
          />
        </div>
      )}
    </motion.div>
  );
}
