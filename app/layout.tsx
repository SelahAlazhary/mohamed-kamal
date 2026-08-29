import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Aref_Ruqaa } from "next/font/google";
import localFont from "next/font/local";
import { ContentProvider } from "@/components/content/content-provider";
import { glowCss } from "@/lib/glow";
import { brandCss } from "@/lib/brand-theme";
import { AzhariBackdrop } from "@/components/brand/azhari-backdrop";
import { ToTop } from "@/components/brand/to-top";
import { findIconFrame, iconFrameClass, iconFrameVars } from "@/lib/icon-frames";
import { findIconMotion, iconMotionClass } from "@/lib/icon-motion";
import { findIconCover, iconCoverClass } from "@/lib/icon-covers";
import { RouteTransition } from "@/components/ui/route-transition";
import { RegisterSW } from "@/components/pwa/register-sw";
import { getPublicDB, getScopedDB, loadDB } from "@/lib/db";
import { touchSession } from "@/lib/session";
import { defaultContent } from "@/lib/defaults";
import { buildJsonLd, buildKeywords, siteUrl } from "@/lib/seo";
import "./globals.css";

export const dynamic = "force-dynamic";

/**
 * الخطوط.
 * • Lalezar             : خطّ العناوين والهوية — عربي عريض ذو شخصية قوية
 *                          (ملف محلّي داخل المستودع، لا يعتمد على شبكة خارجية).
 * • IBM Plex Sans Arabic : متن الواجهة — وضوح عالٍ على الشاشات وأوزان كاملة.
 * Lalezar وزن واحد (٤٠٠) وهو خطّ عرض لا متن، لذلك يُستعمل في العناوين
 * والشارات والزخرفة، ويبقى المتن على Plex حفاظاً على قابلية القراءة.
 */
const lalezar = localFont({
  src: "./fonts/Lalezar-Regular.ttf",
  weight: "400",
  style: "normal",
  variable: "--font-display",
  display: "swap",
});
/*
  خطُّ الرقعة — للتوقيع وحدَه لا للمتن.
  وهو خطُّ المكاتبة والتوقيع في العربية تاريخياً، فالاسمُ به يبدو أثرَ
  يدٍ لا حرفاً مطبوعاً. ويُستضاف مع البناء فلا ينتظره الزائر.
*/
const ruqaa = Aref_Ruqaa({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-sig",
  display: "swap",
});
const plex = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

/** إعدادات العرض — viewport-fit=cover ضروري لاحترام حوّاف الشاشة في التطبيق المثبّت. */
export function generateViewport(): Viewport {
  const { content } = getPublicDB();
  const preset: Record<string, string> = {
    midad: "#233b8b", nile: "#095e86", andalus: "#245c4b", rumman: "#87263a",
    violet: "#233b8b", emerald: "#245c4b", ocean: "#095e86", crimson: "#87263a",
  };
  const primary =
    (content.theme.preset === "custom" && content.theme.customPrimary) ||
    preset[content.theme.preset] ||
    preset.midad;
  return {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    themeColor: primary,
  };
}

/** يحوّل عنوان الموقع إلى URL صالح، ويسقط لعنوان محلي إن كان فارغاً أو تالفاً. */
function safeUrl(raw?: string): URL {
  try {
    if (raw) return new URL(raw);
  } catch {
    /* عنوان غير صالح — نتجاهله */
  }
  return new URL("http://localhost:3000");
}

