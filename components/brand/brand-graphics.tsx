/**
 * رسومُ الهوية — شاراتٌ حيّةٌ وزخارفُ هندسية.
 * ------------------------------------------------------------------
 * كلُّها **مبنيّةٌ بالحساب لا مرسومةٌ باليد**: النجمةُ تُولَّد من عدد
 * أضلاعها ونسبةِ قطريها، والقوسُ من نسبةٍ مئويةٍ ومحيطِ الدائرة،
 * والمندالا من حلقاتٍ متتابعةٍ بزوايا محسوبة. فما فيها خطٌّ في غير
 * موضعه ولا زاويةٌ تقريبيّة — وهذا ما يفرّق الزخرفةَ الحقيقية عن رسمٍ
 * يحاكيها.
 *
 * **ولا لونَ مثبَّتاً:** الكلُّ `currentColor` أو `--brand-primary` و
 * `--brand-accent` — فتتبع هويةَ المنصّة وتتبدّل معها في الفاتح والداكن.
 *
 * **والقياساتُ موحّدة:** الشاراتُ `viewBox="0 0 100 100"` والزخارفُ
 * `0 0 400 300`. فتُوضع أيُّ واحدةٍ مكان أختها بلا ضبط.
 */

import type { SVGProps } from "react";

const PRIMARY = "var(--brand-primary, hsl(var(--primary)))";
const ACCENT = "var(--brand-accent, hsl(var(--gold)))";

/* ============================================================
   أدواتُ البناء
   ============================================================ */

/** نجمةٌ منتظمة: `n` رأساً، نصفُ قطرٍ خارجيٌّ `R` وداخليٌّ `R*k`. */
function star(n: number, R: number, k: number, cx = 0, cy = 0): string {
  const p: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (i * Math.PI) / n - Math.PI / 2;
    const r = i % 2 === 0 ? R : R * k;
    p.push(`${(cx + Math.cos(a) * r).toFixed(2)} ${(cy + Math.sin(a) * r).toFixed(2)}`);
  }
  return `M${p.join("L")}Z`;
}

/** مضلّعٌ منتظم. */
function poly(n: number, R: number, cx = 0, cy = 0, turn = 0): string {
  const p: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i * 2 * Math.PI) / n - Math.PI / 2 + turn;
    p.push(`${(cx + Math.cos(a) * R).toFixed(2)} ${(cy + Math.sin(a) * R).toFixed(2)}`);
  }
  return `M${p.join("L")}Z`;
}

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
const ar = (n: number) => n.toLocaleString("ar-EG");

/* ============================================================
   ١ ــ مقياسُ الاشتراك
   ------------------------------------------------------------
   قوسٌ مفتوحٌ من الأسفل بزاوية ٢٧٠° — لا دائرةٌ كاملة: الدائرةُ الكاملةُ
   لا يُعرف أين تبدأ فلا يُقرأ منها امتلاءٌ من نصف امتلاء.
   ============================================================ */
