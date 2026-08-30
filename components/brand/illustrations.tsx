"use client";

/**
 * رسومُ الحالات الفارغة.
 * ------------------------------------------------------------------
 * كانت خطّاً واحداً بعرض ١٫٥ ولونٍ واحدٍ من الثيم بدرجاتِ شفافية. وذلك
 * يصلح أيقونةً في صفٍّ ولا يصلح **رسمَ حالةٍ فارغة**: الحالةُ الفارغةُ
 * تشغل نصفَ الشاشة، وخطٌّ رفيعٌ فيها يبدو باهتاً كأنّ الصفحةَ لم تُحمَّل
 * بعد — وهو أسوأُ ما يقال لمن يقف أمام قسمٍ خالٍ.
 *
 * فصارت على قاعدة رسوم المنصّة نفسِها:
 * · **مساحاتٌ ممتلئةٌ لا خطوط** — كتلةٌ تحتفظ بثقلها في كلّ حجم.
 * · **ثلاثُ نبراتٍ** — كحليٌّ جسماً، وورقٌ سطحاً، وذهبٌ زخرفة.
 * · **ألوانُها من متغيّرات المكتبة** — فتسري عليها المكتباتُ كما تسري
 *   على أخواتها، ولا تشذّ عن المنصّة.
 * · **وحركةٌ تصف الحال** — الجرسُ يهتزّ ثمّ يسكن، والموجةُ تخرج من
 *   المرسل، والقفلُ يهتزّ اهتزازةَ المنع.
 *
 * والقياسُ ١٦٠×١٢٠ باقٍ: مواضعُ الاستعمال تحسب عرضَها على هذه النسبة،
 * وتغييرُها يُخرج الرسمَ عن مكانه في ثلاث صفحات.
 */

import { useUid } from "./use-uid";

type Props = { className?: string; width?: number };

/* الأدوارُ لا الألوان — تتبع المكتبةَ المختارة، واحتياطُها من الهوية. */
const NAVY = "var(--sv-body, hsl(var(--primary)))";
const GOLD = "var(--sv-accent, hsl(var(--gold)))";
const PAPER = "var(--sv-paper, hsl(var(--card)))";

/**
 * الغلافُ `sv-art` — وبه تسري المكتباتُ على هذه الرسوم كما تسري على
 * أخواتها.
 *
 * وبدونه تقع مصيبةٌ صامتة: لوحةُ «الليليّ» جسمُها ورقٌ وأرضُها كحليّة،
 * والأرضُ تُرسم على `sv-art` وحدَه. فرسمٌ خارجَه ينال الجسمَ الفاتحَ بلا
 * الأرض الداكنة — أي **يختفي كلَّه على ورقٍ فاتح**، ولا يبقى منه إلّا
 * ما كان ذهبيّاً.
 *
 * و`sv-wide` تجعل الأرضَ مستطيلاً مستديرَ الأركان: هذه الرسومُ عريضةٌ
 * ١٦٠×١٢٠، والأرضُ الدائريّةُ حولها تخرج قرصاً مطّاطاً لا يجلس تحتها.
 */
function Frame({ children, className = "", width = 168 }: Props & { children: React.ReactNode }) {
  return (
    <span className="sv-art sv-wide">
      <svg
        width={width}
        height={(width * 120) / 160}
        viewBox="0 0 160 120"
        fill="none"
        focusable="false"
        aria-hidden="true"
        className={className}
      >
        {children}
      </svg>
    </span>
  );
}

/**
 * ظلٌّ أرضيٌّ بيضويّ.
 * كان خطّاً أفقيّاً متلاشياً — والخطُّ تحت جسمٍ ممتلئٍ يبدو سطراً لا ظلّاً.
 * والبيضويُّ المتلاشي يُجلس الجسمَ على أرضٍ فلا يبدو معلَّقاً في الفراغ.
 */
function Ground({ uid, cy = 106, rx = 42 }: { uid: string; cy?: number; rx?: number }) {
  return (
    <>
      <defs>
        <radialGradient id={`${uid}-g`}>
          <stop offset="0%" stopColor={NAVY} stopOpacity="0.22" />
          <stop offset="100%" stopColor={NAVY} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="80" cy={cy} rx={rx} ry="6" fill={`url(#${uid}-g)`} />
    </>
  );
}