/** ميتاداتا ديناميكية من قاعدة البيانات (العنوان/الوصف/الأيقونة/OG). */
export async function generateMetadata(): Promise<Metadata> {
  await loadDB();
  const pub = getPublicDB();
  const c = pub.content;
  const site = await siteUrl(c.url);
  // أيقونة الموقع (favicon) = شعار الأستاذة أو صورتها
  const icon = c.teacher?.logo || c.teacher?.avatar || "/teacher.svg";
  return {
    // عنوان الموقع قد يكون فارغاً قبل ضبطه من اللوحة — لا نكسر البناء بسببه
    metadataBase: safeUrl(site || c.url),
    title: { default: `${c.brand} | ${c.platformSubtitle}`, template: `%s | ${c.brand}` },
    description: c.teacher.bio,
    openGraph: {
      type: "website", locale: "ar_EG", url: site || undefined, siteName: c.brand,
      title: `${c.teacher.subject} مع ${c.teacher.name}`,
      description: c.teacher.tagline,
      images: [{ url: icon, width: 1200, height: 630, alt: c.brand }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${c.teacher.subject} مع ${c.teacher.name}`,
      description: c.teacher.tagline,
      images: [icon],
    },
    keywords: buildKeywords(c, pub.subjects ?? []),
    authors: [{ name: c.teacher.name }],
    creator: c.teacher.name,
    publisher: c.brand,
    category: "education",
    // العنوان القانوني يمنع تشتّت الترتيب بين نسخ الرابط (بـwww وبدونه…)
    alternates: site ? { canonical: site } : undefined,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    manifest: "/manifest.webmanifest",
    applicationName: c.brand,
    appleWebApp: {
      capable: true,
      title: c.brand,
      statusBarStyle: "black-translucent",
    },
    icons: {
      icon,
      apple: [{ url: "/api/pwa-icon?size=180", sizes: "180x180", type: "image/png" }],
    },
    formatDetection: { telephone: false },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  await loadDB(); // مصدر الحقيقة (فايربيز إن ضُبط)
  const session = await touchSession(); // يمدّد الجلسة الدائمة
  // الحمولة الأولى (SSR) مقيّدة بدور صاحب الجلسة — لا تسرّب بيانات لغير أصحابها
  const db = getScopedDB(session);
  const theme = db.content?.theme ?? defaultContent.theme;
  /* البيانات المهيكلة تُبنى من الحمولة العامة لا من حمولة صاحب الجلسة:
     حمولة الطالب مُصفّاة بصفّه، ولو بُنيت منها لاختلف الوصف المهيكل من
     زائر لآخر — وجوجل يريد وصفاً ثابتاً يطابق ما تعرضه الصفحة للعموم. */
  const pub = getPublicDB();
  /* الوهج من الحمولة العامّة — تنسيقُ الصفحة واحدٌ لكل من يراها. */
  const glow = glowCss(pub.content?.glow);
  /*
    هويةُ الألوان تُحقن على الخادم لا في المتصفّح: لو كُتبت بعد الترطيب
    ومض الثيمُ الافتراضيُّ لحظةً ثمّ انقلب — وهو أظهرُ ما يكون على أوّل
    زيارة، وهي التي تُبنى عليها الانطباعات.
  */
  const brand = theme.preset === "custom"
    ? brandCss({
        primary: theme.customPrimary ?? undefined,
        gold: theme.customGold ?? undefined,
        paper: theme.customPaper ?? undefined,
      })
    : "";
  const base = await siteUrl(pub.content?.url);
  const jsonLd = buildJsonLd(pub.content ?? defaultContent, {
    base,
    subjects: pub.subjects ?? [],
    plans: pub.plans ?? [],
  });

  return (
    <html
      lang="ar"
      dir="rtl"
      data-layout={theme.layout}
      data-preset={theme.preset}
      suppressHydrationWarning
    >
      <head>
        {jsonLd.map((block, i) => (
          <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }} />
        ))}
        {/*
          الوهج — يُترجَم من القواعد مرّةً على الخادم ويُحقن في الجذر،
          فيعمل في الواجهة وبوابة الطالب واللوحة معاً بلا تكرار. ولا
          يُكتب شيءٌ إن لم تكن قاعدةٌ مفعّلة.
        */}
        {brand && <style dangerouslySetInnerHTML={{ __html: brand }} />}
        {glow && <style dangerouslySetInnerHTML={{ __html: glow }} />}
      </head>
      <body
        /*
          أصنافُ الأيقونات على `<body>` لا على صفحةٍ بعينها: كانت على
          جذر الواجهة وجذر اللوحة كلٌّ على حدة، فما اختير في اللوحة لم
          يسرِ على صفحات الدخول والتسجيل والقانونية. وهنا تسري على
          المنصّة كلِّها بلا استثناء.
        */
        style={iconFrameVars(pub.content?.iconFrameColors)}
        className={`${plex.variable} ${lalezar.variable} ${ruqaa.variable} font-sans ${iconFrameClass(findIconFrame(pub.content?.iconFrame))} ${iconCoverClass(findIconCover(pub.content?.iconCover))} ${iconMotionClass(findIconMotion(pub.content?.iconMotion))}`}
      >
        {/*
          الخلفيةُ خارج كلّ ما يتحرّك.
          `position: fixed` تتصرّف تصرّفَ `absolute` إن كان في أسلافها
          عنصرٌ عليه `transform` — وانتقالُ الصفحات يضع واحداً. فكانت
          الخلفيةُ تنزلق مع المحتوى بدل أن تثبت. فمكانُها هنا: تحت
          `<body>` مباشرةً، لا سلفَ متحرّكٌ فوقها.
        */}
        {pub.content?.azhariBackdrop !== false && <AzhariBackdrop />}
        <ContentProvider initialDB={db} initialSession={session}>
          <RouteTransition>{children}</RouteTransition>
          {/*
            زرُّ العودة خارج انتقال الصفحات.
            `position: fixed` تتصرّف تصرّفَ `absolute` إن كان في أسلافها
            عنصرٌ عليه `transform` — وانتقالُ الصفحات يضع واحداً. فكان
            الزرُّ يستقرّ في قاع المستند لا في زاوية الشاشة، فلا يراه أحد.
          */}
          <ToTop />
          <RegisterSW />
        </ContentProvider>
      </body>
    </html>
  );
}
