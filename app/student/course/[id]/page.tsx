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
import { CourseArt } from "@/components/brand/course-art";
import { PageHeader, Card } from "@/components/dashboard/ui";
import { useContent } from "@/components/content/content-provider";
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

  /*
    البابُ يُفتح والفيديو يُقفل.
    ------------------------------------------------------------------
    كان من لا يملك الكورس يُردّ عند الباب بلوحٍ يقول «غير مُفعّل» — فلا
    يرى ما فيه أصلاً. وهو يُسأل أن يدفع لشيءٍ لم يُرِه أحدٌ له: كم مادّةً
    فيه؟ وكم درساً؟ وما عناوينُها؟ لا جواب.

    فصار يدخل فيرى المنهجَ كلَّه — الموادَّ وعناوينَ الدروس ومُددَها —
    **والمشغّلُ وحدَه مقفول**: `owned` يبقى `false` فيُظهر `UnitView`
    لوحَ الشراء مكانَ الفيديو. فيعرف ما يشتري قبل أن يشتريه، وهذا أدعى
    للشراء من بابٍ موصد.

    ولا يُفتح شيءٌ من المحتوى بهذا: الرابطُ لا يخرج والفيديو لا يعمل —
    العناوينُ وحدَها، وهي في صفحة الكورس العامّة أصلاً.
  */
  const locked = !owned && !perUnit && !ownsAnyUnit(me, id);

  const buyBanner = locked ? (
    <Card className="mb-5 flex flex-wrap items-center justify-between gap-3 border-primary/30">
      <div className="min-w-0">
        <p className="font-display text-base font-extrabold">هذا الكورس غير مُفعّل</p>
        <p className="mt-1 text-sm text-muted-foreground">
          تتصفّح المنهجَ ومحتوياته — و{fem ? "لمشاهدتِك" : "لمشاهدة"} الدروس {fem ? "فعّلي" : "فعّل"} الكورس بكود التفعيل.
        </p>
      </div>
      <Link
        href={`/student/pay?subject=${subject.id}`}
        className="shrink-0 rounded-full btn-glow px-6 py-2.5 text-sm font-bold text-white"
      >
        خيارات الاشتراك
      </Link>
    </Card>
  ) : null;

  const header = (
    <>
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
    return <>{header}{buyBanner}<NotFound msg="لم تُضَف دروس لهذا الكورس بعد." /></>;
  }

  /* كورسٌ لم يُقسَّم — لا لوحَ وسيطاً بلا فائدة */
  if (units.length === 1) {
    return (
      <>
        {header}
        {buyBanner}
        <UnitView course={subject} unit={units[0]} owned={owned} backHref="/student/subjects" backLabel="كل الكورسات" />
      </>
    );
  }

  return (
    <>
      {header}
      {buyBanner}

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
                className="uc"
              >
                {/*
                  غلافُ الكورس على رأس كلّ مادّة.
                  ------------------------------------------------------------
                  كانت البطاقةُ نصّاً على ورقٍ أبيض: رقمٌ وعنوانٌ وسطرُ
                  عدادٍ وشريطٌ — ولا شيءَ يُميّز مادّةً من أختها إلّا حرفٌ في
                  العنوان. فالبصرُ لا يجد ما يمسك به، ويقرأ البطاقاتِ كلَّها
                  ليعرف أيَّها يريد.

                  والغلافُ يُرسم بـ`CourseArt` نفسِها التي تُرسم بها بطاقةُ
                  الكورس — لا نسخةً ثانيةً منها: فما ضبطه المشرفُ من قصٍّ
                  وإزاحةٍ ولونٍ وزخرفةٍ ونصٍّ وملصقات يظهر هنا كما يظهر هناك،
                  ولا يفترق الغلافُ باختلاف الشاشة التي يُعرض فيها.

                  والرقمُ والحالةُ يُلصقان فوقه: الرقمُ في ركنٍ والقفلُ في
                  المقابل — فيُقرآن قبل النصّ.
                */}
                <span className="uc-art">
                  <CourseArt
                    seed={`${subject.id}-${u.id}`}
                    title={u.title}
                    cover={subject.cover}
                    coverFit={subject.coverFit}
                    coverRatio={subject.coverRatio}
                    coverColor={subject.coverColor}
                    coverPattern={subject.coverPattern}
                    coverText={subject.coverText}
                    coverStickers={subject.coverStickers}
                    locked={!mine && freeCount === 0}
                    className="uc-art-i"
                  />

                  {/*
                    شارةٌ واحدةٌ تقول الحالة — والغلافُ يبقى مكشوفاً.
                    كان العنوانُ يُكتب فوق الغلاف تحت ظلٍّ داكن، فيحجب
                    ثلثَه ويُخفي ما رُسم فيه. والغلافُ صورةُ الكورس التي
                    ضبطها المشرفُ بيده — تُرى كاملةً أو لا تُوضع.
                  */}
                  <span className={`uc-tag ${!mine ? "is-lock" : pct === 100 ? "is-done" : "is-in"}`}>
                    {!mine ? <><IconLock className="size-3" /> مقفلة</>
                      : pct === 100 ? <><IconCheckCircle className="size-3" /> اكتملت</>
                        : "مسجَّل"}
                  </span>
                </span>

                <span className="uc-body">
                  {/* سطرُ الصفّ فوق العنوان — يُعرف لمن الكورسُ قبل ما فيه */}
                  <span className="uc-g">{subject.grade}</span>
                  <span className="uc-t">{u.title}</span>
                  {u.desc && <span className="uc-d">{u.desc}</span>}

                  <span className="uc-meta">
                    <span className="uc-meta-i">
                      <IconPlay className="size-3.5" /> {inUnit.length.toLocaleString("ar-EG")} درساً
                    </span>
                    {doneHere > 0 && (
                      <span className="uc-meta-i is-done">
                        <IconCheckCircle className="size-3.5" /> {doneHere.toLocaleString("ar-EG")} تمّت
                      </span>
                    )}
                    {mine && freeCount > 0 && (
                      <span className="uc-meta-i is-free">
                        <IconGift className="size-3.5" /> {freeCount.toLocaleString("ar-EG")} مجاناً
                      </span>
                    )}
                  </span>

                  {/*
                    المقفلةُ تعرض سعرَها لا تقدّمَها: التقدّمُ صفرٌ دائماً في
                    مادّةٍ لم تُشترَ، وشريطٌ فارغٌ لا يقول شيئاً. والسعرُ يقول
                    ما يلزم لفتحها.
                  */}
                  {!mine ? (
                    <span className="uc-foot">
                      {cheapest ? (
                        <>
                          <span className="uc-price">
                            {planPrice({ price: cheapest.price, discount: cheapest.discount }).price.toLocaleString("ar-EG")}
                            <b className="uc-price-c">ج.م</b>
                          </span>
                          <span className="uc-cta is-buy">
                            <IconCart className="size-3.5" /> اشترِ المادّة
                          </span>
                        </>
                      ) : (
                        <span className="uc-note">تُفتح باشتراك الكورس</span>
                      )}
                    </span>
                  ) : (
                    <>
                      {/* الشريطُ بعرض البطاقة ثمّ سطرُ النسبة والمتابعة */}
                      <span className="uc-bar">
                        <span className="uc-bar-i" style={{ inlineSize: `${pct}%` }} />
                      </span>
                      <span className="uc-foot is-prog">
                        <span className="uc-pct">{pct.toLocaleString("ar-EG")}٪</span>
                        <span className="uc-cta">
                          {pct === 0 ? "ابدأ" : pct === 100 ? "راجِع" : "متابعة"}
                          <IconArrowLeft className="size-3.5" />
                        </span>
                      </span>
                    </>
                  )}
                </span>
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
