/**
 * زخارفُ الموادّ الشرعية.
 * ------------------------------------------------------------------
 * كانت خلفياتُ الأقسام تُرسم بحروفٍ عربيةٍ ومصطلحاتِ نحوٍ وبلاغة — تصلح
 * لمنصّةِ لغةٍ لا لمنصّةِ فقهٍ وتفسير. وهذه بديلُها: صورٌ من عالَم الموادّ
 * الشرعية نفسِه، اختارها الأستاذ.
 *
 * **والعرضُ هو ما يجعلها محترفة، لا الصورُ وحدها.** صورٌ حسنةٌ تُنثَر
 * بلا ضابطٍ تبدو ملصقاتٍ على جدار. فأربعةُ ضوابطَ تحكمها هنا:
 *
 * ١ ــ **حجمٌ بصريٌّ واحد.** قُصّت حوافُّها الشفّافة ثمّ وُحِّدت على
 *      مربّع ٢٥٦ — فالهلالُ العريض والخاتمُ المربّع يشغلان المساحةَ
 *      نفسَها ولا يبدو أحدُهما أكبرَ من أخيه.
 *
 * ٢ ــ **تباعدٌ مضمون.** التوزيعُ بالرفض لا بالرمي: كلُّ موضعٍ يُجرَّب
 *      ويُرفض إن قارب سابقَه. والرميُ الحرّ يُنتج كتلاً ملتصقةً وفراغاتٍ
 *      واسعة، وهي أظهرُ ما يفسد الخلفية.
 *
 * ٣ ــ **خفوتٌ وتلاشٍ.** الخلفيةُ تُحسّ ولا تُقرأ: شفافيةٌ منخفضة وقناعٌ
 *      شعاعيٌّ يُذيبها عند الأطراف فلا تُقطع قطعاً حادّاً عند حدّ القسم.
 *
 * ٤ ــ **ثباتُ التوزيع.** البذرةُ تجعل المواضعَ نفسَها على الخادم
 *      والمتصفّح — والعشوائيُّ الحقيقيُّ يختلف بينهما فتشتكي React.
 *
 * والصورُ في `public/art/` لا في قاعدة البيانات: القاعدةُ تُقرأ مع كلّ
 * طلبٍ للمحتوى، وصورةٌ فيها تُنقل مع كلّ زيارة.
 */

/** المفرداتُ السبع — المعرّفُ هو اسمُ الملفّ. */
export const SHARI_ART = [
  { id: "mushaf", name: "المصحف المذهّب" },
  { id: "rihal", name: "المصحف على الرَّحل" },
  { id: "mosqueBook", name: "المسجد والكتاب" },
  { id: "crescentStar", name: "الهلال والنجمة" },
  { id: "khatam", name: "الخاتم الثمانيّ" },
  { id: "crescentMosque", name: "الهلال والمآذن" },
  { id: "crescentDome", name: "الهلال والقباب" },
] as const;

export type ShariArtId = (typeof SHARI_ART)[number]["id"];

/**
 * المفرداتُ المتحرّكة.
 * ------------------------------------------------------------------
 * ثلاثٌ متحرّكة، وموضعُها **ترويساتُ الأقسام لا خلفياتُها**. ونثرُ عشرةٍ
 * منها في الخلفية يخنق الصفحة: ثلاثتُها مجتمعةً كانت ١٫٢ ميجابايت
 * GIF — أي أكثرَ ممّا تزنه الصفحةُ كلُّها. فحُوِّلت إلى WebP متحرّك
 * فصارت ٢٢٠ كيلوبايت (٨٢٪ أخفّ) بالإطارات نفسِها.
 *
 * ولم تُقصّ ولم تُعالَج إطاراً إطاراً: أدواتُ الصور تقرأ الإطارَ الأوّل
 * وتطرح الباقي، فتُفقدها حركتَها وهي المقصودة.
 */
export const SHARI_ANIM = [
  { id: "mosqueAnim", name: "المسجد" },
  { id: "domeAnim", name: "القبّة والهلال" },
  { id: "quranAnim", name: "المصحف المفتوح" },
  { id: "bookAnim", name: "الكتاب المفتوح" },
  { id: "capAnim", name: "قبّعة التخرّج" },
  { id: "checklistAnim", name: "قائمة الإنجاز" },
  { id: "notepadAnim", name: "الدفتر والقلم" },
  { id: "capBookAnim", name: "القبّعة والكتاب" },
  { id: "onlineClassAnim", name: "الدرس المباشر" },
  { id: "booksCapAnim", name: "الكتب والقبّعة" },
  { id: "capStarsAnim", name: "قبّعة التميّز" },
  { id: "capOpenBookAnim", name: "القبّعة والمصحف" },
] as const;

export type ShariAnimId = (typeof SHARI_ANIM)[number]["id"];

