"use client";

/**
 * آخرُ حدٍّ للخطأ.
 * ------------------------------------------------------------------
 * `app/admin/error.tsx` يلتقط عطبَ الصفحات، ولا يلتقط عطبَ القالب نفسِه
 * — فهو فوقه في الشجرة. وإذا عطِب القالبُ سقط كلُّ شيءٍ معه: الخطوطُ
 * والتنسيقُ والاتّجاه.
 *
 * فهذا الملفُّ يرسم `<html>` و`<body>` بنفسه، ولا يستند إلى شيءٍ ممّا
 * سقط: لا صنفَ Tailwind ولا متغيّرَ لون — تنسيقٌ داخليٌّ خالصٌ يعمل ولو
 * لم تُحمَّل ورقةُ الأنماط أصلاً. وهو نادرُ الظهور، فإن ظهر وجب أن يظهر
 * صحيحاً.
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "1.5rem",
          background: "#fbfaf7",
          color: "#2c456a",
          fontFamily: "system-ui, 'Segoe UI', Tahoma, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: "30rem",
            width: "100%",
            textAlign: "center",
            border: "1px solid #e9e3d3",
            borderRadius: "1.5rem",
            background: "#fff",
            padding: "2rem",
          }}
        >
          <div
            style={{
              width: "3.5rem",
              height: "3.5rem",
              margin: "0 auto 1rem",
              display: "grid",
              placeItems: "center",
              borderRadius: "999px",
              background: "rgba(225,29,72,0.10)",
              color: "#e11d48",
              fontSize: "1.5rem",
            }}
          >
            ⚠
          </div>

          <h1 style={{ margin: "0 0 0.75rem", fontSize: "1.25rem", fontWeight: 800 }}>
            تعثّرت المنصّة
          </h1>
          <p style={{ margin: "0 0 1.5rem", fontSize: "0.85rem", lineHeight: 1.9, color: "#6b7280" }}>
            عطبٌ في العرض، وبياناتُك سليمةٌ لم يمسسها شيء. أعِد المحاولة، فإن
            تكرّر فأبلِغ بالرمز أدناه.
          </p>

          <button
            type="button"
            onClick={reset}
            style={{
              border: "none",
              borderRadius: "1rem",
              background: "#2c456a",
              color: "#fff",
              padding: "0.7rem 1.6rem",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            إعادة المحاولة
          </button>

          {error.digest && (
            <p
              dir="ltr"
              style={{ margin: "1rem 0 0", fontFamily: "monospace", fontSize: "0.7rem", color: "#9ca3af" }}
            >
              {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
