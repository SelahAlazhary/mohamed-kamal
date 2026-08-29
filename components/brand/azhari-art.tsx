/**
 * رسومُ الموادّ الشرعية.
 * ------------------------------------------------------------------
 * حلّت محلَّ زخارف منصّةِ اللغة: تبليطٍ كوفيٍّ من حروفٍ عربية، وحقلِ
 * حركاتٍ من فتحاتٍ وضمّات، ومصطلحاتِ نحوٍ وبلاغةٍ تُرسم نصّاً. وكلُّها
 * تقول «منصّةُ لغة» لمن يراها، وهذه منصّةُ موادَّ شرعية.
 *
 * **وما رُسم هنا معمارٌ وأداةٌ لا حرف:** المحرابُ والمنارةُ والقنديلُ
 * والمصحفُ على كرسيّه والمِسبحة. رموزٌ تُقرأ بالعين من بعيدٍ ولا تحتاج
 * قراءةَ حرف — وهو ما يليق بالخلفية، إذ الخلفيةُ تُحسّ ولا تُقرأ.
 *
 * **ولا صورةَ ولا خطّ:** كلُّه مسارات SVG، فيأخذ لونَ الثيم من
 * `currentColor` ويصغُر ويكبُر بلا تكسّر، ولا يزن شيئاً.
 */

import type { SVGProps } from "react";

type ArtProps = SVGProps<SVGSVGElement> & { size?: number };

function Art({ size = 64, children, ...rest }: ArtProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** المحراب — تجويفُ القبلة بقوسه وعموديه. */
export function ArtMihrab(p: ArtProps) {
  return (
    <Art {...p}>
      <path d="M32 8c-9 0-16 7-16 16v32h32V24c0-9-7-16-16-16z" />
      <path d="M32 16c-5 0-9 4-9 9v31h18V25c0-5-4-9-9-9z" opacity="0.6" />
      <path d="M10 56h44M14 56V26M50 56V26" />
      <path d="M11 26h6l-3-6zM47 26h6l-3-6z" />
    </Art>
  );
}

/** المصحف على كرسيّه — الرحل. */
export function ArtRahl(p: ArtProps) {
  return (
    <Art {...p}>
      <path d="M32 22c-7-5-16-5-23-2v26c7-3 16-3 23 2z" />
      <path d="M32 22c7-5 16-5 23-2v26c-7-3-16-3-23 2z" />
      <path d="M32 22v26" />
      <path d="M16 50 26 62M48 50 38 62M20 58h24" />
    </Art>
  );
}

/** القنديل المعلّق. */
export function ArtLamp(p: ArtProps) {
  return (
    <Art {...p}>
      <path d="M32 4v8" />
      <path d="M20 20h24l-4 6H24z" />
      <path d="M24 26c0 10-4 12-4 18a12 12 0 0024 0c0-6-4-8-4-18" />
      <circle cx="32" cy="44" r="4" opacity="0.6" />
    </Art>
  );
}

/** المنارة. */
export function ArtMinaret(p: ArtProps) {
  return (
    <Art {...p}>
      <path d="M32 4l4 6h-8z" />
      <path d="M28 10h8v10h-8zM26 20h12v14H26zM24 34h16v22H24z" />
      <path d="M18 56h28" />
      <path d="M29 40h6v8h-6z" opacity="0.6" />
    </Art>
  );
}

/** المِسبحة. */
export function ArtMisbaha(p: ArtProps) {
  return (
    <Art {...p}>
      <path d="M32 12a20 20 0 100 40 20 20 0 100-40z" opacity="0.35" />
      <g fill="currentColor" stroke="none">
        {Array.from({ length: 14 }, (_, i) => {
          const a = (i / 14) * Math.PI * 2 - Math.PI / 2;
          return <circle key={i} cx={32 + Math.cos(a) * 20} cy={32 + Math.sin(a) * 20} r={2.6} />;
        })}
      </g>
      <path d="M32 52v8" />
      <circle cx="32" cy="61" r="2.4" fill="currentColor" stroke="none" />
    </Art>
  );
}

/** القبّة. */
export function ArtDome(p: ArtProps) {
  return (
    <Art {...p}>
      <path d="M32 6l3 5h-6z" />
      <path d="M32 11c-11 0-19 9-19 19h38c0-10-8-19-19-19z" />
      <path d="M13 30h38v6H13z" />
      <path d="M17 36v20M47 36v20M12 56h40" />
      <path d="M27 44a5 5 0 0110 0v12H27z" opacity="0.6" />
    </Art>
  );
}

/** ميزانُ الفرائض — للميراث. */
export function ArtScales(p: ArtProps) {
  return (
    <Art {...p}>
      <path d="M32 10v40M20 50h24" />
      <path d="M12 18h40" />
      <path d="M6 18l6 12 6-12zM46 18l6 12 6-12z" />
      <circle cx="32" cy="14" r="3" />
    </Art>
  );
}

/** سلسلةُ السند — للحديث. */
export function ArtSanad(p: ArtProps) {
  return (
    <Art {...p}>
      <circle cx="32" cy="10" r="5" />
      <circle cx="32" cy="26" r="5" />
      <circle cx="32" cy="42" r="5" />
      <circle cx="32" cy="58" r="5" />
      <path d="M32 15v6M32 31v6M32 47v6" />
    </Art>
  );
}

export const AZHARI_ART = {
  mihrab: ArtMihrab,
  rahl: ArtRahl,
  lamp: ArtLamp,
  minaret: ArtMinaret,
  misbaha: ArtMisbaha,
  dome: ArtDome,
  scales: ArtScales,
  sanad: ArtSanad,
} as const;

export type AzhariArtId = keyof typeof AZHARI_ART;

/**
 * حقلُ الرسوم — بديلُ التبليط الكوفيّ في خلفيات الأقسام.
 * تُوزَّع الرموزُ توزيعاً محسوباً لا عشوائياً: البذرةُ تُنتج المواضعَ
 * نفسَها في كلّ رسم، فلا يقفز النقشُ بين الخادم والمتصفّح.
 */
export function AzhariArtField({
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
  const ids = Object.keys(AZHARI_ART) as AzhariArtId[];
  /* مولّدٌ خطّيٌّ بسيط — يكفي لتوزيعٍ لا يبدو منتظماً ولا يتغيّر. */
  let s = seed * 9301 + 49297;
  const next = () => ((s = (s * 9301 + 49297) % 233280) / 233280);

  const items = Array.from({ length: count }, (_, i) => ({
    id: ids[i % ids.length],
    x: next() * 100,
    y: next() * 100,
    size: 34 + next() * 46,
    rot: (next() - 0.5) * 26,
    key: i,
  }));

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${tone} ${className}`}
      style={{
        opacity,
        /* تتلاشى عند الحواف فلا تُقطع قطعاً حادّاً */
        WebkitMaskImage: "radial-gradient(70% 65% at 50% 45%, #000 35%, transparent 100%)",
        maskImage: "radial-gradient(70% 65% at 50% 45%, #000 35%, transparent 100%)",
      }}
    >
      {items.map((it) => {
        const C = AZHARI_ART[it.id];
        return (
          <span
            key={it.key}
            className="absolute"
            style={{
              left: `${it.x}%`,
              top: `${it.y}%`,
              transform: `translate(-50%,-50%) rotate(${it.rot}deg)`,
            }}
          >
            <C size={it.size} strokeWidth={1} />
          </span>
        );
      })}
    </div>
  );
}
