/**
 * زخارفُ الموادّ الشرعية.
 * ------------------------------------------------------------------
 * كانت خلفياتُ الأقسام تُرسم بحروفٍ عربيةٍ ومصطلحاتِ نحوٍ وبلاغة — تصلح
 * لمنصّةِ لغةٍ لا لمنصّةِ فقهٍ وتفسير. وهذه بديلُها: مفرداتٌ من عالَم
 * الموادّ الشرعية نفسِه.
 *
 * **ولماذا أشكالٌ لا كلمات؟** الكلمةُ في الخلفية تُقرأ رغماً عن القارئ
 * فتزاحم المتن، والشكلُ يُرى ولا يُقرأ. وهذا الفرقُ بين زخرفةٍ وضجيج.
 *
 * **وما الذي يجعلها محترفة؟** ثلاثةُ أمورٍ لا رابعَ لها:
 *
 * ١ ــ **الهندسةُ محسوبةٌ لا مقدَّرة.** نجمةُ الثمانية هنا اتّحادُ
 *      مربّعين أحدُهما مدارٌ ٤٥°، ومنعطفاتُها على نصف قطرٍ يساوي
 *      R·cos45°/cos22.5° — لا R/٢ كما تُرسم تخميناً. والفرقُ بينهما
 *      تراه العينُ وإن لم تسمّه: المحسوبةُ تستقيم، والمقدَّرةُ تلتوي.
 *
 * ٢ ــ **تراتبُ التفصيل.** الهيكلُ بخطٍّ كامل، والتفصيلُ الداخليُّ
 *      بنصفه وبشفافيةٍ أقلّ. فتُقرأ الصورةُ من بعيدٍ بهيكلها، ومن قريبٍ
 *      بتفصيلها — ولا تصير شبكةً متساويةَ الوزن لا مدخلَ لها.
 *
 * ٣ ــ **الحشوةُ تحت الخطّ.** مساحةٌ خافتةٌ تحت الحدّ تعطي الشكلَ جسماً؛
 *      والخطُّ وحدَه يبقى رسمَ أسلاك.
 *
 * وكلُّها على شبكة ٦٤ بحشوٍ متساوٍ، فتصطفّ إذا اجتمعت ولا يبدو أحدُها
 * أكبرَ من أخيه.
 */

import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

/** غلافٌ موحّد: نفسُ الشبكة ونفسُ سُمك الخطّ ونفسُ النهايات للجميع. */
function Art({ children, className = "", ...p }: P) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...p}
    >
      {children}
    </svg>
  );
}

/* ================= المصحف على الرَّحْل ================= */
export function IconMushaf(p: P) {
  return (
    <Art {...p}>
      {/* الحشوة */}
      <path d="M32 20C25.5 14.5 16 13.5 9 15.5v25C16 38.5 25.5 39.5 32 45z" fill="currentColor" opacity="0.09" stroke="none" />
      <path d="M32 20c6.5-5.5 16-6.5 23-4.5v25c-7-2-16.5-1-23 4.5z" fill="currentColor" opacity="0.09" stroke="none" />
      {/* الصفحتان */}
      <path d="M32 20C25.5 14.5 16 13.5 9 15.5v25C16 38.5 25.5 39.5 32 45z" />
      <path d="M32 20c6.5-5.5 16-6.5 23-4.5v25c-7-2-16.5-1-23 4.5z" />
      <path d="M32 20v25" strokeWidth="1.2" opacity="0.55" />
      {/* السطور — بأنصاف الأوزان فتُقرأ قريباً ولا تزاحم بعيداً */}
      <g strokeWidth="0.9" opacity="0.5">
        <path d="M14 22h12M14 26.5h10M14 31h12M38 22h12M40 26.5h10M38 31h12" />
      </g>
      {/* الرَّحْل — ساقان متقاطعتان */}
      <path d="M18 46l28 10M46 46L18 56" strokeWidth="1.6" />
      <path d="M22 58h20" strokeWidth="1.4" opacity="0.7" />
    </Art>
  );
}

