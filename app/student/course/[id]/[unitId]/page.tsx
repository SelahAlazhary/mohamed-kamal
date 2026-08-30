"use client";

/**
 * صفحةُ المادّة — دروسُها مساراً.
 * ------------------------------------------------------------------
 * المرحلةُ الثالثة من الطريق: **الكورس ← المادّة ← دروسُها**. وما فوقها
 * يُعرض في `../page.tsx`، والعرضُ نفسُه في `components/student/unit-view`
 * ليكون واحداً هنا وفي الكورس غير المقسَّم — فلا يختلف الشكلُ باختلاف
 * الطريق إليه.
 *
 * والصفحةُ تُظهر مسارَ هذه المادّة وحدَها: من دخلها لا يرى دروسَ غيرها،
 * وهذا هو المقصودُ من فصل المواد عن الدروس.
 */

import { use } from "react";
import Link from "next/link";
import { IconArrowLeft, IconCheckCircle } from "@/components/brand/icons";
import { EmptyLock } from "@/components/brand/illustrations";
import { PageHeader, Card } from "@/components/dashboard/ui";
import { useContent } from "@/components/content/content-provider";
import { CaptureGuard } from "@/components/student/capture-guard";
import { UnitView } from "@/components/student/unit-view";
import { subjectActive, subscriptionFor, daysLeft } from "@/lib/access";
import { courseUnits } from "@/lib/course-units";

export default function UnitPage({ params }: { params: Promise<{ id: string; unitId: string }> }) {
  const { id, unitId } = use(params);
  const { db, session, content } = useContent();
  const me = db?.users.find((u) => u.id === session?.uid);
  const subject = db?.subjects.find((s) => s.id === id);
  const owned = subjectActive(me, subject);
  const fem = me?.gender === "female";

  const units = subject ? courseUnits(subject) : [];
  const wanted = decodeURIComponent(unitId);
  const unit = units.find((u) => u.id === wanted);
  const order = units.findIndex((u) => u.id === wanted);

  const sub = subscriptionFor(me, id);
  const left = daysLeft(sub?.expiresAt);
  const back = `/student/course/${id}`;

  if (!subject) return <NotFound msg="الكورس غير موجود." href="/student/subjects" label="كل الكورسات" />;

  if (!owned) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <EmptyLock className="mx-auto mb-2 text-primary" width={176} />
        <h2 className="font-display text-xl font-extrabold">هذا الكورس غير مُفعّل</h2>
        <p className="mt-2 text-sm text-muted-foreground">{fem ? "فعّلي" : "فعّل"} الكورس بكود التفعيل لمشاهدة الدروس.</p>
        <Link href="/student/subjects" className="mt-5 inline-flex rounded-full btn-glow px-6 py-2.5 text-sm font-bold text-white">{fem ? "اذهبي للتفعيل" : "اذهب للتفعيل"}</Link>
      </Card>
    );
  }

  /* مادّةٌ حُذفت أو رابطٌ قديم — يُردّ إلى موادّ الكورس لا إلى شاشةِ خطأ */
  if (!unit) return <NotFound msg="هذه المادّة لم تعد موجودة في الكورس." href={back} label="موادّ الكورس" />;

  return (
    <>
      <CaptureGuard enabled={Boolean(content.blockCapture)} />
      <Link href={back} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-primary">
        <IconArrowLeft className="size-4 rotate-180" /> موادّ {subject.name}
      </Link>
      <PageHeader
        title={unit.title}
        subtitle={`المادّة ${(order + 1).toLocaleString("ar-EG")} من ${units.length.toLocaleString("ar-EG")} · ${(unit.lessons ?? []).length.toLocaleString("ar-EG")} درساً`}
        action={
          sub ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-500">
              <IconCheckCircle className="size-4" />
              {sub.planName ?? (sub.subjectId === "*" ? "الترم الكامل" : "اشتراك الكورس")}
              {left !== null && <span className="text-muted-foreground">· متبقٍ {left.toLocaleString("ar-EG")} يوم</span>}
            </span>
          ) : undefined
        }
      />

      <UnitView course={subject} unit={unit} owned={owned} backHref={back} backLabel="موادّ الكورس" />
    </>
  );
}

function NotFound({ msg, href, label }: { msg: string; href: string; label: string }) {
  return (
    <Card className="mx-auto max-w-md text-center">
      <p className="py-6 text-sm text-muted-foreground">{msg}</p>
      <Link href={href} className="inline-flex rounded-full border border-border px-5 py-2 text-sm font-bold transition hover:border-primary hover:text-primary">{label}</Link>
    </Card>
  );
}
