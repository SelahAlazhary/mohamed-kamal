"use client";

/**
 * صفحةُ الكورس — موادُّه لا دروسُه.
 * ------------------------------------------------------------------
 * كانت هذه الشاشةُ تفتح على مشغّلٍ وقائمةِ دروسٍ فيها الموادُّ ألواحاً
 * مطويّة. فالمادّةُ والدرسُ في قسمٍ واحد: من أراد مادّةً بعينها فتح لوحَها
 * ومرّ على دروس ما قبلها، ومن أراد أن يرى ما في الكورس من موادَّ لم يرَ
 * إلّا عناوينَ مطويّةً بين الدروس.
 *
 * فصارت ثلاثَ مراحل — **الكورس ← المادّة ← دروسُها** — وهذه أُولاها:
 * الموادُّ ألواحاً مستقلّة، في كلٍّ عددُ دروسها وما أنجزتَ منها.
 *
 * **ويُستثنى الكورسُ غيرُ المقسَّم.** كورسٌ لم يُقسَّم إلى موادَّ بعدُ له
 * مادّةٌ واحدةٌ ملفوفة، ولوحٌ واحدٌ يُضغط ليُفتح على دروسه ضغطةٌ لا تُفيد
 * شيئاً. فتُعرض دروسُه هنا مباشرةً — والمراحلُ ثلاثٌ حيث تُفيد، لا حيث
 * تُتكلَّف.
 */

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { IconArrowLeft, IconCheckCircle, IconListVideo, IconGift, IconPlay } from "@/components/brand/icons";
import { EmptyLock } from "@/components/brand/illustrations";
import { PageHeader, Card } from "@/components/dashboard/ui";
import { useContent } from "@/components/content/content-provider";
import { CaptureGuard } from "@/components/student/capture-guard";
import { UnitView, useDone } from "@/components/student/unit-view";
import { subjectActive, subscriptionFor, daysLeft, unitActive, ownsAnyUnit } from "@/lib/access";
import { IconLock, IconCart } from "@/components/brand/icons";
import { planPrice } from "@/lib/plans";
import { allLessons, courseUnits } from "@/lib/course-units";

