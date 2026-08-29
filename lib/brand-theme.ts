/**
 * هويةُ المنصّة اللونية.
 * ------------------------------------------------------------------
 * كان «اللون المخصّص» لوناً واحداً يُشتقّ منه الباقي بتدوير الدرجة —
 * وهذا يكفي لتلوينٍ سريع، ولا يكفي لهويةٍ بصريّةٍ معطاة: من يملك كحليّه
 * وذهبَه وورقَه بأرقامها لا يقبل أن يُشتقّ ذهبُه من كحليّه.
 *
 * فصارت ثلاثةَ ألوانٍ تُعطى، وما عداها يُشتقّ منها اشتقاقاً محسوباً:
 *
 * **والذهبُ الفاتحُ لا يصلح نصّاً.** ذهبٌ مثل `#e5caa5` نسبةُ تباينه مع
 * الورق الأبيض دون ١٫٦:١ — يُقرأ بالكاد. فيُؤخذ للزخرفة والحدود
 * والتعبئة، ويُشتقّ منه **ذهبٌ غائر** للنصّ والشارات وحدها. هكذا تبقى
 * الهويةُ هي هي، ويبقى النصُّ مقروءاً.
 */

export type BrandColors = {
  /** اللون الأساسي — الكحلي. */
  primary?: string;
  /** الذهبي — للزخرفة والحدود. */
  gold?: string;
  /** لون الورق — خلفية الصفحة في الوضع الفاتح. */
  paper?: string;
};

export type Hsl = [number, number, number];

export function hexToHsl(hex: string): Hsl {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let hue = 0;
  let s = 0;
  if (d) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hue = ((g - b) / d) % 6; break;
      case g: hue = (b - r) / d + 2; break;
      default: hue = (r - g) / d + 4;
    }
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  return [Math.round(hue), Math.round(s * 100), Math.round(l * 100)];
}

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Math.round(n)));
const v = ([h, s, l]: Hsl) => `${h} ${s}% ${l}%`;

/** يُتحقّق أنّ ما وصل لونٌ فعلاً — لا يدخل CSS ما ليس لوناً. */
export function safeHex(x?: string): string | undefined {
  return x && /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(x.trim()) ? x.trim() : undefined;
}

/**
 * يبني متغيّرات CSS من الألوان الثلاثة.
 * يُستدعى على الخادم فيُحقن قبل أوّل رسم — فلا يومض الثيمُ الافتراضيّ
 * لحظةً ثمّ ينقلب — ويُستدعى في المتصفّح عند التعديل الحيّ.
 */
export function brandVars(c: BrandColors): Record<string, string> {
  const out: Record<string, string> = {};

  const primary = safeHex(c.primary);
  if (primary) {
    const [h, s, l] = hexToHsl(primary);
    out["--primary"] = v([h, s, l]);
    out["--primary-foreground"] = l > 62 ? "224 44% 12%" : "0 0% 100%";
    /* الوهجُ من الأساسيّ نفسِه أفتحَ وأشبعَ قليلاً — لا لونٌ غريبٌ عنه. */
    out["--glow"] = v([h, clamp(s + 10), clamp(l + 10, 0, 70)]);
    out["--ring"] = v([h, s, l]);
  }

  const gold = safeHex(c.gold);
  if (gold) {
    const [h, s, l] = hexToHsl(gold);
    out["--gold"] = v([h, s, l]);
    out["--gold-light"] = v([h, clamp(s + 6), clamp(l + 12, 0, 92)]);
    /*
      الغائرُ للنصّ: يُخفض حتى يُقرأ على الورق الفاتح. والحدُّ ٤٢٪ ضياءً
      يعطي تبايناً يقارب ٤٫٥:١ مع ورقٍ يقارب البياض — وهو حدُّ المقروئية.
    */
    const deepL = Math.min(l, 42);
    out["--gold-deep"] = v([h, clamp(s + 22, 0, 92), deepL]);
    /* اللكنةُ تُستعمل نصّاً وشارات، فتأخذ الغائر لا الفاتح. */
    out["--accent"] = v([h, clamp(s + 22, 0, 92), deepL]);
    out["--accent-foreground"] = "0 0% 100%";
  }

  const paper = safeHex(c.paper);
  if (paper) {
    const [h, s, l] = hexToHsl(paper);
    /* الورقُ خلفية، والبطاقةُ أفتحُ منه قليلاً لترتفع عنه. */
    out["--background"] = v([h, s, l]);
    out["--card"] = v([h, clamp(s + 6), clamp(l + 2, 0, 100)]);
    out["--muted"] = v([h, clamp(s + 4), clamp(l - 5)]);
    out["--border"] = v([h, clamp(s + 4), clamp(l - 12)]);
  }

  return out;
}

/** المتغيّرات نصّاً جاهزاً للحقن في `<style>` على الخادم. */
export function brandCss(c: BrandColors): string {
  const vars = brandVars(c);
  const body = Object.entries(vars).map(([k, val]) => `${k}:${val}`).join(";");
  if (!body) return "";
  /*
    يُكتب على `[data-layout="light"]` أيضاً لا على `:root` وحده: قواعدُ
    الطبقة الفاتحة تكتب `--background` و`--card` بوزنٍ أعلى من `:root`،
    فلولا هذا لغلبت ورقَ الهوية وأعادت الورقَ الافتراضيّ.
  */
  return `:root{${body}}\n[data-layout="light"]{${body}}`;
}
