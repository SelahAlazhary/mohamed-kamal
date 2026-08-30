"use client";

/**
 * الرسومُ المتحرّكة — متّجهةً بدل الصور النقطيّة.
 * ------------------------------------------------------------------
 * كانت اثنتَي عشرةَ صورةَ WebP متحرّكة، وفيها أربعةُ عيوبٍ لا تُعالَج
 * بالضغط ولا بالتحسين:
 *
 * ١ ــ **لا تتبع الهوية.** ألوانُها مخبوزةٌ في البكسل، فتبديلُ الكحليّ أو
 *      الذهبيّ لا يمسّها. وقد اضطررتُ إلى صبغ بنفسجيّها ذهباً بكودٍ يمرّ
 *      على كلّ بكسلٍ في كلّ إطار — وذلك عمَلٌ يُعاد كلّما تغيّرت الهوية.
 *
 * ٢ ــ **لا تُعالَج.** الأربعون مكتبةً تعمل بمتغيّرات CSS، والصورةُ
 *      النقطيّةُ لا تسمع بها. فالمكتباتُ تسري على الرسوم المتّجهة وحدَها
 *      وتقف عند هذه — فتشذّ عن المنصّة كلِّها.
 *
 * ٣ ــ **تزن وتُنقل.** اثنتا عشرةَ صورةً مئتان وعشرون كيلوبايت تُنقل من
 *      الخادم؛ وهذه أصفار: مساراتٌ في حزمة الصفحة.
 *
 * ٤ ــ **خلفيّتُها بيضاءُ مصمتة.** ولذلك قُصّت دوائرَ — والقصُّ حيلةٌ على
 *      عيبٍ لا إصلاحٌ له.
 *
 * ------------------------------------------------------------------
 * **والاثنتا عشرةَ تُبنى من ستّ قطعٍ لا اثنتَي عشرةَ رسمة.** القبّعةُ في
 * «قبّعة التخرّج» هي نفسُها في «القبّعة والكتاب» و«الكتب والقبّعة»
 * و«قبّعة التميّز» — فرسمُها أربعَ مرّاتٍ يُخرجها أربعَ قبّعاتٍ متفاوتة،
 * ويكفي أن تُحسَّن واحدةً لتشذّ الثلاث. فالقطعةُ واحدةٌ تُركَّب.
 *
 * والحركةُ تصف الشيء: الشُّرّابةُ تتأرجح، والصفحةُ تُقلَب، والعلامةُ
 * تُوضع، والقلمُ يكتب، والنجمُ يخفق بتوقيتاتٍ مختلفة. وحركةٌ لا تصف شيئاً
 * تُلهي عن الرسم.
 */

import { useId } from "react";

export const SHARI_MOTION = [
  { id: "capAnim", name: "قبّعة التخرّج" },
  { id: "capBookAnim", name: "القبّعة والكتاب" },
  { id: "capOpenBookAnim", name: "القبّعة والمصحف" },
  { id: "capStarsAnim", name: "قبّعة التميّز" },
  { id: "booksCapAnim", name: "الكتب والقبّعة" },
  { id: "bookAnim", name: "الكتاب المفتوح" },
  { id: "quranAnim", name: "المصحف المفتوح" },
  { id: "mosqueAnim", name: "المسجد" },
  { id: "domeAnim", name: "القبّة والهلال" },
  { id: "checklistAnim", name: "قائمة الإنجاز" },
  { id: "notepadAnim", name: "الدفتر والقلم" },
  { id: "onlineClassAnim", name: "الدرس المباشر" },
] as const;

export type ShariMotionId = (typeof SHARI_MOTION)[number]["id"];

/* الأدوارُ لا الألوان — تتبع المكتبةَ المختارة، واحتياطُها من الهوية. */
const NAVY = "var(--sv-body, hsl(var(--primary)))";
const GOLD = "var(--sv-accent, hsl(var(--gold)))";
const PAPER = "var(--sv-paper, hsl(var(--card)))";

/* ══════════════════════════════════════════════════════════
   القطعُ الستّ — تُركَّب ولا تُعاد
   ══════════════════════════════════════════════════════════ */

/**
 * القبّعة.
 * اللوحُ معيَّنٌ لا مستطيلٌ مائل: المعيَّنُ منظورُ مربّعٍ من فوق، وهو ما
 * يجعلها قبّعةَ تخرّجٍ لا صندوقاً. والشُّرّابةُ تتدلّى من ركنه الأيمن
 * وتتأرجح حولَه — لا حول مركز الرسم، وإلّا انفصلت عن الركن وهي تتحرّك.
 */