/* ================= المحراب ================= */
export function IconMihrab(p: P) {
  return (
    <Art {...p}>
      {/* القوسُ المدبَّب: قوسان متقاطعان مركزُ كلٍّ على طرفِ الآخر */}
      <path d="M14 56V28C14 17 22 8 32 8s18 9 18 20v28z" fill="currentColor" opacity="0.08" stroke="none" />
      <path d="M14 56V28C14 17 22 8 32 8s18 9 18 20v28" />
      {/* المقرنص — ثلاثُ درجاتٍ متناقصة، أبسطُ صورةٍ تُقرأ في هذا الحجم */}
      <g strokeWidth="1.1" opacity="0.6">
        <path d="M18 30h28M21 25h22M24 20h16" />
      </g>
      {/* الطاقةُ الداخلية */}
      <path d="M32 22c-4.5 0-8 3.5-8 8v26h16V30c0-4.5-3.5-8-8-8z" strokeWidth="1.2" opacity="0.55" />
      {/* العمودان وتاجاهما */}
      <path d="M14 56h36M10 56V34M54 56V34" strokeWidth="1.6" />
      <path d="M7 34h6l-3-4zM51 34h6l-3-4z" strokeWidth="1.2" opacity="0.75" />
    </Art>
  );
}

/* ================= المنارة ================= */
export function IconMinaret(p: P) {
  return (
    <Art {...p}>
      <path d="M25 22h14v34H25z" fill="currentColor" opacity="0.08" stroke="none" />
      {/* الهلالُ والقمّة */}
      <path d="M32 4v5" strokeWidth="1.4" />
      <path d="M34.5 11a3.4 3.4 0 1 1-3-4.4 4 4 0 1 0 3 4.4z" strokeWidth="1.2" />
      {/* الطابقُ الأعلى */}
      <path d="M28 22V16h8v6" strokeWidth="1.4" />
      {/* الشُّرفة — بروزٌ عن البدن، وهي علامةُ المنارة المملوكية */}
      <path d="M22 26h20v-4H22z" strokeWidth="1.4" />
      <g strokeWidth="0.9" opacity="0.55"><path d="M26 26v-4M30 26v-4M34 26v-4M38 26v-4" /></g>
      {/* البدن */}
      <path d="M25 26v30h14V26" />
      <path d="M29 40h6v16h-6z" strokeWidth="1.1" opacity="0.6" />
      <path d="M19 56h26" strokeWidth="1.6" />
    </Art>
  );
}

/* ================= ميزانُ الفرائض ================= */
export function IconMizan(p: P) {
  return (
    <Art {...p}>
      <path d="M6 24h16l-8 12zM42 24h16l-8 12z" fill="currentColor" opacity="0.09" stroke="none" />
      {/* العمودُ والقاعدة */}
      <path d="M32 16v34M22 54h20" strokeWidth="1.8" />
      <path d="M26 50h12l4 4H22z" strokeWidth="1.3" opacity="0.7" />
      {/* الذراع */}
      <path d="M10 22h44" strokeWidth="1.8" />
      <circle cx="32" cy="18" r="3.4" strokeWidth="1.5" />
      {/* السلاسل — ثلاثةٌ لكلّ كفّة، وهي ما يجعله ميزاناً لا مثلّثين */}
      <g strokeWidth="0.9" opacity="0.65">
        <path d="M14 22v2M14 24l-8 0M14 24l8 0" />
        <path d="M50 22v2M50 24l-8 0M50 24l8 0" />
      </g>
      {/* الكفّتان */}
      <path d="M6 24h16l-8 12zM42 24h16l-8 12z" strokeWidth="1.5" />
    </Art>
  );
}

