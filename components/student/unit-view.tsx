"use client";

/**
 * عرضُ المادّة — مشغّلٌ ومسارُ دروس.
 * ------------------------------------------------------------------
 * كان الكورسُ شاشةً واحدة: المشغّلُ يميناً، وإلى جانبه لوحٌ فيه الوحداتُ
 * ألواحاً مطويّةً وداخلَ كلٍّ منها دروسُها. فالمادّةُ والدرسُ في قسمٍ
 * واحد، ومن أراد مادّةً فتح لوحَها ثمّ مرّ على دروس ما قبلها.
 *
 * فصار الطريقُ ثلاثَ مراحل: **الكورس ← المادّة ← دروسُها**. وهذا الملفُّ
 * هو المرحلةُ الثالثة.
 *
 * **والدروسُ مسارٌ لا قائمة.** القائمةُ تقول «هذه دروسٌ»، والمسارُ يقول
 * «هذا طريقُك وأين أنت منه»: عمودٌ يصل النقاطَ، يمتلئ بلونٍ إلى حيث
 * وصلتَ ويبهت بعده. فالتقدّمُ يُرى في شكل الشيء نفسِه لا في رقمٍ فوقه.
 *
 * **والنقطةُ تحمل حالتَها**: تمّت · جاريةٌ الآن · مفتوحةٌ · مقفلة. أربعُ
 * حالاتٍ تُميَّز باللون والرمز معاً لا باللون وحدَه — فمن لا يميّز
 * الألوانَ يقرؤها.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  IconPlay, IconCheckCircle, IconLock, IconGift, IconFile, IconDownload,
  IconListChecks, IconXCircle, IconRotate, IconSpinner, IconTrophy,
} from "@/components/brand/icons";
import { Card } from "@/components/dashboard/ui";
import { useContent } from "@/components/content/content-provider";
import { allLessons } from "@/lib/course-units";
import type { Lesson, Material, Subject, Unit } from "@/lib/types";
import { setPref } from "@/lib/consent";

/** تحويل رابط الفيديو إلى صيغة تضمين (YouTube / Vimeo / Bunny Stream / mp4). */
export function toEmbed(url: string): { kind: "video" | "iframe"; src: string; drive?: boolean } {
  const u = url.trim();
  // Bunny Stream (iframe.mediadelivery.net) — نحوّل /play/ إلى /embed/
  if (u.includes("mediadelivery.net")) {
    return { kind: "iframe", src: u.replace("/play/", "/embed/") };
  }
  // Google Drive: أي صيغة رابط → صفحة المعاينة القابلة للتضمين
  const drive = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{20,})/) ||
    u.match(/lh3\.googleusercontent\.com\/d\/([\w-]{20,})/);
  /* rm=minimal يقلّل عناصر مشغّل درايف، لكنه لا يزيل زرّ «فتح في نافذة
     جديدة» — ذاك يُحجب بطبقة فوق ركنه. */
  if (drive) return { kind: "iframe", src: `https://drive.google.com/file/d/${drive[1]}/preview?rm=minimal`, drive: true };
  // معرّف Bunny بصيغة "libraryId/videoGuid"
  const bunny = u.match(/^(\d{3,7})\/([0-9a-f-]{20,})$/i);
  if (bunny) return { kind: "iframe", src: `https://iframe.mediadelivery.net/embed/${bunny[1]}/${bunny[2]}` };
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(u)) return { kind: "video", src: u };
  const yt = u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);
  if (yt) return { kind: "iframe", src: `https://www.youtube.com/embed/${yt[1]}` };
  const vm = u.match(/vimeo\.com\/(\d+)/);
  if (vm) return { kind: "iframe", src: `https://player.vimeo.com/video/${vm[1]}` };
  return { kind: "iframe", src: u };
}

/**
 * الدروسُ المنجَزة — تُقرأ من الجهاز وتُكتب إليه، وتُرسَل نسبتُها للخادم.
 * ------------------------------------------------------------------
 * والنسبةُ المرسَلةُ **من دروس الكورس كلِّها** لا من دروس المادّة: تقدّمُ
 * الطالب في الكورس واحدٌ، ولو حُسب لكلّ مادّةٍ على حدةٍ لبلغ مئةً بمادّةٍ
 * من عشر.
 */