function Cap({ y = 0, scale = 1 }: { y?: number; scale?: number }) {
  return (
    <g transform={`translate(0 ${y}) scale(${scale}) translate(0 ${(1 - scale) * 120})`}>
      {/* اللوح */}
      <path fill={NAVY} d="M120 34 208 70 120 106 32 70Z" />
      <path fill={GOLD} d="M120 48 176 70 120 92 64 70Z" opacity="0.55" />
      {/* الرأسُ تحته */}
      <path fill={NAVY} d="M76 84v28c0 16 88 16 88 0V84l-44 18Z" />
      <path fill={GOLD} d="M78 104c14 9 70 9 84 0v8c0 14-84 14-84 0Z" opacity="0.5" />
      {/* الشُّرّابة — تتأرجح حول ركن اللوح */}
      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="-9 208 70;9 208 70;-9 208 70"
          dur="2.8s"
          repeatCount="indefinite"
        />
        <path d="M208 70v34" stroke={GOLD} strokeWidth="6" strokeLinecap="round" fill="none" />
        <circle cx="208" cy="108" r="7" fill={GOLD} />
        <path fill={GOLD} d="M201 112h14l-3 20a4 4 0 0 1-8 0Z" />
      </g>
    </g>
  );
}

/** كتابٌ مغلقٌ — يُكدَّس ويُجلَس عليه. */
function ClosedBook({ y, w = 150, tone = GOLD }: { y: number; w?: number; tone?: string }) {
  const x = 120 - w / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height="22" rx="7" fill={NAVY} />
      <rect x={x + 10} y={y + 6} width={w - 20} height="5" rx="2.5" fill={tone} opacity="0.75" />
      {/* حرفُ الصفحات — شريطٌ أفتحُ أسفلَ الغلاف يُعطيه سُمكاً */}
      <rect x={x + 6} y={y + 16} width={w - 12} height="6" rx="3" fill={PAPER} opacity="0.55" />
    </g>
  );
}

/**
 * كتابٌ مفتوحٌ وصفحةٌ تُقلَب.
 * الصفحةُ المقلوبةُ تُرسم مرّةً وتُسحق أفقيّاً (`scaleX`) حول المتن —
 * فتُقرأ ورقةً تنقلب عليه. والتلاشي بالشفافية وحدَه يُقرأ ظهوراً واختفاءً
 * لا قلباً.
 */
function OpenBook({ y = 0, lines = true }: { y?: number; lines?: boolean }) {
  return (
    <g transform={`translate(0 ${y})`}>
      <path
        fill={NAVY}
        d="M26 96c30-14 62-12 94 8 32-20 64-22 94-8v78c-30-14-62-12-94 8-32-20-64-22-94-8Z"
      />
      <path fill={PAPER} d="M38 106c24-9 50-6 74 10v56c-24-16-50-19-74-10Z" />
      <path fill={PAPER} d="M202 106c-24-9-50-6-74 10v56c24-16 50-19 74-10Z" />
      <rect x="116" y="112" width="8" height="62" rx="3" fill={GOLD} />

      {lines &&
        [124, 136, 148].map((ly, i) => (
          <g key={ly}>
            <rect x="136" y={ly} width="0" height="5" rx="2.5" fill={GOLD} opacity="0.8">
              <animate
                attributeName="width"
                values="0;52;52;0;0"
                keyTimes={`0;${(0.2 + i * 0.07).toFixed(2)};0.82;0.93;1`}
                dur="6s"
                repeatCount="indefinite"
              />
            </rect>
            <rect x="52" y={ly} width="0" height="5" rx="2.5" fill={GOLD} opacity="0.8">
              <animate
                attributeName="width"
                values="0;52;52;0;0"
                keyTimes={`0;${(0.24 + i * 0.07).toFixed(2)};0.82;0.93;1`}
                dur="6s"
                repeatCount="indefinite"
              />
            </rect>
          </g>
        ))}

      {/* الصفحةُ تنقلب — تُسحق حول المتن فتُقرأ ورقةً لا وميضاً */}
      <g style={{ transformOrigin: "120px 140px" }}>
        <animateTransform
          attributeName="transform"
          type="scale"
          additive="sum"
          values="1 1;0.02 1;1 1;1 1"
          keyTimes="0;0.12;0.24;1"
          dur="6s"
          repeatCount="indefinite"
        />
        <path fill={PAPER} d="M202 106c-24-9-50-6-74 10v56c24-16 50-19 74-10Z" opacity="0.94" />
      </g>
    </g>
  );
}