export function RingGauge({
  value,
  label,
  caption,
  size = 100,
  thickness = 8,
  className = "",
  ...rest
}: SVGProps<SVGSVGElement> & {
  /** ٠..١٠٠ */
  value: number;
  /** النصُّ في القلب — الافتراضُ النسبةُ نفسُها. */
  label?: string;
  caption?: string;
  size?: number;
  thickness?: number;
}) {
  const v = clamp(value);
  const R = 38;
  /* ٢٧٠° من محيط الدائرة، والبقيّةُ فجوةٌ سفليّة */
  const arc = 2 * Math.PI * R * 0.75;
  const gap = 2 * Math.PI * R * 0.25;

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={`shrink-0 ${className}`} fill="none" {...rest}>
      <g transform="rotate(135 50 50)">
        <circle
          cx="50" cy="50" r={R}
          stroke={ACCENT} strokeOpacity="0.22" strokeWidth={thickness} strokeLinecap="round"
          strokeDasharray={`${arc} ${gap}`}
        />
        <circle
          cx="50" cy="50" r={R}
          stroke={ACCENT} strokeWidth={thickness} strokeLinecap="round"
          strokeDasharray={`${(arc * v) / 100} ${arc + gap}`}
          className="transition-[stroke-dasharray] duration-700 ease-out"
        />
      </g>
      {/* علاماتُ الرُبع — تُقرأ منها النسبةُ بلا رقم */}
      <g stroke={ACCENT} strokeOpacity="0.4" strokeWidth="1.6" strokeLinecap="round">
        {[0, 1, 2, 3].map((i) => {
          const a = (135 + i * 67.5) * (Math.PI / 180);
          return (
            <line
              key={i}
              x1={50 + Math.cos(a) * (R - thickness / 2 - 3)}
              y1={50 + Math.sin(a) * (R - thickness / 2 - 3)}
              x2={50 + Math.cos(a) * (R - thickness / 2 - 8)}
              y2={50 + Math.sin(a) * (R - thickness / 2 - 8)}
            />
          );
        })}
      </g>
      <text x="50" y={caption ? 49 : 55} textAnchor="middle" fill={PRIMARY} fontSize="21" fontWeight="700">
        {label ?? `${ar(v)}٪`}
      </text>
      {caption && (
        <text x="50" y="64" textAnchor="middle" fill={PRIMARY} fillOpacity="0.6" fontSize="9" fontWeight="600">
          {caption}
        </text>
      )}
    </svg>
  );
}

/* ============================================================
   ٢ ــ قرصُ التقدّم
   ------------------------------------------------------------
   حلقةٌ كاملةٌ مقسومةٌ إلى خطواتٍ بفواصل — فيُعدّ المنجَزُ ولا يُقدَّر.
   ============================================================ */
export function ProgressDonut({
  value,
  steps = 12,
  size = 100,
  thickness = 9,
  center,
  className = "",
  ...rest
}: SVGProps<SVGSVGElement> & {
  value: number;
  /** عددُ القطع — الخطواتُ التي يُعدّ بها. */
  steps?: number;
  size?: number;
  thickness?: number;
  center?: string;
}) {
  const v = clamp(value);
  const R = 38;
  const done = Math.round((v / 100) * steps);
  const seg = (2 * Math.PI) / steps;
  /* فجوةٌ ثابتةٌ بالدرجات بين القطع — لا بالنسبة، وإلّا تغيّرت مع العدد */
  const pad = 0.06;

  const piece = (i: number) => {
    const a0 = i * seg - Math.PI / 2 + pad;
    const a1 = (i + 1) * seg - Math.PI / 2 - pad;
    const x0 = 50 + Math.cos(a0) * R;
    const y0 = 50 + Math.sin(a0) * R;
    const x1 = 50 + Math.cos(a1) * R;
    const y1 = 50 + Math.sin(a1) * R;
    return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${R} ${R} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  };

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={`shrink-0 ${className}`} fill="none" {...rest}>
      {Array.from({ length: steps }, (_, i) => (
        <path
          key={i}
          d={piece(i)}
          stroke={i < done ? ACCENT : PRIMARY}
          strokeOpacity={i < done ? 1 : 0.14}
          strokeWidth={thickness}
          strokeLinecap="round"
          className="transition-[stroke-opacity] duration-500"
        />
      ))}
      <text x="50" y="56" textAnchor="middle" fill={PRIMARY} fontSize="20" fontWeight="700">
        {center ?? `${ar(v)}٪`}
      </text>
    </svg>
  );
}

/* ============================================================
   ٣ ــ شارةُ المواظبة
   ------------------------------------------------------------
   نجمةٌ ثمانيّةٌ خلف مثمّنٍ خلف رقم — ثلاثُ طبقاتٍ تعطي الشارةَ ثقلَها.
   ============================================================ */
