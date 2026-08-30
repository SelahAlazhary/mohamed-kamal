"use client";

/**
 * رسوم الحالات الفارغة — SVG مرسوم على شبكة 160×120، خطوط 1.5،
 * لون واحد من الثيم (currentColor) بدرجات شفافية، بلا ظلال ولا تدرّجات صاخبة.
 */
import { useUid } from "./use-uid";

type Props = { className?: string; width?: number };

function Frame({ children, className = "", width = 168 }: Props & { children: React.ReactNode }) {
  return (
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
  );
}

/** أرضية خفيفة مشتركة تحت الرسم. */
function Ground({ uid }: { uid: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-fade`} x1="20" y1="0" x2="140" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M20 104h120" stroke={`url(#${uid}-fade)`} strokeWidth={1.5} strokeLinecap="round" />
    </>
  );
}

/** لا توجد خطط بعد — بطاقات تسعير فارغة. */
export function EmptyPlans(p: Props) {
  const uid = useUid("emp-plans");
  return (
    <Frame {...p}>
      <Ground uid={uid} />
      {/*
        اللوحُ الفارغ يتحرّك: حالةُ الفراغ أطولُ ما يقف عندها الزائرُ
        حائراً، وحركةٌ خفيفةٌ فيها تقول «المكانُ حيٌّ وينتظر» بدل «الصفحةُ
        معطّلة». والحركةُ SMIL داخل الـSVG فتعمل حيث لا يصل CSS خارجيّ.
      */}
      <g stroke="currentColor" strokeWidth={1.5} fill="none" strokeLinejoin="round">
        {/* اللوحان الجانبيّان — يتنفّسان بتفاوتٍ فلا يخفقان معاً */}
        <rect x="26" y="34" width="38" height="60" rx="7" opacity={0.45}>
          <animate attributeName="y" values="34;30;34" dur="3.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.45;0.62;0.45" dur="3.6s" repeatCount="indefinite" />
        </rect>
        <rect x="96" y="34" width="38" height="60" rx="7" opacity={0.45}>
          <animate attributeName="y" values="34;30;34" dur="3.6s" begin="1.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.45;0.62;0.45" dur="3.6s" begin="1.2s" repeatCount="indefinite" />
        </rect>
        {/* اللوحُ الأوسط — أبطأُ وأوسعُ مدىً فيبقى هو المتصدّر */}
        <rect x="60" y="22" width="40" height="72" rx="8">
          <animate attributeName="y" values="22;17;22" dur="4.4s" begin="0.4s" repeatCount="indefinite" />
        </rect>
        <g>
          <animateTransform attributeName="transform" type="translate" values="0 0;0 -5;0 0" dur="4.4s" begin="0.4s" repeatCount="indefinite" />
          <path d="M70 40h20M70 50h12" opacity={0.6} />
          <path d="M68 66h24M68 76h16" opacity={0.35} />
        </g>
        <g>
          <animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="3.6s" repeatCount="indefinite" />
          <path d="M36 48h18M36 58h12" opacity={0.3} />
        </g>
        <g>
          <animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="3.6s" begin="1.2s" repeatCount="indefinite" />
          <path d="M106 48h18M106 58h12" opacity={0.3} />
        </g>
        {/* السهمُ يهبط ويصعد — يشير إلى المكان الذي ستُضاف فيه الخطط */}
        <path d="m74 14 6 6 6-6" opacity={0.55}>
          <animateTransform attributeName="transform" type="translate" values="0 -3;0 3;0 -3" dur="2.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.75;0.3" dur="2.2s" repeatCount="indefinite" />
        </path>
      </g>
    </Frame>
  );
}

/** لا كورسات — مخطوطة داخل قوس. */
export function EmptyCourses(p: Props) {
  const uid = useUid("emp-courses");
  return (
    <Frame {...p}>
      <Ground uid={uid} />
      {/*
        الكتابُ يتنفّس وسطورُه تُكتب.
        حالةُ «لا كورسات» أوّلُ ما يراه طالبٌ جديد، وصورةٌ ساكنةٌ فيها
        تقول «الصفحةُ معطّلة» — والحركةُ تقول «المكانُ ينتظر».
        والحركةُ SMIL داخل الـSVG فتعمل حيث لا يصل CSS خارجيّ.
      */}
      <g stroke="currentColor" strokeWidth={1.5} fill="none" strokeLinejoin="round">
        {/* المحرابُ خلفَه — يتّسع ويضيق ببطء */}
        <path d="M46 96V50q0-16 34-30 34 14 34 30v46" opacity={0.3}>
          <animate attributeName="opacity" values="0.18;0.42;0.18" dur="4.2s" repeatCount="indefinite" />
        </path>

        {/* الدفّتان — ترتفعان معاً كأنّ الكتابَ يتنفّس */}
        <g>
          <animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="3.4s" repeatCount="indefinite" />
          <path d="M80 44c-6-5-14-8-24-8H50v44h6c10 0 18 3 24 8 6-5 14-8 24-8h6V36h-6c-10 0-18 3-24 8Z" />
          <path d="M80 44v44" />
        </g>

        {/* السطورُ تُكتب سطراً بعد سطر ثمّ تُمحى — كتابةٌ لا وميض */}
        <g opacity={0.45} strokeDasharray="12">
          <path d="M58 52h12">
            <animate attributeName="stroke-dashoffset" values="12;0;0;12" dur="3.6s" repeatCount="indefinite" />
          </path>
          <path d="M90 52h12">
            <animate attributeName="stroke-dashoffset" values="12;0;0;12" dur="3.6s" begin="0.3s" repeatCount="indefinite" />
          </path>
          <path d="M58 60h12">
            <animate attributeName="stroke-dashoffset" values="12;0;0;12" dur="3.6s" begin="0.6s" repeatCount="indefinite" />
          </path>
          <path d="M90 60h12">
            <animate attributeName="stroke-dashoffset" values="12;0;0;12" dur="3.6s" begin="0.9s" repeatCount="indefinite" />
          </path>
        </g>
      </g>
    </Frame>
  );
}

/** لا إشعارات — جرس هادئ. */
export function EmptyBell(p: Props) {
  const uid = useUid("emp-bell");
  return (
    <Frame {...p}>
      <Ground uid={uid} />
      <g id="amb-bell"><animateTransform attributeName="transform" type="rotate" values="-7 80 40;7 80 40;-7 80 40" dur="2.6s" repeatCount="indefinite"/><g stroke="currentColor" strokeWidth={1.5} fill="none" strokeLinejoin="round">
        <path d="M80 26c-11 0-20 9-20 20v14l-7 11h54l-7-11V46c0-11-9-20-20-20Z" />
        <path d="M80 20v6" />
        <path d="M72 71a8 8 0 0 0 16 0" />
        <path d="M44 40c1.5-6 5-11 10-14M116 40c-1.5-6-5-11-10-14" opacity={0.35} />
      </g>
    </g></Frame>
  );
}

/** كورس مقفل. */
export function EmptyLock(p: Props) {
  const uid = useUid("emp-lock");
  return (
    <Frame {...p}>
      <Ground uid={uid} />
      <g id="amb-lock"><animateTransform attributeName="transform" type="scale" values="1;1.04;1" dur="2.8s" repeatCount="indefinite" additive="sum"/><g stroke="currentColor" strokeWidth={1.5} fill="none" strokeLinejoin="round">
        <rect x="54" y="54" width="52" height="40" rx="8" />
        <path d="M66 54v-8a14 14 0 0 1 28 0v8" />
        <circle cx="80" cy="72" r="4" />
        <path d="M80 76v7" />
        <path d="M34 30h16M110 30h16M40 22v16M120 22v16" opacity={0.22} />
      </g>
    </g></Frame>
  );
}