/**
 * صورةٌ متحرّكة في إطارها — لترويسة قسمٍ أو بطاقةٍ مميّزة.
 *
 * والإطارُ ليس زخرفةً تُضاف هنا: هو الصنفُ `ic-frame` نفسُه الذي تحمله
 * أيقوناتُ المنصّة كلُّها، فيأخذ الشكلَ والتعبئةَ والحدَّ والغلافَ من
 * اختيار اللوحة. فإن بُدِّل الإطارُ من «المظهر» تبدّلت هذه معه ولا
 * تشذّ عن أخواتها — وهذا هو المقصودُ من نظام إطارٍ واحد.
 *
 * والحشوةُ نسبةٌ من الحجم لا رقمٌ ثابت: إطارٌ بحشوةٍ ثابتة يخنق الصغيرَ
 * ويترك الكبيرَ سابحاً في فراغه.
 */
export function ShariAnim({
  id,
  size = 84,
  framed = true,
  round = false,
  className = "",
}: {
  id: ShariAnimId;
  size?: number;
  /** يُلبَس إطارَ المنصّة — يُطفأ لمن أرادها عاريةً. */
  framed?: boolean;
  /**
   * تُقصّ دائرةً.
   * خلفيةُ هذه الصور بيضاءُ مصمتةٌ لا شفّافة — فتظهر مربّعاً أبيضَ حول
   * الرسم مهما وُضعت. والقصُّ الدائريُّ يجعل ذلك البياضَ قرصاً مقصوداً
   * تجلس عليه الصورةُ، بدل مربّعٍ يبدو خطأً في التصدير.
   */
  round?: boolean;
  className?: string;
}) {
  const pad = Math.round(size * 0.17);

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/art/${id}.webp`}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      /* لا `loading="lazy"` هنا: هي في الترويسة، وتأخيرُها يُظهر فجوةً
         ثمّ تقفز الحركةُ فجأةً — وهو أسوأُ من تحميلها مع القسم. */
      decoding="async"
      className={`select-none object-contain ${round ? "rounded-full" : ""}`}
      style={{ width: size, height: size }}
    />
  );

  if (!framed) {
    if (!round) return <span className={className}>{img}</span>;
    /* حلقةٌ ذهبيّةٌ رفيعة تُنهي القرصَ فلا يذوب في سطحٍ فاتحٍ تحته */
    return (
      <span
        className={`relative inline-grid place-items-center rounded-full ring-1 ring-[hsl(var(--gold)/0.55)] ${className}`}
        style={{ width: size, height: size }}
      >
        {img}
      </span>
    );
  }

  return (
    <span
      className={`ic-frame grid place-items-center ${className}`}
      style={{ width: size + pad * 2, height: size + pad * 2 }}
    >
      {img}
    </span>
  );
}

export function shariArtSrc(id: ShariArtId): string {
  return `/art/${id}.png`;
}

/** صورةٌ واحدة — للاستعمال المفرد داخل بطاقةٍ أو ترويسة. */
export function ShariMark({
  id,
  size = 48,
  className = "",
}: {
  id: ShariArtId;
  size?: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={shariArtSrc(id)}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={`select-none object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/**
 * خلفيةُ القسم — الصورُ منثورةٌ بتباعدٍ مضمون.
 */
export function ShariBackdrop({
  count = 10,
  seed = 7,
  opacity = 0.16,
  className = "",
}: {
  count?: number;
  seed?: number;
  /** الخفوتُ الكلّي — الخلفيةُ تُحسّ ولا تُقرأ. */
  opacity?: number;
  className?: string;
}) {
  /* مولّدٌ خطّيٌّ بسيط: يكفي للتوزيع، ويعطي النتيجةَ نفسَها في الجهتين. */
  let s = seed * 9301 + 49297;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  const items: { key: number; id: ShariArtId; x: number; y: number; size: number; spin: number }[] = [];
  /* أقلُّ مسافةٍ بين مركزين بالنسبة المئوية — دونها تتلامس الصور. */
  const MIN = 21;
  let guard = count * 70;

  while (items.length < count && guard-- > 0) {
    const x = 5 + rnd() * 86;
    const y = 5 + rnd() * 82;
    if (!items.every((o) => Math.hypot(o.x - x, o.y - y) >= MIN)) continue;
    items.push({
      key: items.length,
      id: SHARI_ART[Math.floor(rnd() * SHARI_ART.length)].id,
      x,
      y,
      size: 46 + Math.round(rnd() * 52),
      spin: Math.round(rnd() * 18 - 9),
    });
  }

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
      style={{
        opacity,
        /* تتلاشى نحو الأطراف فلا تُقطع قطعاً حادّاً عند حدّ القسم */
        WebkitMaskImage: "radial-gradient(74% 68% at 50% 45%, #000 26%, transparent 100%)",
        maskImage: "radial-gradient(74% 68% at 50% 45%, #000 26%, transparent 100%)",
      }}
    >
      {items.map(({ key, id, x, y, size, spin }) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={key}
          src={shariArtSrc(id)}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          className="absolute select-none object-contain"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: size,
            height: size,
            /* الإزاحةُ بنصف الحجم تجعل الإحداثيَّ مركزاً لا ركناً — وبها
               وحدَها يصحّ قياسُ التباعد بين المراكز. */
            transform: `translate(50%, -50%) rotate(${spin}deg)`,
          }}
        />
      ))}
    </div>
  );
}