export function useDone(courseId: string, uid?: string) {
  const storeKey = `emz_done_${uid}_${courseId}`;
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storeKey);
      if (raw) setDone(new Set(JSON.parse(raw)));
    } catch { /* تجاهل */ }
  }, [storeKey]);

  const mark = async (lessonId: string, totalInCourse: number, refresh: () => Promise<void> | void) => {
    const next = new Set(done);
    next.add(lessonId);
    setDone(next);
    /*
      علامةُ المشاهدة تُحفظ في الجهاز بإذن، وتُرسَل نسبتُها للخادم دائماً:
      التقدّمُ سجلُّ الطالب لا تفضيلٌ يُنسى، فمن منع الحفظَ المحلّيَّ يبقى
      تقدّمُه محفوظاً في حسابه.
    */
    setPref(storeKey, JSON.stringify([...next]));
    const pct = totalInCourse ? Math.round((next.size / totalInCourse) * 100) : 0;
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectId: courseId, value: pct }),
    });
    await refresh();
  };

  return { done, mark };
}

/* ---------- المسار ---------- */

type NodeState = "done" | "current" | "open" | "locked";

function PathNode({
  n, title, duration, state, isFree, onPick, last,
}: {
  n: number;
  title: string;
  duration?: string;
  state: NodeState;
  isFree?: boolean;
  onPick: () => void;
  last: boolean;
}) {
  /*
    العمودُ يُرسم في العنصر لا بين العناصر.
    خطٌّ مستقلٌّ بينها يحتاج قياسَ ارتفاعِ كلّ بطاقةٍ ليصلها — وهو يتغيّر
    بطول العنوان. وجعلُه في العنصر نفسِه يجعله يمتدّ بامتداده مهما طال.
  */
  const ring =
    state === "done" ? "bg-emerald-500 text-white ring-emerald-500/30"
      : state === "current" ? "btn-glow text-white ring-[hsl(var(--gold)/0.45)]"
        : state === "locked" ? "bg-muted text-muted-foreground ring-border"
          : "bg-[hsl(var(--gold)/0.18)] text-primary ring-[hsl(var(--gold)/0.35)]";

  return (
    <li className="relative flex gap-4 pb-3 last:pb-0">
      {/* العمود — يبهت بعد ما وصلتَ إليه */}
      {!last && (
        <span
          aria-hidden="true"
          className={`absolute top-11 h-[calc(100%-2.75rem)] w-0.5 rounded-full ${
            state === "done" ? "bg-emerald-500/60" : "bg-border"
          }`}
          style={{ insetInlineStart: "1.375rem" }}
        />
      )}

      <button
        onClick={onPick}
        disabled={state === "locked"}
        className={`grid size-11 shrink-0 place-items-center rounded-full text-sm font-extrabold ring-4 transition ${ring} ${
          state === "locked" ? "cursor-not-allowed" : "hover:scale-105"
        }`}
        aria-label={title}
      >
        {state === "done" ? <IconCheckCircle className="size-5" />
          : state === "locked" ? <IconLock className="size-4" />
            : n.toLocaleString("ar-EG")}
      </button>

      <button
        onClick={onPick}
        disabled={state === "locked"}
        className={`min-w-0 flex-1 rounded-2xl border p-3 text-right transition ${
          state === "current"
            ? "border-[hsl(var(--gold)/0.55)] bg-[hsl(var(--gold)/0.08)]"
            : state === "locked"
              ? "cursor-not-allowed border-border/60 opacity-70"
              : "border-border hover:border-primary/40"
        }`}
      >
        <span className="flex items-center gap-2">
          <span className="min-w-0 flex-1 truncate text-sm font-bold">{title}</span>
          {isFree && <IconGift className="size-3.5 shrink-0 text-emerald-500" />}
          {state !== "locked" && <IconPlay className={`size-4 shrink-0 ${state === "current" ? "text-primary" : "text-muted-foreground"}`} />}
        </span>
        <span className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
          {duration && <span>{duration}</span>}
          {state === "done" && <span className="text-emerald-500">تمّت المشاهدة</span>}
          {state === "current" && <span className="font-bold text-[hsl(var(--gold))]">الدرس الحالي</span>}
          {state === "locked" && <span>يُفتح بالاشتراك</span>}
        </span>
      </button>
    </li>
  );
}