export function StreakBadge({
  count,
  label = "يوماً",
  size = 100,
  className = "",
  ...rest
}: SVGProps<SVGSVGElement> & { count: number; label?: string; size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={`shrink-0 ${className}`} fill="none" {...rest}>
      <g transform="translate(50 50)">
        <path d={star(8, 46, 0.62)} fill={ACCENT} fillOpacity="0.2" />
        <path d={star(8, 46, 0.62)} stroke={ACCENT} strokeWidth="1.6" strokeLinejoin="round" />
        <path d={poly(8, 30, 0, 0, Math.PI / 8)} fill={PRIMARY} />
        <path d={poly(8, 24, 0, 0, Math.PI / 8)} stroke={ACCENT} strokeOpacity="0.55" strokeWidth="1.2" />
      </g>
      <text x="50" y={label ? 50 : 57} textAnchor="middle" fill={ACCENT} fontSize="22" fontWeight="700">
        {ar(count)}
      </text>
      {label && (
        <text x="50" y="63" textAnchor="middle" fill={ACCENT} fillOpacity="0.75" fontSize="9" fontWeight="600">
          {label}
        </text>
      )}
    </svg>
  );
}

/* ============================================================
   ٤ ــ المندالا
   ------------------------------------------------------------
   حلقاتٌ متتابعةٌ من نجومٍ ومضلّعات، كلُّ حلقةٍ بعددٍ من أضلاع الأولى —
   وهو أصلُ بناء الشمسة في التزيين الإسلامي.
   ============================================================ */
export function Mandala({
  folds = 12,
  size = 300,
  strokeWidth = 1.2,
  className = "",
  ...rest
}: SVGProps<SVGSVGElement> & {
  /** عددُ الأضلاع — ٨ و١٢ و١٦ هي المستعملةُ في التزيين الإسلامي. */
  folds?: 8 | 12 | 16;
  size?: number;
  strokeWidth?: number;
}) {
  const R = 145;
  /*
    نسبةُ القطرين تتبع عددَ الأضلاع.
    نجمةٌ باثني عشر رأساً ونسبةٍ ٠٫٥ تخرج إبراً متشابكة — تبدو انفجاراً
    لا زخرفة. فكلّما زادت الأضلاعُ زادت النسبةُ ليبقى الرأسُ مثلّثاً
    معتدلاً: ٠٫٦٠ للثمانية، و٠٫٧٤ للاثني عشر، و٠٫٨٠ للستة عشر.
  */
  const k = folds === 8 ? 0.6 : folds === 12 ? 0.74 : 0.8;

  return (
    <svg viewBox="0 0 300 300" width={size} height={size} className={`shrink-0 ${className}`} fill="none" {...rest}>
      <g transform="translate(150 150)" stroke={ACCENT} strokeWidth={strokeWidth} strokeLinejoin="round">
        {/*
          بناءٌ بأنطقةٍ متتابعة لا بنجومٍ متراكبة.
          كلُّ نطاقٍ يشغل حلقةً بينه وبين ما قبله فلا يتشابك معه — وهذا
          هو ترتيبُ الشمسة في المخطوط: حاشيةٌ ثمّ نجمةٌ ثمّ مضلّعٌ ثمّ قلب.
        */}

        {/* ١ ــ الحاشيةُ الخارجية: حلقتان بينهما عقودٌ صغيرة */}
        <circle r={R} strokeOpacity={0.35} />
        <circle r={R * 0.88} strokeOpacity={0.35} />
        <g strokeOpacity={0.45}>
          {Array.from({ length: folds * 2 }, (_, i) => {
            const a = (i * Math.PI) / folds - Math.PI / 2;
            return (
              <circle
                key={i}
                cx={Math.cos(a) * R * 0.94}
                cy={Math.sin(a) * R * 0.94}
                r={3.4}
              />
            );
          })}
        </g>

        {/* ٢ ــ النجمةُ الكبرى — وحدَها في نطاقها فلا تزاحمها أخرى */}
        <path d={star(folds, R * 0.8, k)} strokeOpacity={0.85} />
        <path d={star(folds, R * 0.8 * k, 0.86)} strokeOpacity={0.3} />

        {/* ٣ ــ المضلّعُ الحاصر، مُدارٌ نصفَ خطوةٍ فتقع رؤوسُه بين رؤوسها */}
        <path d={poly(folds, R * 0.44, 0, 0, Math.PI / folds)} stroke={PRIMARY} strokeOpacity={0.45} />
        <circle r={R * 0.44} strokeOpacity={0.25} />

        {/* ٤ ــ القلب: نجمةٌ صغيرةٌ في مضلّعٍ صغير */}
        <path d={star(folds, R * 0.3, k)} strokeOpacity={0.6} />
        <circle r={R * 0.14} stroke={PRIMARY} strokeOpacity={0.4} />
        <circle r={R * 0.06} fill={ACCENT} stroke="none" />

        {/*
          الضلوعُ في الحاشية وحدَها — لا تعبر اللوحةَ كلَّها.
          العابرةُ تقطع النجمةَ والمضلّعَ فتصير الزخرفةُ شبكةً مشوّشة.
        */}
        <g strokeOpacity={0.28}>
          {Array.from({ length: folds }, (_, i) => {
            const a = (i * 2 * Math.PI) / folds - Math.PI / 2;
            return (
              <line
                key={i}
                x1={Math.cos(a) * R * 0.88}
                y1={Math.sin(a) * R * 0.88}
                x2={Math.cos(a) * R}
                y2={Math.sin(a) * R}
              />
            );
          })}
        </g>
      </g>
    </svg>
  );
}

