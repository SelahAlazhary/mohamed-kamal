"use client";

/**
 * الموادّ — القسمُ الجامع.
 * ------------------------------------------------------------------
 * الموادُّ تُدار من داخل كلّ كورسٍ على حدة، وذلك يكفي لمن يبني كورساً
 * واحداً. أمّا من عنده أربعةٌ وخمسون كورساً فلا يرى بنيةَ المنهج أبداً:
 * لا يعرف أيُّ كورسٍ قُسِّم وأيُّه ما زال قائمةً مسطّحة، ولا أين تتراكم
 * الدروسُ بلا باب. فهذا القسمُ يعرض **الشجرةَ كلَّها في شاشةٍ واحدة**:
 * الكورس ← موادُّه ← عددُ دروس كلِّ مادّة.
 *
 * والمسار: **الكورس ← مادّة ← دروس.** فالمادّةُ لا توجد إلّا داخل كورس،
 * وربطُها به هو أن تُنشأ فيه — ولذلك يُختار الكورسُ أوّلاً ثمّ تُضاف
 * المادّة، لا تُنشأ مادّةٌ سائبةٌ ثمّ يُبحث لها عن كورس.
 *
 * والكتابةُ من هنا هي الكتابةُ من محرّر الكورس نفسِها: `units` هي
 * المصدر، و`videos` مرآةٌ تُحدَّث معها — فلا يفترق ما يُكتب هنا عمّا
 * يُكتب هناك.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader, Card } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/primitives";
import { Section } from "@/components/dashboard/section";
import { useContent } from "@/components/content/content-provider";
import { courseUnits, LEGACY_UNIT_ID, lessonCount } from "@/lib/course-units";
import type { Subject, Unit } from "@/lib/types";

const ar = (n: number) => n.toLocaleString("ar-EG");

export default function AdminUnits() {
  const { db, save } = useContent();
  const subjects = useMemo(() => db?.subjects ?? [], [db]);
  const [q, setQ] = useState("");
  const [only, setOnly] = useState<"all" | "split" | "flat">("all");

  const rows = subjects.filter((s) => {
    if (q && !s.name.includes(q) && !s.grade.includes(q)) return false;
    const split = Boolean(s.units?.length);
    return only === "all" || (only === "split" ? split : !split);
  });

  const totalUnits = subjects.reduce((n, s) => n + (s.units?.length ?? 0), 0);
  const splitCount = subjects.filter((s) => s.units?.length).length;

  /* الكتابةُ نفسُها التي في محرّر الكورس — `units` مصدرٌ و`videos` مرآة. */
  const write = (course: Subject, next: Unit[]) => {
    const flat = next.flatMap((u) => u.lessons ?? []);
    const split = next.length > 1 || next[0]?.id !== LEGACY_UNIT_ID;
    const updated: Subject = {
      ...course,
      units: split ? next : [],
      videos: flat,
      lessons: flat.length,
    };
    save({ subjects: subjects.map((s) => (s.id === course.id ? updated : s)) });
  };

  const addUnit = (course: Subject) => {
    const units = courseUnits(course);
    /*
      أوّلُ إضافةٍ تُثبّت المادّةَ الملفوفة مادّةً حقيقيّةً بمعرّفٍ خاصّ بها.
      ولولا ذلك لبقي معرّفُها `u-legacy` فيظنّها المُخزِّن غيرَ مقسَّمةٍ
      ويكتبها مسطّحةً — فتضيع المادّةُ الثانيةُ فورَ إنشائها.
    */
    const base =
      units[0]?.id === LEGACY_UNIT_ID
        ? [{ ...units[0], id: `u${Date.now().toString(36)}`, title: "المادّة الأولى" }]
        : units;
    write(course, [
      ...base,
      { id: `u${Date.now().toString(36)}x`, title: `المادّة ${ar(base.length + 1)}`, lessons: [] },
    ]);
  };

  const rename = (course: Subject, uid: string, title: string) =>
    write(course, courseUnits(course).map((u) => (u.id === uid ? { ...u, title } : u)));

  const moveUnit = (course: Subject, i: number, dir: -1 | 1) => {
    const units = [...courseUnits(course)];
    const j = i + dir;
    if (j < 0 || j >= units.length) return;
    [units[i], units[j]] = [units[j], units[i]];
    write(course, units);
  };

  /** حذفُ مادّةٍ يُعيد دروسَها إلى ما قبلها — ولا يحذفها معها. */
  const removeUnit = (course: Subject, uid: string) => {
    const units = courseUnits(course);
    if (units.length <= 1) return;
    const i = units.findIndex((u) => u.id === uid);
    const keep = units[i].lessons ?? [];
    const rest = units.filter((u) => u.id !== uid);
    const at = Math.max(0, i - 1);
    write(course, rest.map((u, k) => (k === at ? { ...u, lessons: [...(u.lessons ?? []), ...keep] } : u)));
  };

  return (
    <>
      <PageHeader
        title="الموادّ"
        subtitle={`المسار: الكورس ← مادّة ← دروس · ${ar(splitCount)} من ${ar(subjects.length)} كورساً مقسَّم · ${ar(totalUnits)} مادّة`}
      />

      <Card className="mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث باسم الكورس أو المرحلة…"
            className="min-w-52 flex-1 rounded-2xl border border-border bg-card/60 px-3 py-2.5 text-sm outline-none focus:border-primary/50"
          />
          <div className="flex gap-2">
            {(
              [
                ["all", "الكل"],
                ["split", "المقسَّمة"],
                ["flat", "غير المقسَّمة"],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setOnly(k)}
                className={`rounded-full border px-3.5 py-2 text-xs font-bold transition ${
                  only === k
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          المادّةُ بابٌ من المنهج — الطهارةُ ثمّ الصلاةُ ثمّ الزكاة — والدروسُ داخلها. وكورسٌ
          غيرُ مقسَّمٍ يعرض دروسَه قائمةً واحدةً للطالب، وهو ما كان قبل الموادّ؛ فتقسيمُه لا
          يحذف منه شيئاً، إنّما يوزّع دروسَه على أبوابها.
        </p>
      </Card>

      {rows.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          لا كورسات مطابقة.
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((course) => {
            const units = courseUnits(course);
            const split = Boolean(course.units?.length);
            return (
              <Section
                key={course.id}
                title={course.name}
                subtitle={`${course.grade} · ${split ? `${ar(units.length)} مادّة` : "غير مقسَّم"} · ${ar(lessonCount(course))} درساً`}
                count={units.length}
                actions={
                  <>
                    <Button className="px-3 py-1.5 text-[11px]" onClick={() => addUnit(course)}>
                      + مادّة
                    </Button>
                    <Link
                      href={`/admin/courses/${course.id}`}
                      className="rounded-full border border-border px-3 py-1.5 text-[11px] font-bold text-muted-foreground transition hover:border-primary hover:text-primary"
                    >
                      الدروس
                    </Link>
                  </>
                }
              >
                <div className="space-y-2">
                  {units.map((u, i) => (
                    <div
                      key={u.id}
                      className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card/60 p-2.5"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[hsl(var(--gold)/0.22)] text-xs font-bold text-primary">
                        {ar(i + 1)}
                      </span>
                      {/* العنوانُ حقلٌ يُكتب فيه مباشرةً — التسميةُ أكثرُ ما يُفعل بالمادّة */}
                      <input
                        value={u.title}
                        onChange={(e) => rename(course, u.id, e.target.value)}
                        className="min-w-40 flex-1 rounded-xl border border-transparent bg-transparent px-2 py-1 text-sm font-bold outline-none transition hover:border-border focus:border-primary/50 focus:bg-card"
                      />
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {ar((u.lessons ?? []).length)} درساً
                      </span>
                      <button
                        onClick={() => moveUnit(course, i, -1)}
                        disabled={i === 0}
                        title="أعلى"
                        className="grid size-7 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition hover:text-primary disabled:opacity-30"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveUnit(course, i, 1)}
                        disabled={i === units.length - 1}
                        title="أسفل"
                        className="grid size-7 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition hover:text-primary disabled:opacity-30"
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => removeUnit(course, u.id)}
                        disabled={units.length <= 1}
                        title="حذف المادّة — دروسُها تنتقل إلى ما قبلها ولا تُحذف"
                        className="grid size-7 shrink-0 place-items-center rounded-full border border-border text-rose-500 transition hover:border-rose-500 disabled:opacity-30"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </Section>
            );
          })}
        </div>
      )}
    </>
  );
}