/** لا توجد خطط بعد — ثلاثُ بطاقاتٍ أوسطُها مرفوعة. */
export function EmptyPlans(p: Props) {
  const uid = useUid("ilp");
  return (
    <Frame {...p}>
      <Ground uid={uid} rx={50} />
      {/* الجانبيّتان أصغرُ وأخفتُ فتُقرآن أبعدَ لا أصغرَ حجماً */}
      {[
        { x: 16, y: 42, h: 52, o: 0.4 },
        { x: 108, y: 42, h: 52, o: 0.4 },
      ].map((c) => (
        <g key={c.x} opacity={c.o}>
          <rect x={c.x} y={c.y} width="36" height={c.h} rx="7" fill={NAVY} />
          <rect x={c.x + 7} y={c.y + 10} width="22" height="4" rx="2" fill={PAPER} />
          <rect x={c.x + 7} y={c.y + 20} width="16" height="4" rx="2" fill={PAPER} />
        </g>
      ))}
      {/* الوسطى مرفوعةٌ ومتوّجةٌ بشارةٍ ذهبيّة — وهي «الخطّة المميّزة» */}
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0;0 -3;0 0"
          dur="3.4s"
          repeatCount="indefinite"
        />
        <rect x="56" y="30" width="48" height="70" rx="9" fill={NAVY} />
        <rect x="64" y="52" width="32" height="5" rx="2.5" fill={PAPER} />
        <rect x="64" y="64" width="24" height="5" rx="2.5" fill={PAPER} opacity="0.7" />
        <rect x="64" y="76" width="28" height="5" rx="2.5" fill={PAPER} opacity="0.7" />
        <rect x="66" y="22" width="28" height="14" rx="7" fill={GOLD} />
      </g>
    </Frame>
  );
}

/** لا كورسات بعد — كتابٌ مفتوحٌ وسطورُه تُكتب. */
export function EmptyCourses(p: Props) {
  const uid = useUid("ilc");
  return (
    <Frame {...p}>
      <Ground uid={uid} />
      <path
        fill={NAVY}
        d="M22 42c20-9 40-8 58 5 18-13 38-14 58-5v50c-20-9-40-8-58 5-18-13-38-14-58-5Z"
      />
      <path fill={PAPER} d="M30 50c15-6 31-4 46 6v36c-15-10-31-12-46-6Z" />
      <path fill={PAPER} d="M130 50c-15-6-31-4-46 6v36c15-10 31-12 46-6Z" />
      <rect x="77" y="53" width="6" height="40" rx="2" fill={GOLD} />
      {[60, 70, 80].map((y, i) => (
        <g key={y}>
          <rect x="90" y={y} width="0" height="4" rx="2" fill={GOLD} opacity="0.85">
            <animate
              attributeName="width"
              values="0;32;32;0;0"
              keyTimes={`0;${(0.2 + i * 0.08).toFixed(2)};0.82;0.93;1`}
              dur="6s"
              repeatCount="indefinite"
            />
          </rect>
          <rect x="38" y={y} width="0" height="4" rx="2" fill={GOLD} opacity="0.85">
            <animate
              attributeName="width"
              values="0;32;32;0;0"
              keyTimes={`0;${(0.24 + i * 0.08).toFixed(2)};0.82;0.93;1`}
              dur="6s"
              repeatCount="indefinite"
            />
          </rect>
        </g>
      ))}
    </Frame>
  );
}

/**
 * لا إشعارات — جرسٌ يهتزّ ثمّ يسكن.
 *
 * والاهتزازُ حول **معلاقه** لا حول مركزه: الجرسُ معلَّقٌ من أعلاه، ودورانُه
 * حول وسطه يجعله يتأرجح في الهواء كأنّه لا شيءَ يمسكه.
 */