export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { db, session, content } = useContent();
  const me = db?.users.find((u) => u.id === session?.uid);
  const subject = db?.subjects.find((s) => s.id === id);
  const owned = subjectActive(me, subject);
  const fem = me?.gender === "female";

  const units = subject ? courseUnits(subject) : [];
  const lessons = subject ? allLessons(subject) : [];
  const { done } = useDone(id, session?.uid);

  const sub = subscriptionFor(me, id);
  const left = daysLeft(sub?.expiresAt);

  if (!subject) return <NotFound msg="الكورس غير موجود." />;

  /*
    من لا يملك الكورسَ يُردّ — إلّا أن يبيع الكورسُ موادَّه مفرَّقة.
    عندئذٍ تُفتح له الموادُّ ليرى ما فيها ويشتري ما يحتاج، وكلُّ مادّةٍ
    مقفلةٌ حتّى تُشترى. وردُّه هنا يجعل البيعَ المفرَّقَ لا معنى له: لا
    يرى ما يشتري.
  */
  /*
    و«الموادّ» لا تعني شيئاً في كورسٍ لم يُقسَّم.
    الكورسُ غيرُ المقسَّم له مادّةٌ واحدةٌ ملفوفةٌ اسمُها «دروس الكورس» —
    وفتحُها للطالب ليشتريها هو فتحُ الكورس كلِّه بثوبٍ آخر. فيُساق إلى
    بوّابة الدفع كما لو كان الوضعُ الأوّل، ولا يُترك في شاشةٍ بلا معنى.
  */
  const perUnit = (subject.entryMode ?? "gateway") === "materials" && units.length > 1;
  if (!owned && !perUnit && !ownsAnyUnit(me, id)) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <EmptyLock className="mx-auto mb-2 text-primary" width={176} />
        <h2 className="font-display text-xl font-extrabold">هذا الكورس غير مُفعّل</h2>
        <p className="mt-2 text-sm text-muted-foreground">{fem ? "فعّلي" : "فعّل"} الكورس بكود التفعيل لمشاهدة الدروس.</p>
        <Link href={`/student/pay?subject=${subject.id}`} className="mt-5 inline-flex rounded-full btn-glow px-6 py-2.5 text-sm font-bold text-white">خيارات الاشتراك</Link>
      </Card>
    );
  }

  const header = (
    <>
      <CaptureGuard enabled={Boolean(content.blockCapture)} />
      <Link href="/student/subjects" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-primary">
        <IconArrowLeft className="size-4 rotate-180" /> كل الكورسات
      </Link>
      <PageHeader
        title={subject.name}
        subtitle={`${subject.teacher} · ${units.length > 1 ? `${units.length.toLocaleString("ar-EG")} مادّة · ` : ""}${lessons.length.toLocaleString("ar-EG")} درساً`}
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
    </>
  );

  if (lessons.length === 0) {
    return <>{header}<NotFound msg="لم تُضَف دروس لهذا الكورس بعد." /></>;
  }

  /* كورسٌ لم يُقسَّم — لا لوحَ وسيطاً بلا فائدة */
  if (units.length === 1) {
    return (
      <>
        {header}
        <UnitView course={subject} unit={units[0]} owned={owned} backHref="/student/subjects" backLabel="كل الكورسات" />
      </>
    );
  }

  return (
    <>
      {header}

      <p className="mb-4 flex items-center gap-2 font-display font-extrabold">
        <IconListVideo className="size-5 text-primary" /> موادّ الكورس
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {units.map((u, i) => {
          const inUnit = u.lessons ?? [];
          const doneHere = inUnit.filter((l) => done.has(l.id)).length;
          const pct = inUnit.length ? Math.round((doneHere / inUnit.length) * 100) : 0;
          const freeCount = inUnit.filter((l) => l.isFree).length;
          /*
            المادّةُ مفتوحةٌ باشتراك الكورس أو باشتراكها هي.
            و«المقفلة» تُعرض ولا تُخفى: الطالبُ يرى ما في المنهج ويعرف ما
            يشتري — وإخفاؤها يجعله يشتري ما لا يعرف.
          */
          const mine = unitActive(me, id, u.id, Date.now(), subject.term);
          const priced = (u.prices ?? []).filter((p) => (p.label ?? "").trim());
          const cheapest = priced.length
            ? priced.reduce((a, b) => (planPrice({ price: a.price, discount: a.discount }).price
                <= planPrice({ price: b.price, discount: b.discount }).price ? a : b))
            : null;

          return (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {/*
                المقفلةُ التي لا درسَ مجّانيَّ فيها تذهب إلى شرائها مباشرةً:
                فتحُها على مسارٍ كلُّه أقفالٌ ضغطةٌ ضائعة. وما فيه درسٌ
                مجّانيٌّ يُفتح ليُجرَّب قبل الشراء.
              */}
              <Link
                href={
                  mine || freeCount > 0
                    ? `/student/course/${id}/${encodeURIComponent(u.id)}`
                    : `/student/pay?subject=${id}&unit=${encodeURIComponent(u.id)}`
                }
                className="block h-full"
              >
                <Card className="group flex h-full flex-col !p-4 transition hover:border-primary/40">
                  <div className="flex items-start gap-3">
                    {/*
                      رقمُ المادّة في ترتيب الكورس — لا معرّفُها.
                      المنهجُ يُدرَّس مرتَّباً، والرقمُ يقول أين تقع المادّةُ
                      منه قبل أن يُقرأ عنوانُها.
                    */}
                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[hsl(var(--gold)/0.18)] text-sm font-extrabold text-primary">
                      {(i + 1).toLocaleString("ar-EG")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-display truncate text-base font-extrabold">{u.title}</p>
                      {u.desc && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{u.desc}</p>}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><IconPlay className="size-3" /> {inUnit.length.toLocaleString("ar-EG")} درساً</span>
                    {freeCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-emerald-500">
                        <IconGift className="size-3" /> {freeCount.toLocaleString("ar-EG")} مجاناً
                      </span>
                    )}
                    {doneHere > 0 && (
                      <span className="inline-flex items-center gap-1 text-emerald-500">
                        <IconCheckCircle className="size-3" /> {doneHere.toLocaleString("ar-EG")} تمّت
                      </span>
                    )}
                  </div>

                  {/*
                    المقفلةُ تعرض سعرَها لا تقدّمَها: التقدّمُ صفرٌ دائماً في
                    مادّةٍ لم تُشترَ، وشريطٌ فارغٌ لا يقول شيئاً. والسعرُ يقول
                    ما يلزم لفتحها.
                  */}
                  {!mine ? (
                    <div className="mt-auto flex items-center gap-2 pt-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
                        <IconLock className="size-3" /> مقفلة
                      </span>
                      {cheapest ? (
                        <span className="ms-auto inline-flex items-center gap-1.5 rounded-full btn-glow px-3 py-1.5 text-[11px] font-bold text-white">
                          <IconCart className="size-3" />
                          {planPrice({ price: cheapest.price, discount: cheapest.discount }).price.toLocaleString("ar-EG")} ج.م
                        </span>
                      ) : (
                        <span className="ms-auto text-[10px] text-muted-foreground">تُفتح باشتراك الكورس</span>
                      )}
                    </div>
                  ) : (
                  <div className="mt-auto pt-4">
                    <div className="mb-1 flex items-center justify-between text-[11px] font-bold">
                      <span className="text-muted-foreground">التقدّم</span>
                      <span className="text-primary">{pct.toLocaleString("ar-EG")}٪</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[hsl(var(--gold)/0.22)]">
                      <span
                        className="block h-full rounded-full transition-[width] duration-700"
                        style={{ width: `${pct}%`, background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--gold)))" }}
                      />
                    </div>
                  </div>
                  )}
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}

function NotFound({ msg }: { msg: string }) {
  return (
    <Card className="mx-auto max-w-md text-center">
      <p className="py-6 text-sm text-muted-foreground">{msg}</p>
      <Link href="/student/subjects" className="inline-flex rounded-full border border-border px-5 py-2 text-sm font-bold transition hover:border-primary hover:text-primary">كل الكورسات</Link>
    </Card>
  );
}
