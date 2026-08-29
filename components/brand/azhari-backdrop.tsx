/**
 * الخلفية الأزهرية.
 * ------------------------------------------------------------------
 * خلفيةٌ **واحدةٌ مرسومة** تملأ الشاشة، لا نقشٌ صغيرٌ يُكرَّر. والفرقُ
 * جوهريّ: التكرارُ يُظهر خطوطَ الوصل بين البلاطات فتبدو الصفحةُ مبلّطةً
 * لا مزخرفة، والعينُ تلتقط الحدَّ قبل أن تلتقط الزخرفة.
 *
 * فهذه لوحةٌ واحدة `preserveAspectRatio="xMidYMid slice"` — تُقصّ من
 * أطرافها لتملأ أيَّ شاشةٍ ولا تنكسر في وسطها أبداً.
 *
 * **وثابتةٌ بطبقةٍ `fixed` لا بـ`background-attachment: fixed`** —
 * الأخيرةُ معطّلةٌ على iOS ومكلفةٌ في الرسم على الجوّال، والطبقةُ تعطي
 * الأثر نفسه في كلّ متصفّح.
 *
 * **والزخرفةُ لا تُزاحم النصّ:** كلُّ ما فيها بشفافيةٍ دون ٪٩، والمتنُ
 * يمرّ فوقها على لوحٍ من لون الورق. فالخلفيةُ تُحسّ ولا تُقرأ — وهذا هو
 * المطلوب من خلفية.
 *
 * ويُرسم كلُّه على الخادم: لا صورةَ تُحمَّل، ولا مكتبةَ رسمٍ تُضاف، ولا
 * وزنَ يُذكر — بضعةُ كيلوبايتات في صفحة HTML نفسِها.
 */

export function AzhariBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-30 overflow-hidden">
      <svg
        className="size-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* أرضيةُ الورق — تدرّجٌ لا لونٌ مصمت، فالمصمتُ يبدو ورقاً مطبوعاً */}
          <linearGradient id="az-paper" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0" stopColor="hsl(var(--background))" />
            <stop offset="0.55" stopColor="hsl(var(--card))" />
            <stop offset="1" stopColor="hsl(var(--muted))" />
          </linearGradient>

          {/* بركُ الضوء — تُعطي عمقاً بلا حدٍّ ظاهر */}
          <radialGradient id="az-glow-top" cx="0.5" cy="0" r="0.75">
            <stop offset="0" stopColor="hsl(var(--gold))" stopOpacity="0.30" />
            <stop offset="1" stopColor="hsl(var(--gold))" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="az-glow-side" cx="0.08" cy="0.72" r="0.6">
            <stop offset="0" stopColor="hsl(var(--primary))" stopOpacity="0.20" />
            <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </radialGradient>

          {/*
            الشمسةُ الثمانية — بناءٌ هندسيٌّ لا رسمٌ حرّ: نجمتان مربّعتان
            بزاوية ٤٥°، وهو أصلُ التوريق الإسلامي كلِّه.
          */}
          <g id="az-star">
            <path d="M0 -150 L34 -34 150 0 34 34 0 150 -34 34 -150 0 -34 -34Z" />
            <path
              d="M0 -150 L34 -34 150 0 34 34 0 150 -34 34 -150 0 -34 -34Z"
              transform="rotate(45)"
            />
          </g>

          {/* قناعٌ يُخفت الزخرفةَ عند الأطراف فلا تُقطع قطعاً حادّاً */}
          <radialGradient id="az-fade" cx="0.5" cy="0.42" r="0.72">
            <stop offset="0" stopColor="#fff" stopOpacity="1" />
            <stop offset="0.62" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="az-mask">
            <rect width="1200" height="800" fill="url(#az-fade)" />
          </mask>
        </defs>

        <rect width="1200" height="800" fill="url(#az-paper)" />
        <rect width="1200" height="800" fill="url(#az-glow-top)" />
        <rect width="1200" height="800" fill="url(#az-glow-side)" />

        <g mask="url(#az-mask)" fill="none" stroke="hsl(var(--primary))">
          {/* الشمسةُ الكبرى — مركزُ اللوحة */}
          <g transform="translate(600 330)" strokeWidth="1.1" opacity="0.085">
            <g transform="scale(2.15)"><use href="#az-star" /></g>
            <g transform="scale(1.55)"><use href="#az-star" /></g>
            <g transform="scale(0.95)"><use href="#az-star" /></g>
            <circle r="330" strokeWidth="0.6" />
            <circle r="232" strokeWidth="0.6" />
            <circle r="146" strokeWidth="0.6" />
          </g>

          {/* شمستان جانبيّتان أصغر — تكسران تناظرَ المركز الجامد */}
          <g transform="translate(112 690) scale(0.82)" strokeWidth="1" opacity="0.06">
            <use href="#az-star" />
            <g transform="scale(0.6)"><use href="#az-star" /></g>
          </g>
          <g transform="translate(1092 128) scale(0.7)" strokeWidth="1" opacity="0.06">
            <use href="#az-star" />
            <g transform="scale(0.6)"><use href="#az-star" /></g>
          </g>

          {/* الضلوعُ المشعّة — تربط الشمسةَ بأطراف اللوحة كالتوريق */}
          <g transform="translate(600 330)" strokeWidth="0.5" opacity="0.055">
            {Array.from({ length: 24 }, (_, i) => (
              <line key={i} x1="0" y1="0" x2="0" y2="-760" transform={`rotate(${i * 15})`} />
            ))}
          </g>
        </g>

        {/* المحرابُ — قوسٌ واحدٌ يعلو اللوحة، وهو أظهرُ ما في العمارة الأزهرية */}
        <path
          d="M600 44c-96 0-174 78-174 174v582h348V218c0-96-78-174-174-174z"
          fill="none"
          stroke="hsl(var(--gold))"
          strokeWidth="1.5"
          opacity="0.16"
        />
        <path
          d="M600 92c-70 0-126 56-126 126v582h252V218c0-70-56-126-126-126z"
          fill="none"
          stroke="hsl(var(--gold))"
          strokeWidth="0.9"
          opacity="0.1"
        />

        {/* شريطُ التذهيب أسفلَ اللوحة — يُغلقها فلا تبدو مقطوعة */}
        <rect y="792" width="1200" height="8" fill="hsl(var(--gold))" opacity="0.2" />
      </svg>
    </div>
  );
}