/* ================= السُّبحة ================= */
export function IconMisbaha(p: P) {
  return (
    <Art {...p}>
      {/* الخيط */}
      <path d="M32 9a21 21 0 1 0 0 42" strokeWidth="1" opacity="0.5" />
      {/* الخرز — الكبيرةُ فواصلُ الثلث، وهي وضعُها في السُّبحة */}
      <g fill="currentColor" stroke="none"><circle cx="36.37" cy="9.46" r="2.6"/><circle cx="40.7" cy="10.88" r="1.9"/><circle cx="44.62" cy="13.21" r="1.9"/><circle cx="47.94" cy="16.33" r="1.9"/><circle cx="50.52" cy="20.09" r="1.9"/><circle cx="52.22" cy="24.32" r="1.9"/><circle cx="52.97" cy="28.82" r="1.9"/><circle cx="52.73" cy="33.37" r="1.9"/><circle cx="51.51" cy="37.76" r="1.9"/><circle cx="49.38" cy="41.79" r="1.9"/><circle cx="46.42" cy="45.26" r="1.9"/><circle cx="42.79" cy="48.02" r="2.6"/><circle cx="38.65" cy="49.92" r="1.9"/><circle cx="34.2" cy="50.88" r="1.9"/><circle cx="29.64" cy="50.87" r="1.9"/><circle cx="25.19" cy="49.87" r="1.9"/><circle cx="21.06" cy="47.93" r="1.9"/><circle cx="17.45" cy="45.15" r="1.9"/><circle cx="14.53" cy="41.65" r="1.9"/><circle cx="12.43" cy="37.6" r="1.9"/><circle cx="11.25" cy="33.2" r="1.9"/><circle cx="11.04" cy="28.65" r="1.9"/><circle cx="11.83" cy="24.16" r="2.6"/><circle cx="13.57" cy="19.94" r="1.9"/><circle cx="16.17" cy="16.2" r="1.9"/><circle cx="19.52" cy="13.11" r="1.9"/><circle cx="23.46" cy="10.82" r="1.9"/></g>
      {/* الإمام — الفاصلُ المستطيل وشُرّابتُه */}
      <path d="M29.5 8h5v7h-5z" strokeWidth="1.3" fill="currentColor" fillOpacity="0.12" />
      <path d="M32 51v5" strokeWidth="1.3" />
      <path d="M28.5 56h7l-3.5 5z" strokeWidth="1.2" fill="currentColor" fillOpacity="0.12" />
    </Art>
  );
}

/* ================= الخاتمُ الثمانيّ ================= */
export function IconKhatam(p: P) {
  return (
    <Art {...p}>
      <path d="M32 5 L39.91 12.91 L51.09 12.91 L51.09 24.09 L59 32 L51.09 39.91 L51.09 51.09 L39.91 51.09 L32 59 L24.09 51.09 L12.91 51.09 L12.91 39.91 L5 32 L12.91 24.09 L12.91 12.91 L24.09 12.91 Z" fill="currentColor" opacity="0.08" stroke="none" />
      <path d="M32 5 L39.91 12.91 L51.09 12.91 L51.09 24.09 L59 32 L51.09 39.91 L51.09 51.09 L39.91 51.09 L32 59 L24.09 51.09 L12.91 51.09 L12.91 39.91 L5 32 L12.91 24.09 L12.91 12.91 L24.09 12.91 Z" strokeWidth="1.6" />
      <path d="M32 14.5 L37.13 19.63 L44.37 19.63 L44.37 26.87 L49.5 32 L44.37 37.13 L44.37 44.37 L37.13 44.37 L32 49.5 L26.87 44.37 L19.63 44.37 L19.63 37.13 L14.5 32 L19.63 26.87 L19.63 19.63 L26.87 19.63 Z" strokeWidth="1" opacity="0.6" />
      <path d="M32 21.5 L39.42 24.58 L42.5 32 L39.42 39.42 L32 42.5 L24.58 39.42 L21.5 32 L24.58 24.58 Z" strokeWidth="0.9" opacity="0.45" />
    </Art>
  );
}

/* ================= قنديلُ المسجد ================= */
export function IconQandil(p: P) {
  return (
    <Art {...p}>
      <path d="M20 30c0-7 5.5-12 12-12s12 5 12 12l-3 16H23z" fill="currentColor" opacity="0.09" stroke="none" />
      {/* التعليق */}
      <path d="M32 4v6M24 12l8-2 8 2" strokeWidth="1.2" opacity="0.7" />
      {/* البدن */}
      <path d="M20 30c0-7 5.5-12 12-12s12 5 12 12l-3 16H23z" />
      <path d="M17 30h30" strokeWidth="1.3" />
      {/* الفتحاتُ المزخرفة */}
      <g strokeWidth="0.9" opacity="0.55">
        <path d="M27 34a5 5 0 0 1 10 0M26 40h12" />
      </g>
      <path d="M27 46h10l-5 8z" strokeWidth="1.3" />
    </Art>
  );
}

