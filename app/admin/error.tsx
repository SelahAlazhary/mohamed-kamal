"use client";

/**
 * صفحةُ الخطأ في اللوحة.
 * ------------------------------------------------------------------
 * لم يكن في المشروع حدُّ خطأٍ واحد، فكلُّ عطبٍ في رسم صفحةٍ يُخرج شاشةَ
 * Next الخام: «تعذّر تحميل هذه الصفحة» بالإنجليزية، بلا سبب، وبلا مخرج
 * إلّا إعادةَ التحميل يدويّاً. والأستاذُ يقرؤها فيظنّ المنصّةَ سقطت.
 *
 * فصار العطبُ يُخرج لوحاً عربيّاً يقول ثلاثةَ أشياء: أنّ **بياناتِه سليمة**
 * — والعطبُ في العرض لا في الحفظ — وأنّ له مخرجين: إعادةُ المحاولة في
 * موضعه، أو العودةُ إلى اللوحة. و`digest` يُعرض لأنّه المفتاحُ الذي
 * يُطابَق به سجلُّ الخادم حين يُبلَّغ عن العطب.
 *
 * وهذا الحدُّ يشمل شجرةَ `/admin` كلَّها ولا يشمل قالبَها — عطبُ القالب
 * يلتقطه `app/global-error.tsx`.
 */

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, LayoutDashboard } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[لوحة الإدارة]", error);
  }, [error]);

  return (
    <div className="grid min-h-[60vh] place-items-center px-4 py-10">
      <div className="glass w-full max-w-lg rounded-3xl border border-rose-500/30 p-7 text-center shadow-bento">
        <span className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-rose-500/12 text-rose-500">
          <AlertTriangle className="size-7" />
        </span>

        <h1 className="font-display mb-2 text-xl font-extrabold">تعثّر عرضُ هذه الصفحة</h1>

        <p className="mb-1 text-[13px] leading-relaxed text-muted-foreground">
          العطبُ في عرضِ الصفحة لا في بياناتك — <strong className="text-foreground">لم يُفقد شيءٌ ممّا حفظتَه</strong>.
        </p>
        <p className="mb-5 text-[13px] leading-relaxed text-muted-foreground">
          أعِد المحاولة، فإن تكرّر الخطأُ فارجع إلى اللوحة وأبلِغ بالرمز أدناه.
        </p>

        <div className="mb-5 flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={reset}
            className="btn-glow inline-flex items-center gap-1.5 rounded-2xl px-5 py-2.5 text-[13px] font-bold text-white"
          >
            <RotateCcw className="size-4" />
            إعادة المحاولة
          </button>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-2xl border border-border px-5 py-2.5 text-[13px] font-bold transition hover:border-primary/50 hover:text-primary"
          >
            <LayoutDashboard className="size-4" />
            العودة إلى اللوحة
          </Link>
        </div>

        {error.digest && (
          <p dir="ltr" className="mb-3 font-mono text-[11px] text-muted-foreground">
            {error.digest}
          </p>
        )}

        <details className="text-right">
          <summary className="cursor-pointer text-[11px] font-semibold text-muted-foreground">
            التفاصيل التقنية
          </summary>
          <pre
            dir="ltr"
            className="mt-2 max-h-44 overflow-auto rounded-xl bg-foreground/[0.04] p-3 text-left text-[10px] leading-relaxed"
          >
            {error.message}
          </pre>
        </details>
      </div>
    </div>
  );
}
