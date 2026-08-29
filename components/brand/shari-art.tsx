/**
 * زخارفُ الموادّ الشرعية.
 * ------------------------------------------------------------------
 * كانت خلفياتُ الأقسام تُرسم بحروفٍ عربيةٍ ومصطلحاتِ نحوٍ وبلاغة —
 * تصلح لمنصّةِ لغةٍ لا لمنصّةِ فقهٍ وتفسير. وهذه بديلُها: أشكالٌ من
 * عالَم الموادّ الشرعية نفسِه.
 *
 * **ولماذا أشكالٌ لا كلمات؟** لأنّ الكلمةَ في الخلفية تُقرأ رغماً عن
 * القارئ فتزاحم المتن، والشكلَ يُرى ولا يُقرأ. وهذا هو الفرقُ بين
 * زخرفةٍ وضجيج.
 *
 * وكلُّها هندسةٌ خالصة: لا صورةَ تُحمَّل، ولا خطَّ ينتظر، ولا رسمَ يدٍ
 * يتفاوت — أقواسٌ ودوائرُ ونجومٌ ثمانيّة، تتمدّد بأيّ حجمٍ بلا تكسّر.
 */

import type { SVGProps } from "react";

/* ---------- مفرداتُ الزخرفة ---------- */

/** مصحفٌ مفتوح — للتفسير وأصول الدين. */
export function IconMushaf({ className = "", ...p }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true" {...p}>
      <path d="M32 20C25 14 15 13 8 15v34c7-2 17-1 24 5z" stroke="currentColor" strokeWidth="2" />
      <path d="M32 20c7-6 17-7 24-5v34c-7-2-17-1-24 5z" stroke="currentColor" strokeWidth="2" />
      <path d="M32 20v34" stroke="currentColor" strokeWidth="1.4" opacity="0.55" />
      <path d="M14 24h11M14 30h9M39 24h11M39 30h9" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
    </svg>
  );
}

/** محرابٌ بعمودين — للفقه والعبادات. */
export function IconMihrab({ className = "", ...p }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true" {...p}>
      <path d="M32 8c-11 0-20 9-20 20v28h40V28c0-11-9-20-20-20z" stroke="currentColor" strokeWidth="2" />
      <path d="M32 20c-5 0-9 4-9 9v27h18V29c0-5-4-9-9-9z" stroke="currentColor" strokeWidth="1.3" opacity="0.55" />
      <path d="M8 56h48M14 28h-4M50 28h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** منارة — للحديث والسند. */
export function IconMinaret({ className = "", ...p }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true" {...p}>
      <path d="M32 4l4 8h-8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M26 12h12v10H26zM24 22h16v10H24zM22 32h20v24H22z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M18 56h28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M29 40h6v16h-6z" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
    </svg>
  );
}

/** ميزانٌ ذو كفّتين — للميراث والفرائض. */
export function IconMizan({ className = "", ...p }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true" {...p}>
      <path d="M32 12v40M20 52h24M12 18h40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 22h12l-6 10zM46 22h12l-6 10z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="32" cy="18" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

/** سُبحة — للذكر والتزكية. */
export function IconMisbaha({ className = "", ...p }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true" {...p}>
      <path d="M32 10a22 22 0 100 44 22 22 0 000-44z" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 6" opacity="0.7" />
      <g fill="currentColor">
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <circle key={i} cx={32 + Math.cos(a) * 22} cy={32 + Math.sin(a) * 22} r="3" />;
        })}
      </g>
      <path d="M32 54v6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M28 60h8l-4 4z" fill="currentColor" />
    </svg>
  );
}

/** نجمةٌ ثمانيّة — الشكلُ الجامع للزخرفة الإسلامية. */
export function IconKhatam({ className = "", ...p }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true" {...p}>
      <path d="M32 4l8 12 14-2-2 14 12 8-12 8 2 14-14-2-8 12-8-12-14 2 2-14L-8 32" stroke="none" />
      <path
        d="M32 6 41 15h13v13l9 9-9 9v13H41l-9 9-9-9H10V46L1 37l9-9V15h13z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M32 18l14 14-14 14-14-14z" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
    </svg>
  );
}

/**
 * خلفيةُ القسم — أشكالٌ متناثرةٌ بترتيبٍ محسوب.
 *
 * والبذرةُ تجعل التوزيعَ ثابتاً بين الخادم والمتصفّح: توزيعٌ عشوائيٌّ
 * حقيقيٌّ يختلف بينهما فيشتكي React من عدم التطابق.
 */
export function ShariBackdrop({
  count = 14,
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
  const shapes = [IconMushaf, IconMihrab, IconMinaret, IconMizan, IconMisbaha, IconKhatam];

  /* مولّدٌ خطّيٌّ بسيط — يكفي للتوزيع ويعطي النتيجةَ نفسَها في الجهتين. */
  let s = seed * 9301 + 49297;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  const items = Array.from({ length: count }, (_, i) => {
    const Shape = shapes[Math.floor(rnd() * shapes.length)];
    return {
      key: i,
      Shape,
      left: `${Math.round(rnd() * 92)}%`,
      top: `${Math.round(rnd() * 88)}%`,
      size: 34 + Math.round(rnd() * 70),
      spin: Math.round(rnd() * 40 - 20),
    };
  });

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${tone} ${className}`}
      style={{
        opacity,
        /* تتلاشى نحو الأطراف فلا تُقطع قطعاً حادّاً عند حدّ القسم */
        WebkitMaskImage: "radial-gradient(70% 65% at 50% 45%, #000 30%, transparent 100%)",
        maskImage: "radial-gradient(70% 65% at 50% 45%, #000 30%, transparent 100%)",
      }}
    >
      {items.map(({ key, Shape, left, top, size, spin }) => (
        <Shape
          key={key}
          className="absolute"
          style={{ left, top, width: size, height: size, transform: `rotate(${spin}deg)` }}
        />
      ))}
    </div>
  );
}