/** نجمةٌ خماسيّةٌ تخفق — التوقيتُ يُعطى فلا تتّفق النجومُ كآلة. */
function Star({ cx, cy, r, dur }: { cx: number; cy: number; r: number; dur: string }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const rr = i % 2 ? r * 0.44 : r;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    return `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`;
  }).join(" ");
  return (
    <polygon points={pts} fill={GOLD}>
      <animate attributeName="opacity" values="0.3;1;0.3" dur={dur} repeatCount="indefinite" />
    </polygon>
  );
}

/** القبّةُ البصليّةُ والهلال — منحنيان يلتقيان في قمّةٍ واحدة. */
function Dome({ y = 0 }: { y?: number }) {
  const u = useId().replace(/:/g, "");
  return (
    <g transform={`translate(0 ${y})`}>
      <defs>
        <mask id={`${u}-c`}>
          <rect width="240" height="240" fill="#000" />
          <circle cx="120" cy="28" r="14" fill="#fff" />
          <circle cx="126" cy="24" r="12.5" fill="#000" />
        </mask>
      </defs>
      <circle cx="120" cy="28" r="20" fill={GOLD} opacity="0.16">
        <animate attributeName="r" values="16;24;16" dur="4.2s" repeatCount="indefinite" />
      </circle>
      <rect width="240" height="240" fill={GOLD} mask={`url(#${u}-c)`} />
      <rect x="118.4" y="42" width="3.2" height="18" rx="1.6" fill={GOLD} />
      <path fill={NAVY} d="M120 58c30 20 40 38 38 60H82c-2-22 8-40 38-60Z" />
      <rect x="80" y="114" width="80" height="8" rx="4" fill={GOLD} />
    </g>
  );
}

/* ══════════════════════════════════════════════════════════
   الاثنتا عشرةَ — تركيبٌ لا رسمٌ جديد
   ══════════════════════════════════════════════════════════ */

const Svg = ({ size, className, children }: { size: number; className: string; children: React.ReactNode }) => (
  <svg viewBox="0 0 240 240" width={size} height={size} className={className} aria-hidden="true">
    {children}
  </svg>
);

type P = { size?: number; className?: string };

function CapAnim({ size = 120, className = "" }: P) {
  return (
    <Svg size={size} className={className}>
      <Cap y={26} />
    </Svg>
  );
}

function CapBookAnim({ size = 120, className = "" }: P) {
  return (
    <Svg size={size} className={className}>
      <Cap y={-24} scale={0.82} />
      <ClosedBook y={170} />
    </Svg>
  );
}

function CapOpenBookAnim({ size = 120, className = "" }: P) {
  return (
    <Svg size={size} className={className}>
      <g transform="translate(0 -46) scale(0.72) translate(46 0)">
        <Cap />
      </g>
      <g transform="translate(0 22) scale(0.92) translate(10 0)">
        <OpenBook />
      </g>
    </Svg>
  );
}

function CapStarsAnim({ size = 120, className = "" }: P) {
  return (
    <Svg size={size} className={className}>
      <Cap y={30} scale={0.86} />
      <Star cx={38} cy={54} r={15} dur="2.6s" />
      <Star cx={206} cy={166} r={13} dur="3.4s" />
      <Star cx={44} cy={182} r={11} dur="4.1s" />
    </Svg>
  );
}

function BooksCapAnim({ size = 120, className = "" }: P) {
  return (
    <Svg size={size} className={className}>
      <Cap y={-58} scale={0.7} />
      {/* ثلاثةٌ مكدّسةٌ بعرضٍ متناقصٍ صعوداً — والمتساويةُ تُقرأ صندوقاً */}
      <ClosedBook y={196} w={168} />
      <ClosedBook y={170} w={148} tone={PAPER} />
      <ClosedBook y={144} w={158} />
    </Svg>
  );
}

function BookAnim({ size = 120, className = "" }: P) {
  return (
    <Svg size={size} className={className}>
      <OpenBook y={-20} />
    </Svg>
  );
}

function QuranAnim({ size = 120, className = "" }: P) {
  return (
    <Svg size={size} className={className}>
      {/* الرَّحلُ تحته — لوحان يتقاطعان، الأماميُّ يقطع الخلفيَّ بالتتابع */}
      <rect x="52" y="146" width="15" height="86" rx="7" fill={NAVY} transform="rotate(-19 60 189)" opacity="0.7" />
      <rect x="173" y="146" width="15" height="86" rx="7" fill={NAVY} transform="rotate(19 180 189)" opacity="0.7" />
      <rect x="52" y="146" width="15" height="86" rx="7" fill={NAVY} transform="rotate(19 60 189)" />
      <rect x="173" y="146" width="15" height="86" rx="7" fill={NAVY} transform="rotate(-19 180 189)" />
      <circle cx="120" cy="188" r="7" fill={GOLD} />
      <g transform="translate(0 -44) scale(0.94) translate(8 0)">
        <OpenBook />
      </g>
    </Svg>
  );
}

