"use client";

/**
 * لوحُ ترحيب الطالب — الهيئة الأزهرية.
 * ------------------------------------------------------------------
 * لوحٌ كحليٌّ غامق تُزيّنه شبكةٌ هندسيّةٌ إسلامية، وترحيبٌ بالطالب وصفِّه،
 * وثلاثُ بطاقاتٍ تطفو على حافّته السفلى نصفَ طفوٍ — نصفُها في اللوح
 * ونصفُها خارجه.
 *
 * **والزخرفةُ مبنيّةٌ لا مرسومة.** الشبكةُ نجومٌ ثمانيّةٌ على شبكةٍ مربّعة،
 * كلُّ نجمةٍ مربّعان بزاوية ٤٥° — وهو أصلُ التوريق الإسلامي. وبناؤها
 * رياضيّاً يجعلها دقيقةً بالضرورة: لا خطَّ في غير موضعه، ولا زاويةَ
 * تقريبيّة. وهذا ما يفرّق الزخرفةَ الحقيقية عن رسمٍ يحاكيها.
 *
 * **والبطاقاتُ الطافية تحتاج حشواً تحت اللوح.** لو طفت بلا حشوٍ لغطّت ما
 * بعدها. فاللوحُ يترك أسفله فراغاً بقدر نصف البطاقة — وهو `--az-lift`،
 * يُحسب مرّةً ويُستعمل في الموضعين فلا يفترقان.
 */

import { useMemo, type ReactNode } from "react";

/** رقمٌ بالعربية. */
const ar = (n: number) => n.toLocaleString("ar-EG");

/* ============================================================
   الشبكة الهندسية
   ============================================================ */

/** نجمةٌ ثمانيّة: مربّعان متراكبان بزاوية ٤٥°، مرسومان بمسارٍ واحد. */
function starPath(r: number): string {
  const pts: string[] = [];
  /* ستّةَ عشرَ رأساً بالتناوب بين نصف القطر الخارجيّ والداخليّ */
  const inner = r * 0.414; // نسبةُ المثمّن المنتظم: tan(22.5°)
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : inner;
    pts.push(`${(Math.cos(a) * rad).toFixed(2)} ${(Math.sin(a) * rad).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}

function GirihField({ className = "" }: { className?: string }) {
  const star = useMemo(() => starPath(46), []);
  /* شبكةٌ مربّعة — النجومُ في العُقد، والمثمّناتُ الصغيرة بينها */
  const step = 92;
  const cols = 7;
  const rows = 4;

  return (
    <svg
      viewBox="0 0 640 360"
      preserveAspectRatio="xMinYMid slice"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <defs>
        <linearGradient id="az-h-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.62" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="az-h-mask">
          <rect width="640" height="360" fill="url(#az-h-fade)" />
        </mask>
      </defs>

      <g mask="url(#az-h-mask)">
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            /* الصفُّ الفرديُّ يُزاح نصفَ خطوة — فتتعشّق النجومُ ولا تصطفّ */
            const x = c * step + (r % 2 ? step / 2 : 0);
            const y = r * step + 24;
            return (
              <g key={`${r}-${c}`} transform={`translate(${x} ${y})`}>
                <path d={star} stroke="hsl(var(--gold))" strokeWidth="1.5" opacity="0.5" />
                <path d={star} stroke="hsl(var(--gold))" strokeWidth="0.6" opacity="0.3" transform="scale(0.62)" />
                {/* المثمّنُ الصغير في قلب النجمة */}
                <circle r="9" stroke="hsl(var(--gold))" strokeWidth="0.8" opacity="0.35" />
              </g>
            );
          })
        )}
      </g>
    </svg>
  );
}

/* ============================================================
   رسمُ البطاقة
   ============================================================ */

/**
 * أيقونةٌ في مربّعٍ مذهّب — رسمٌ داخليٌّ بـ`currentColor`.
 * مقاسُها مقاسُ حلقة النسبة (٤٢) فتستوي البطاقاتُ الثلاثُ في صفٍّ واحد.
 */
function TileIcon({ children }: { children: ReactNode }) {
  return (
    <span className="grid size-[2.625rem] shrink-0 place-items-center rounded-2xl border border-[hsl(var(--gold)/0.35)] bg-[hsl(var(--gold)/0.1)] text-[hsl(var(--gold))]">
      <svg
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {children}
      </svg>
    </span>
  );
}

/* ============================================================
   حلقةُ النسبة
   ============================================================ */
function Ring({ value, size = 62 }: { value: number; size?: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <span className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 64 64" className="size-full -rotate-90" fill="none" aria-hidden="true">
        <circle cx="32" cy="32" r={r} stroke="hsl(var(--gold))" strokeOpacity={0.2} strokeWidth="6" />
        <circle
          cx="32" cy="32" r={r}
          stroke="hsl(var(--gold))" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${(c * v) / 100} ${c}`}
        />
      </svg>
      <span className="font-display absolute text-[0.8rem] font-bold text-[hsl(var(--gold))]">{ar(v)}٪</span>
    </span>
  );
}