/* ============================================================
   ٥ ــ حقلُ النجوم
   ------------------------------------------------------------
   توزيعٌ محسوبٌ لا عشوائيّ: البذرةُ تُنتج المواضعَ نفسَها في كلّ رسم،
   فلا يقفز النقشُ بين الخادم والمتصفّح.
   ============================================================ */
export function StarField({
  count = 22,
  seed = 7,
  className = "",
  ...rest
}: SVGProps<SVGSVGElement> & { count?: number; seed?: number }) {
  let s = seed * 9301 + 49297;
  const next = () => ((s = (s * 9301 + 49297) % 233280) / 233280);

  const items = Array.from({ length: count }, (_, i) => ({
    key: i,
    x: next() * 400,
    y: next() * 300,
    r: 4 + next() * 13,
    o: 0.14 + next() * 0.4,
  }));

  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className={`shrink-0 ${className}`}
      fill="none"
      {...rest}
    >
      <defs>
        <radialGradient id="sf-fade" cx="0.5" cy="0.45" r="0.7">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id="sf-mask">
          <rect width="400" height="300" fill="url(#sf-fade)" />
        </mask>
      </defs>
      <g mask="url(#sf-mask)" stroke={ACCENT} strokeWidth="1" strokeLinejoin="round">
        {items.map((it) => (
          <path key={it.key} d={star(8, it.r, 0.42, it.x, it.y)} strokeOpacity={it.o} />
        ))}
      </g>
    </svg>
  );
}

/* ============================================================
   ٦ ــ الفاصل
   ------------------------------------------------------------
   خطّان متلاشيان ومعيّنٌ في القلب — كما تُفصل أبوابُ المخطوط.
   ============================================================ */
export function Divider({
  width = 400,
  className = "",
  ...rest
}: SVGProps<SVGSVGElement> & { width?: number }) {
  return (
    <svg viewBox="0 0 400 24" width={width} height={24} className={className} fill="none" {...rest}>
      <defs>
        <linearGradient id="dv-r" x1="0" x2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="dv-l" x1="1" x2="0">
          <stop offset="0" stopColor="currentColor" stopOpacity="0" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <g stroke={ACCENT} className="text-[color:var(--brand-accent,hsl(var(--gold)))]">
        <path d="M8 12h150" stroke="url(#dv-r)" strokeWidth="1.4" />
        <path d="M242 12h150" stroke="url(#dv-l)" strokeWidth="1.4" />
        <path d={star(4, 9, 0.42, 200, 12)} strokeWidth="1.4" strokeLinejoin="round" />
        <path d={star(4, 4.5, 0.42, 200, 12)} fill={ACCENT} stroke="none" />
        <circle cx="172" cy="12" r="2.2" strokeWidth="1.2" />
        <circle cx="228" cy="12" r="2.2" strokeWidth="1.2" />
      </g>
    </svg>
  );
}