function MosqueAnim({ size = 120, className = "" }: P) {
  const arch = (cx: number, base: number, w: number, h: number) =>
    `M${cx - w} ${base}L${cx - w} ${base - h * 0.45}` +
    `C${cx - w} ${base - h * 0.86} ${cx - w * 0.5} ${base - h} ${cx} ${base - h}` +
    `C${cx + w * 0.5} ${base - h} ${cx + w} ${base - h * 0.86} ${cx + w} ${base - h * 0.45}` +
    `L${cx + w} ${base}Z`;
  return (
    <Svg size={size} className={className}>
      <Dome y={0} />
      {/* المئذنتان خلف الجسم فتبدوان أبعد */}
      {[44, 196].map((x) => (
        <g key={x}>
          <rect x={x - 10} y="118" width="20" height="90" rx="4" fill={NAVY} />
          <rect x={x - 14} y="140" width="28" height="8" rx="4" fill={NAVY} />
          <path fill={NAVY} d={`M${x} 86c11 9 13 20 9 32h-18c-4-12-2-23 9-32Z`} />
          <rect x={x - 7} y="126" width="14" height="10" rx="3" fill={GOLD} />
        </g>
      ))}
      <rect x="60" y="122" width="120" height="12" rx="5" fill={NAVY} />
      {[74, 96, 118, 140, 162].map((x) => (
        <path key={x} fill={GOLD} d={`M${x - 6} 124l6 9 6-9z`} opacity="0.85" />
      ))}
      <rect x="60" y="134" width="120" height="72" rx="6" fill={NAVY} />
      <rect x="46" y="206" width="148" height="14" rx="6" fill={NAVY} />
      <path fill={GOLD} d={arch(120, 206, 24, 56)} />
      <path fill={PAPER} d={arch(120, 206, 16, 44)} opacity="0.9">
        <animate attributeName="opacity" values="0.55;0.95;0.55" dur="3.6s" repeatCount="indefinite" />
      </path>
      {[82, 158].map((x) => (
        <path key={x} fill={GOLD} d={arch(x, 194, 13, 32)} />
      ))}
    </Svg>
  );
}

function DomeAnim({ size = 120, className = "" }: P) {
  return (
    <Svg size={size} className={className}>
      <Dome y={28} />
      <rect x="72" y="150" width="96" height="62" rx="8" fill={NAVY} />
      <rect x="58" y="212" width="124" height="14" rx="6" fill={NAVY} />
      <path fill={GOLD} d="M120 164c12 0 19 10 19 21v27h-38v-27c0-11 7-21 19-21Z" />
    </Svg>
  );
}

/**
 * قائمةُ الإنجاز — العلاماتُ تُوضع واحدةً بعد واحدة.
 *
 * والعلامةُ تُرسم بـ`stroke-dashoffset` لا بالشفافية: العلامةُ تُخَطّ
 * خطّاً، والظهورُ المفاجئ يُقرأ وميضاً لا كتابة.
 */