/* ---------- العرض ---------- */

export function UnitView({
  course, unit, owned, backHref, backLabel,
}: {
  course: Subject;
  unit: Unit;
  owned: boolean;
  backHref: string;
  backLabel: string;
}) {
  const { db, session, refresh } = useContent();
  const me = db?.users.find((u) => u.id === session?.uid);
  const fem = me?.gender === "female";

  const lessons = unit.lessons ?? [];
  const courseTotal = allLessons(course).length;
  const { done, mark } = useDone(course.id, session?.uid);

  const [idx, setIdx] = useState(0);
  const current: Lesson | undefined = lessons[idx];
  const embed = useMemo(() => (current ? toEmbed(current.url) : null), [current]);

  const canPlay = (isFree?: boolean) => Boolean(isFree) || owned;
  const doneHere = lessons.filter((l) => done.has(l.id)).length;
  const percent = lessons.length ? Math.round((doneHere / lessons.length) * 100) : 0;

  /* هل تُباع هذه المادّةُ وحدَها؟ — بها يُقصد الشراءُ إلى موضعه */
  const sellsUnit = (unit.prices ?? []).some((p) => (p.label ?? "").trim());

  /*
    ملفّاتُ الدرس ثمّ المادّة ثمّ الكورس — من الأخصّ إلى الأعمّ.
    والترتيبُ مقصود: مذكّرةُ هذا الدرس أوّلُ ما يُطلب وهو يشاهده، وملزمةُ
    الكورس آخرُ ما يُطلب. وعرضُها بالعكس يجعله يمرّ على ما لا يخصّه.

    وتُضاف ولا تُلغي: كلُّ مستوى يزيد ولا يحجب ما فوقه.
  */
  const files: Material[] = [
    ...(current?.materials ?? []),
    ...(unit.materials ?? []),
    ...(course.materials ?? []),
  ];

  if (lessons.length === 0) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <p className="py-6 text-sm text-muted-foreground">لم تُضَف دروس لهذه المادّة بعد.</p>
        <Link href={backHref} className="inline-flex rounded-full border border-border px-5 py-2 text-sm font-bold transition hover:border-primary hover:text-primary">{backLabel}</Link>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.7fr_1fr]">
      {/* المشغّل */}
      <div>
        <div className="relative -mx-4 aspect-video overflow-hidden border-y border-border bg-black shadow-bento sm:mx-0 sm:rounded-3xl sm:border">
          {!current ? null : !canPlay(current.isFree) ? (
            <div className="grid size-full place-items-center bg-slate-900 p-6 text-center">
              <div className="flex flex-col items-center gap-3">
                <span className="grid size-14 place-items-center rounded-2xl bg-white/10 text-white"><IconLock className="size-7" /></span>
                <p className="font-display text-lg font-extrabold text-white">هذا الكورس غير مُفعّل</p>
                {/*
                  والشراءُ يقصد ما يُشاهَد.
                  كان يُساق إلى شراء الكورس كلِّه وهو واقفٌ على درسٍ في
                  مادّةٍ بعينها — فيُعرض عليه المنهجُ كلُّه وهو يطلب باباً
                  منه. فإن كانت المادّةُ تُباع وحدَها، قُصد شراؤها هي.
                */}
                <p className="max-w-xs text-sm text-white/70">
                  {sellsUnit
                    ? `افتح «${unit.title}» وحدَها، أو خُذ الكورس كلَّه.`
                    : "اشترك شهرياً في هذا الكورس أو خُذ الترم الكامل لمشاهدة كل الدروس."}
                </p>
                <Link
                  href={sellsUnit
                    ? `/student/pay?subject=${course.id}&unit=${encodeURIComponent(unit.id)}`
                    : `/student/pay?subject=${course.id}`}
                  className="rounded-full btn-glow px-5 py-2 text-xs font-bold text-white"
                >
                  {sellsUnit ? "خيارات شراء المادّة" : "خيارات الاشتراك"}
                </Link>
              </div>
            </div>
          ) : embed?.kind === "video" ? (
            <video key={current.id} src={embed.src} controls className="size-full" />
          ) : (
            <>
              <iframe key={current.id} src={embed?.src} title={current.title} allowFullScreen
                allow="accelerometer; autoplay; encrypted-media; picture-in-picture" className="size-full" />
              {/* مشغّل درايف يعرض زرّ «فتح في نافذة جديدة» يكشف الرابط
                  ويتجاوز الاشتراك — وطبقةٌ فوق ركنه تبتلع الضغط. */}
              {embed?.drive && (
                <span aria-hidden="true" className="absolute right-0 top-0 z-10 h-14 w-24 cursor-default"
                  onContextMenu={(e) => e.preventDefault()} />
              )}
            </>
          )}
        </div>

        {current && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-kufi mb-0.5 text-[11px] font-bold text-[hsl(var(--gold))]">{unit.title}</p>
              <h3 className="font-display text-lg font-extrabold">{current.title}</h3>
              {current.duration && <p className="text-xs text-muted-foreground">{current.duration}</p>}
            </div>
            <button
              onClick={() => mark(current.id, courseTotal, refresh)}
              disabled={done.has(current.id)}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition ${
                done.has(current.id) ? "border border-emerald-500/40 text-emerald-500" : "btn-glow text-white"
              }`}
            >
              <IconCheckCircle className="size-4" /> {done.has(current.id) ? "تمّت المشاهدة" : "وضع علامة مكتمل"}
            </button>
          </div>
        )}

        {/* الاختبار التفاعلي على الفيديو (إن فعّله الأدمن) */}
        {current && canPlay(current.isFree) && current.quiz?.enabled && current.quiz.questions.length > 0 && (
          <LessonQuiz
            key={current.id}
            subjectId={course.id}
            lesson={current}
            fem={fem}
            previous={me?.quizResults?.find((r) => r.lessonId === current.id) ?? null}
            onGraded={refresh}
          />
        )}

        {files.length > 0 && (
          <div className="mt-6">
            <p className="mb-3 flex items-center gap-2 font-display font-extrabold"><IconFile className="size-5 text-primary" /> ملفّات الدرس والمادّة</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {files.map((m) => (
                <a key={m.id} href={m.url} target="_blank" rel="noreferrer" download
                  className="glass flex items-center gap-3 rounded-2xl p-3 transition hover:border-primary/40">
                  <span className="grid size-9 place-items-center rounded-xl bg-primary/12 text-primary"><IconFile className="size-5" /></span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{m.title}</span>
                  <IconDownload className="size-4 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* المسار */}
      <Card className="!p-4">
        <div className="mb-1 flex items-center justify-between">
          <p className="inline-flex items-center gap-2 font-display font-extrabold">
            <IconListChecks className="size-5 text-primary" /> مسار الدروس
          </p>
          <span className="text-xs font-bold text-primary">{percent.toLocaleString("ar-EG")}٪</span>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">
          {doneHere.toLocaleString("ar-EG")} من {lessons.length.toLocaleString("ar-EG")} درساً في هذه المادّة
        </p>

        <ol className="relative">
          {lessons.map((l, i) => (
            <PathNode
              key={l.id}
              n={i + 1}
              title={l.title}
              duration={l.duration}
              isFree={l.isFree}
              last={i === lessons.length - 1}
              state={
                done.has(l.id) ? "done"
                  : i === idx ? "current"
                    : canPlay(l.isFree) ? "open"
                      : "locked"
              }
              onPick={() => setIdx(i)}
            />
          ))}
        </ol>
      </Card>
    </div>
  );
}

/* ---------- الاختبار التفاعلي على الفيديو ---------- */
function LessonQuiz({
  subjectId, lesson, fem, previous, onGraded,
}: {
  subjectId: string;
  lesson: Lesson;
  fem: boolean;
  previous: { score: number; total: number; percent: number; passed: boolean } | null;
  onGraded: () => Promise<void> | void;
}) {
  const questions = lesson.quiz?.questions ?? [];
  const [answers, setAnswers] = useState<number[]>(() => Array(questions.length).fill(-1));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [graded, setGraded] = useState<{ correct: number[]; score: number; total: number; percent: number; passed: boolean } | null>(null);
  const y = (v: string) => `${v}${fem ? "ي" : ""}`;

  const answered = answers.filter((a) => a >= 0).length;
  const pick = (qi: number, oi: number) =>
    setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)));

  const submit = async () => {
    setErr(null);
    if (answered < questions.length) { setErr(`${y("أجب")} عن كل الأسئلة أولاً`); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId, lessonId: lesson.id, answers }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "تعذّر تسليم الاختبار"); return; }
      setGraded({ correct: data.correct, ...data.result });
      await onGraded();
    } catch {
      setErr("تعذّر الاتصال — حاول مرة أخرى");
    } finally {
      setBusy(false);
    }
  };

  const retry = () => { setGraded(null); setAnswers(Array(questions.length).fill(-1)); setErr(null); };

  return (
    <Card className="mt-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex items-center gap-2 font-display font-extrabold">
          <IconListChecks className="size-5 text-primary" /> اختبار الدرس
        </p>
        {graded ? (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${graded.passed ? "bg-emerald-500/15 text-emerald-500" : "bg-rose-500/15 text-rose-500"}`}>
            <IconTrophy className="size-3.5" /> {graded.score}/{graded.total} · {graded.percent}٪ {graded.passed ? "ناجح" : "لم تنجح"}
          </span>
        ) : previous ? (
          <span className="text-xs text-muted-foreground">آخر نتيجة: {previous.score}/{previous.total} ({previous.percent}٪)</span>
        ) : (
          <span className="text-xs text-muted-foreground">{questions.length.toLocaleString("ar-EG")} أسئلة اختيار من متعدّد</span>
        )}
      </div>

      <div className="space-y-4">
        {questions.map((q, qi) => (
          <div key={q.id} className="rounded-2xl border border-border p-4">
            <p className="mb-3 flex gap-2 text-sm font-bold">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/12 text-xs text-primary">{qi + 1}</span>
              {q.text}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {q.options.map((o, oi) => {
                const chosen = answers[qi] === oi;
                const right = graded ? graded.correct[qi] === oi : false;
                const wrong = graded ? chosen && graded.correct[qi] !== oi : false;
                return (
                  <button key={oi} disabled={Boolean(graded)} onClick={() => pick(qi, oi)}
                    className={`flex items-center gap-2 rounded-2xl border p-3 text-right text-sm transition ${
                      right ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500"
                      : wrong ? "border-rose-500/50 bg-rose-500/10 text-rose-500"
                      : chosen ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40"
                    }`}>
                    <span className="grid size-5 shrink-0 place-items-center rounded-full border border-current text-[10px]">
                      {right ? <IconCheckCircle className="size-4" /> : wrong ? <IconXCircle className="size-4" /> : chosen ? "●" : ""}
                    </span>
                    <span className="min-w-0 flex-1">{o}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {err && <p className="mt-3 rounded-2xl bg-rose-500/10 px-3 py-2 text-center text-xs font-bold text-rose-500">{err}</p>}

      <div className="mt-4 flex items-center gap-3">
        {graded ? (
          <button onClick={retry} className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-bold transition hover:border-primary hover:text-primary">
            <IconRotate className="size-4" /> {y("أعد")} المحاولة
          </button>
        ) : (
          <button onClick={submit} disabled={busy} className="inline-flex items-center gap-2 rounded-full btn-glow px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60">
            {busy ? <IconSpinner className="size-4 animate-spin" /> : <IconCheckCircle className="size-4" />} تسليم الإجابات
          </button>
        )}
        <span className="text-xs text-muted-foreground">{answered.toLocaleString("ar-EG")} / {questions.length.toLocaleString("ar-EG")}</span>
      </div>
    </Card>
  );
}