/* ============================================================
   اللوح
   ============================================================ */
export function AzhariStudentHeader({
  name,
  grade,
  female,
  progress,
  courses,
  daysLeft,
  active,
}: {
  name: string;
  grade?: string;
  female?: boolean;
  /** متوسّط التقدّم ٪. */
  progress: number;
  /** عددُ الكورسات المتاحة. */
  courses: number;
  /** الأيامُ المتبقية في الاشتراك — `null` إن كان دائماً أو بلا اشتراك. */
  daysLeft: number | null;
  /** هل الاشتراكُ ساري. */
  active: boolean;
}) {
  /*
    بطاقةُ الرقم: عنوانٌ فوق، ثمّ الرقمُ كبيراً ومعه وحدتُه، ثمّ سطرُ حال.
    ------------------------------------------------------------------
    كان الرقمُ محشوراً في دائرةٍ صغيرةٍ بحجم `text-lg`، والعنوانُ هو
    الكبير. وصفرُ العربيّة `٠` **نقطةٌ في رسمه**، فبطاقةٌ قيمتُها صفرٌ
    تبدو بلا رقمٍ أصلاً — يراها الطالبُ ثلاثَ نقاطٍ فيظنّها عطباً، وهو
    محقٌّ فيما يرى.

    فصار الرقمُ بطلَ البطاقة، **ومعه وحدتُه دائماً**: «٠٪»، «٠ كورسات»،
    «∞ دائم». والوحدةُ هي التي تجعل النقطةَ تُقرأ عدداً — عينٌ ترى
    «٠ كورسات» تعرف أنّها صفر، وعينٌ ترى «٠» وحدَها ترى نقطة.

    والأرقامُ جدوليّةٌ (`tabular-nums`) فلا يتراقص عرضُ البطاقة كلّما
    تغيّر الرقم.
  */
  const cards = [
    {
      key: "progress",
      art: <Ring value={progress} size={42} />,
      title: "متوسّط تقدّمك الدراسي",
      value: ar(progress),
      unit: "٪",
      note: progress > 0 ? `أنجزتَ ${ar(progress)}٪ من دروسك` : "ابدأ أوّل درسٍ لك",
    },
    {
      key: "courses",
      art: (
        <TileIcon>
          <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H5.5A1.5 1.5 0 0 1 4 15.5z" />
          <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h4.5a1.5 1.5 0 0 0 1.5-1.5z" />
        </TileIcon>
      ),
      title: "كورساتك",
      value: ar(courses),
      unit: courses === 1 ? "كورس" : "كورسات",
      note: courses > 0 ? "متاحةٌ لك الآن" : "لا كورساتٍ بعد",
    },
    {
      key: "sub",
      art: (
        <TileIcon>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 1.8" />
        </TileIcon>
      ),
      title: "اشتراكك",
      value: daysLeft === null ? "∞" : ar(daysLeft),
      unit: daysLeft === null ? "دائم" : "يوماً متبقياً",
      note: active ? "اشتراكٌ ساري المفعول" : "لا اشتراكَ ساري",
    },
  ];

  return (
    /* الحشوُ السفليّ يترك مكانَ نصف البطاقة الطافية — لا تغطّي ما بعدها */
    <div className="az-head relative mb-6 [--az-lift:3.25rem]">
      <div className="relative overflow-hidden rounded-[2rem] bg-[hsl(217_48%_13%)] pb-[calc(var(--az-lift)+1rem)] pt-7 shadow-bento">
        {/* الزخرفةُ الهندسية — من الطرف المقابل للنصّ */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[62%] opacity-70">
          <GirihField className="size-full" />
        </div>
        {/* تدرّجٌ يُعمّق اللوح ويُبقي النصَّ مقروءاً */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(270deg, hsl(217 48% 13% / 0.96) 22%, transparent 72%)" }}
        />

        {/* الترحيب */}
        <div className="relative flex items-center justify-end gap-4 px-6 sm:px-9">
          <div className="min-w-0 text-right">
            <p className="font-kufi text-xs font-bold text-white/70">أهلاً {female ? "بكِ" : "بك"}،</p>
            <h1 className="font-display mt-1 truncate text-2xl font-bold text-white sm:text-3xl">{name}</h1>
            {grade && (
              <p className="font-kufi mt-1.5 text-sm font-bold text-[hsl(var(--gold))]">{grade}</p>
            )}
          </div>
          <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-[hsl(var(--gold)/0.5)] bg-white/10 sm:size-16">
            {/* لا صورةَ للطالب في نموذج الحساب — فأوّلُ حرفٍ من اسمه */}
            <span className="font-display text-xl font-bold text-[hsl(var(--gold))]">{name.slice(0, 1)}</span>
          </span>
        </div>
      </div>

      {/* البطاقاتُ الطافية — نصفُها في اللوح ونصفُها خارجه */}
      <div className="relative -mt-[var(--az-lift)] grid gap-3 px-3 sm:grid-cols-3 sm:px-6">
        {cards.map((c) => (
          <div
            key={c.key}
            className="rounded-3xl border border-[hsl(var(--gold)/0.28)] bg-[hsl(217_48%_15%)] px-4 py-3.5 shadow-[0_18px_38px_-22px_rgba(0,0,0,.8)]"
          >
            {/* العنوانُ فوق والرسمُ في الطرف — فلا يزاحمان الرقم */}
            <div className="mb-2 flex items-start justify-between gap-2">
              <span className="font-kufi min-w-0 flex-1 truncate text-[11px] font-bold text-white/65">
                {c.title}
              </span>
              <span className="shrink-0">{c.art}</span>
            </div>

            <p className="flex items-baseline gap-1.5">
              <span
                className="font-display text-3xl font-extrabold leading-none text-white"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {c.value}
              </span>
              <span className="font-kufi truncate text-[11px] font-bold text-[hsl(var(--gold))]">
                {c.unit}
              </span>
            </p>

            <p className="font-kufi mt-1.5 truncate text-[11px] text-white/55">{c.note}</p>
          </div>
        ))}
      </div>

      {/* فاصلٌ مذهّبٌ أسفل اللوح — يُغلقه فلا يبدو مقطوعاً */}
      <div className="mt-5 flex items-center justify-center gap-3 text-[hsl(var(--gold))]">
        <span className="h-px flex-1 bg-gradient-to-l from-transparent via-current to-transparent opacity-40" />
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
          <path d="M12 3l9 9-9 9-9-9z" />
          <path d="M12 8l4 4-4 4-4-4z" opacity="0.6" />
        </svg>
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-40" />
      </div>
    </div>
  );
}