export function EmptyBell(p: Props) {
  const uid = useUid("ilb");
  return (
    <Frame {...p}>
      <Ground uid={uid} rx={34} />
      {/* موجتان تخرجان من الجرس عند كلّ رنّة */}
      {[
        { d: "M44 40a26 26 0 0 1 8-16", b: 0 },
        { d: "M116 40a26 26 0 0 0-8-16", b: 0 },
      ].map((w, i) => (
        <path
          key={i}
          d={w.d}
          stroke={GOLD}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        >
          <animate attributeName="opacity" values="0;0.9;0;0" keyTimes="0;0.1;0.3;1" dur="3.2s" repeatCount="indefinite" />
        </path>
      ))}

      <g style={{ transformOrigin: "80px 30px" }}>
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 80 30;9 80 30;-7 80 30;4 80 30;0 80 30;0 80 30"
          keyTimes="0;0.05;0.12;0.19;0.28;1"
          dur="3.2s"
          repeatCount="indefinite"
        />
        <rect x="77" y="22" width="6" height="10" rx="3" fill={NAVY} />
        {/* جسمُ الجرس — كتفان منحنيان وقاعدةٌ عريضة */}
        <path
          fill={NAVY}
          d="M80 30c16 0 26 12 26 27 0 14 4 20 8 25H46c4-5 8-11 8-25 0-15 10-27 26-27Z"
        />
        <path fill={GOLD} d="M56 76h48c2 4 5 8 8 11H48c3-3 6-7 8-11Z" />
        {/* اللسان */}
        <path fill={NAVY} d="M70 92h20a10 10 0 0 1-20 0Z" />
      </g>
    </Frame>
  );
}

/**
 * محتوًى مقفل — قفلٌ يهتزّ اهتزازةَ المنع.
 *
 * والاهتزازُ أفقيٌّ قصيرٌ سريع، لا تأرجحٌ ولا دوران: هكذا يقول الشيءُ
 * «لا» في كلّ واجهة، والحركةُ الناعمةُ هنا تُقرأ دعوةً لا منعاً.
 */
export function EmptyLock(p: Props) {
  const uid = useUid("ill");
  return (
    <Frame {...p}>
      <Ground uid={uid} rx={34} />
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0;0 0;-3 0;3 0;-2 0;2 0;0 0;0 0"
          keyTimes="0;0.62;0.66;0.7;0.74;0.78;0.82;1"
          dur="4.4s"
          repeatCount="indefinite"
        />
        {/* العروة — قوسٌ سميكٌ خلف الجسم */}
        <path
          d="M62 54V42a18 18 0 0 1 36 0v12"
          stroke={NAVY}
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />
        <rect x="42" y="52" width="76" height="54" rx="13" fill={NAVY} />
        <circle cx="80" cy="76" r="9" fill={GOLD} />
        <rect x="76" y="80" width="8" height="14" rx="4" fill={GOLD} />
      </g>
    </Frame>
  );
}

/**
 * لا بثَّ الآن — مرسلٌ وموجاتُه.
 *
 * الموجاتُ تخرج متتابعةً لا معاً: التتابعُ هو ما يُقرأ إرسالاً، والظهورُ
 * المتزامنُ يُقرأ شكلاً ثابتاً يومض.
 */
export function EmptyLive(p: Props) {
  const uid = useUid("ilv");
  return (
    <Frame {...p}>
      <Ground uid={uid} rx={30} />
      {[
        { r: 22, w: 5 },
        { r: 34, w: 5 },
        { r: 46, w: 4 },
      ].map((a, i) => (
        <g key={a.r}>
          {[-1, 1].map((s) => (
            <path
              key={s}
              d={`M${80 + s * a.r * 0.72} ${62 - a.r * 0.62}a${a.r} ${a.r} 0 0 ${s > 0 ? 1 : 0} 0 ${a.r * 1.24}`}
              stroke={GOLD}
              strokeWidth={a.w}
              strokeLinecap="round"
              fill="none"
            >
              <animate
                attributeName="opacity"
                values="0.15;1;0.15"
                keyTimes="0;0.5;1"
                begin={`${i * 0.35}s`}
                dur="2.1s"
                repeatCount="indefinite"
              />
            </path>
          ))}
        </g>
      ))}
      {/* المرسلُ — قرصٌ كحليٌّ ونقطةٌ ذهبيّة */}
      <circle cx="80" cy="62" r="15" fill={NAVY} />
      <circle cx="80" cy="62" r="6" fill={GOLD}>
        <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <path fill={NAVY} d="M74 78h12l5 22H69Z" />
      <rect x="62" y="98" width="36" height="7" rx="3.5" fill={NAVY} />
    </Frame>
  );
}