/* ================= المحبرةُ والقلم ================= */
export function IconQalam(p: P) {
  return (
    <Art {...p}>
      <path d="M18 40h18v12a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4z" fill="currentColor" opacity="0.09" stroke="none" />
      {/* القلم — مبريٌّ بزاويةٍ كما يُبرى القصب */}
      <path d="M50 8l6 6-26 26-8 2 2-8z" strokeWidth="1.5" />
      <path d="M46 12l6 6" strokeWidth="1.1" opacity="0.6" />
      <path d="M24 34l-2 8 8-2" strokeWidth="1.2" opacity="0.75" />
      {/* المحبرة */}
      <path d="M18 40h18v12a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4z" />
      <path d="M15 40h24" strokeWidth="1.5" />
      <path d="M23 46h8" strokeWidth="1" opacity="0.55" />
    </Art>
  );
}

/**
 * خلفيةُ القسم — أشكالٌ متناثرةٌ بترتيبٍ محسوب.
 *
 * والبذرةُ تجعل التوزيعَ ثابتاً بين الخادم والمتصفّح: توزيعٌ عشوائيٌّ
 * حقيقيٌّ يختلف بينهما فتشتكي React من عدم التطابق.
 */
export function ShariBackdrop({
  count = 12,
  seed = 7,
  opacity = 0.4,
  tone = "text-primary/10",
  className = "",
}: {
  count?: number;
  seed?: number;
  opacity?: number;
  tone?: string;
  className?: string;
}) {
  const shapes = [IconMushaf, IconMihrab, IconMinaret, IconMizan, IconMisbaha, IconKhatam, IconQandil, IconQalam];

  let s = seed * 9301 + 49297;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  /*
    التوزيعُ بالرفض لا بالرمي.
    الرميُ الحرّ يُنتج كتلاً ملتصقةً وفراغاتٍ واسعة — وهي أظهرُ ما يفسد
    الخلفية. فكلُّ موضعٍ يُجرَّب ويُرفض إن قارب سابقَه، ويُعاد حتى يبتعد.
    وإن ضاق المكانُ عن العدد المطلوب تُوقَف المحاولةُ ولا يُحشر شكلٌ فوق
    آخر: خلفيةٌ فيها ثمانيةٌ متباعدةٌ خيرٌ من اثني عشرَ متلاصقة.
  */
  const items: { key: number; Shape: (p: P) => React.JSX.Element; x: number; y: number; size: number; spin: number }[] = [];
  const MIN = 19;               // أقلُّ مسافةٍ بين مركزين بالنسبة المئوية
  let guard = count * 60;

  while (items.length < count && guard-- > 0) {
    const x = 4 + rnd() * 88;
    const y = 4 + rnd() * 84;
    const far = items.every((o) => Math.hypot(o.x - x, o.y - y) >= MIN);
    if (!far) continue;
    items.push({
      key: items.length,
      Shape: shapes[Math.floor(rnd() * shapes.length)],
      x,
      y,
      size: 38 + Math.round(rnd() * 54),
      spin: Math.round(rnd() * 24 - 12),
    });
  }

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${tone} ${className}`}
      style={{
        opacity,
        WebkitMaskImage: "radial-gradient(72% 66% at 50% 45%, #000 28%, transparent 100%)",
        maskImage: "radial-gradient(72% 66% at 50% 45%, #000 28%, transparent 100%)",
      }}
    >
      {items.map(({ key, Shape, x, y, size, spin }) => (
        <Shape
          key={key}
          className="absolute"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: size,
            height: size,
            /* الإزاحةُ بنصف الحجم تجعل الإحداثيَّ مركزاً لا ركناً —
               وبها وحدَها يصحّ قياسُ التباعد بين المراكز. */
            transform: `translate(50%, -50%) rotate(${spin}deg)`,
          }}
        />
      ))}
    </div>
  );
}