function ChecklistAnim({ size = 120, className = "" }: P) {
  const rows = [86, 128, 170];
  return (
    <Svg size={size} className={className}>
      <rect x="42" y="46" width="156" height="176" rx="14" fill={NAVY} />
      <rect x="54" y="58" width="132" height="152" rx="8" fill={PAPER} />
      {/* مشبكُ اللوح */}
      <rect x="96" y="30" width="48" height="26" rx="9" fill={GOLD} />
      <rect x="104" y="22" width="32" height="16" rx="8" fill={NAVY} />

      {rows.map((y, i) => (
        <g key={y}>
          <rect x="68" y={y - 14} width="28" height="28" rx="8" fill="none" stroke={GOLD} strokeWidth="4" />
          <rect x="106" y={y - 6} width="66" height="7" rx="3.5" fill={NAVY} opacity="0.28" />
          <path
            d="M74 0l6 7 12-13"
            transform={`translate(0 ${y})`}
            fill="none"
            stroke={GOLD}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="30"
            strokeDashoffset="30"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="30;30;0;0;30"
              keyTimes={`0;${(0.1 + i * 0.16).toFixed(2)};${(0.22 + i * 0.16).toFixed(2)};0.9;1`}
              dur="5.4s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      ))}
    </Svg>
  );
}

/** الدفترُ والقلم — القلمُ ينزلق فوق السطر الذي يُكتب تحته. */
function NotepadAnim({ size = 120, className = "" }: P) {
  const rows = [104, 132, 160];
  return (
    <Svg size={size} className={className}>
      <rect x="40" y="52" width="150" height="168" rx="14" fill={NAVY} />
      <rect x="52" y="64" width="126" height="144" rx="8" fill={PAPER} />
      {/* الحلزون */}
      {[70, 100, 130, 160].map((y) => (
        <rect key={y} x="30" y={y - 5} width="30" height="10" rx="5" fill={GOLD} />
      ))}

      {rows.map((y, i) => (
        <rect key={y} x="74" y={y} width="0" height="7" rx="3.5" fill={NAVY} opacity="0.3">
          <animate
            attributeName="width"
            values="0;88;88;0;0"
            keyTimes={`0;${(0.22 + i * 0.14).toFixed(2)};0.84;0.94;1`}
            dur="5.6s"
            repeatCount="indefinite"
          />
        </rect>
      ))}

      {/* القلم — ينزل سطراً سطراً وينزلق مع الكتابة */}
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0;88 0;0 28;88 28;0 56;88 56;0 0"
          keyTimes="0;0.22;0.24;0.44;0.46;0.66;1"
          dur="5.6s"
          repeatCount="indefinite"
        />
        <g transform="translate(70 78) rotate(38)">
          <rect x="-7" y="0" width="14" height="42" rx="4" fill={GOLD} />
          <rect x="-7" y="0" width="14" height="10" rx="4" fill={NAVY} />
          <path fill={NAVY} d="M-7 42h14l-7 12Z" />
        </g>
      </g>
    </Svg>
  );
}

/** الدرسُ المباشر — شاشةٌ وزرُّ تشغيلٍ تنبض حوله حلقة. */
function OnlineClassAnim({ size = 120, className = "" }: P) {
  return (
    <Svg size={size} className={className}>
      <rect x="26" y="48" width="188" height="126" rx="14" fill={NAVY} />
      <rect x="38" y="60" width="164" height="102" rx="7" fill={PAPER} />
      {/* قاعدةُ الحاسوب */}
      <path fill={NAVY} d="M14 182h212c0 12-8 20-20 20H34c-12 0-20-8-20-20Z" />
      <rect x="98" y="174" width="44" height="8" rx="4" fill={NAVY} />

      {/* حلقةٌ تنبض حول زرّ التشغيل — نبضُ البثّ لا زخرفة */}
      <circle cx="120" cy="111" r="30" fill="none" stroke={GOLD} strokeWidth="4" opacity="0.7">
        <animate attributeName="r" values="26;40;26" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.75;0;0.75" dur="2.4s" repeatCount="indefinite" />
      </circle>
      <circle cx="120" cy="111" r="27" fill={GOLD} />
      <path fill={NAVY} d="M111 98l24 13-24 13Z" />

      {/* نقطةُ «مباشر» */}
      <circle cx="182" cy="78" r="7" fill={GOLD}>
        <animate attributeName="opacity" values="1;0.25;1" dur="1.4s" repeatCount="indefinite" />
      </circle>
    </Svg>
  );
}

const MAP = {
  capAnim: CapAnim,
  capBookAnim: CapBookAnim,
  capOpenBookAnim: CapOpenBookAnim,
  capStarsAnim: CapStarsAnim,
  booksCapAnim: BooksCapAnim,
  bookAnim: BookAnim,
  quranAnim: QuranAnim,
  mosqueAnim: MosqueAnim,
  domeAnim: DomeAnim,
  checklistAnim: ChecklistAnim,
  notepadAnim: NotepadAnim,
  onlineClassAnim: OnlineClassAnim,
} as const;

/**
 * الرسمُ المتحرّكُ باسمه.
 *
 * والغلافُ `sv-art` هو ما تعلّق عليه المكتبةُ أرضَها وهالتَها وحدَّها —
 * وهو نفسُه غلافُ الرسوم الساكنة، فتسري المكتبةُ على الاثنين معاً ولا
 * تشذّ المتحرّكةُ عن أختها.
 */
export function ShariMotion({
  id,
  size = 120,
  className = "",
}: {
  id: ShariMotionId;
  size?: number;
  className?: string;
}) {
  const C = MAP[id];
  return (
    <span className={`sv-art ${className}`}>
      <C size={size} />
    </span>
  );
}
