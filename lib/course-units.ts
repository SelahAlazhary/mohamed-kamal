/**
 * قراءةُ دروس الكورس عبر وحداته.
 * ------------------------------------------------------------------
 * المسارُ صار: **الكورس ← وحدة ← دروس.** وكان قبله مسطّحاً: الكورسُ
 * قائمةَ دروسٍ في `videos`.
 *
 * ولم أُرحّل القاعدةَ ولم أحذف `videos`. الترحيلُ يكتب على أربعةٍ وخمسين
 * كورساً دفعةً واحدة، وخطأٌ واحدٌ فيه يُفرغها كلَّها ولا رجعة. وهذه
 * الدالّةُ تُغني عنه: من كان له `units` قُرئت، ومن لم يكن لُفَّت دروسُه
 * في وحدةٍ واحدة. فالكورسُ القديمُ يعمل اليومَ كما كان، ويصير ذا وحداتٍ
 * أوّلَ ما يفتحه الأستاذ ويقسّمه — كورساً كورساً وبيده.
 *
 * **وكلُّ قارئٍ يمرّ من هنا.** ومن قرأ `videos` مباشرةً رأى الكورسَ
 * المقسَّمَ فارغاً — وهو أسوأُ من عدم التقسيم.
 */

import type { Lesson, Material, Subject, Unit } from "./types";

/** معرّفُ الوحدة الملفوفة — ثابتٌ ليُعرف أنّها ليست وحدةً حقيقيّةً في القاعدة. */
export const LEGACY_UNIT_ID = "u-legacy";

/**
 * وحداتُ الكورس، مضمونةً غيرَ فارغة.
 *
 * ووحدةٌ بلا دروسٍ تبقى وتُعرض: الأستاذُ يُنشئها أوّلاً ثمّ يملؤها،
 * وإسقاطُ الفارغةِ يجعلها تختفي فورَ إنشائها.
 */
export function courseUnits(c: Pick<Subject, "units" | "videos">): Unit[] {
  if (c.units?.length) return c.units;
  return [
    {
      id: LEGACY_UNIT_ID,
      title: "دروس الكورس",
      lessons: c.videos ?? [],
    },
  ];
}

/**
 * كورسٌ بموادَّ جديدة — مع مرآته المسطّحة وعدّاده.
 * ------------------------------------------------------------------
 * كتابةُ الدروس تلمس ثلاثةَ حقولٍ معاً: `units` مصدرٌ، و`videos` مرآةٌ
 * يقرؤها كلُّ ما لم يُرحَّل بعد، و`lessons` عدّادٌ يُكتب في البطاقات. ومن
 * كتب أحدَها ونسي الآخرَ ترك الكورسَ نصفَ محدَّث: بطاقةٌ تقول عشرةَ دروسٍ
 * وفيه ثمانية، أو شاشةٌ تعرض ما حُذف.
 *
 * وكان هذا التركيبُ في محرّر الكورس وحدَه. فلمّا صار للدروس قسمٌ جامعٌ
 * يُكتب منه أيضاً، وجب أن يكون في موضعٍ واحد — وإلّا افترق ما يُكتب من
 * هنا عمّا يُكتب من هناك، ولا يظهر الفرقُ إلّا بعد أن يُفقد شيء.
 *
 * **والتقسيمُ يُلغى إن لم يبقَ إلّا الوحدةُ الملفوفة**: كورسٌ `units` فيه
 * وحدةٌ واحدةٌ معرّفُها `u-legacy` هو كورسٌ غيرُ مقسَّمٍ أصلاً، وإبقاؤها
 * يجعله يبدو مقسَّماً وهو ليس كذلك.
 */
export function withUnits(subject: Subject, next: Unit[]): Subject {
  const flat = next.flatMap((u) => u.lessons ?? []);
  const split = next.length > 1 || next[0]?.id !== LEGACY_UNIT_ID;
  return { ...subject, units: split ? next : [], videos: flat, lessons: flat.length };
}

/** هل قُسِّم الكورسُ فعلاً؟ — تُستعمل لعرض «قسِّم إلى وحدات» في اللوحة. */
export function isSplit(c: Pick<Subject, "units">): boolean {
  return Boolean(c.units?.length);
}

/** كلُّ الدروس بترتيب وحداتها — للعدّ والبحث والدرس التالي. */
export function allLessons(c: Pick<Subject, "units" | "videos">): Lesson[] {
  return courseUnits(c).flatMap((u) => u.lessons ?? []);
}

/** عددُ الدروس — يُكتب في بطاقة الكورس وفي `lessons` الرقميّة. */
export function lessonCount(c: Pick<Subject, "units" | "videos">): number {
  return allLessons(c).length;
}

/** الدرسُ ووحدتُه — الوحدةُ تُعرض فوق المشغّل فيعرف الطالبُ أين هو. */
export function findLesson(
  c: Pick<Subject, "units" | "videos">,
  lessonId: string,
): { lesson: Lesson; unit: Unit; index: number } | null {
  const units = courseUnits(c);
  let index = 0;
  for (const unit of units) {
    for (const lesson of unit.lessons ?? []) {
      if (lesson.id === lessonId) return { lesson, unit, index };
      index++;
    }
  }
  return null;
}

/** ملفّاتُ الكورس وملفّاتُ وحداته معاً — بلا تكرارِ معرّف. */
export function allMaterials(c: Pick<Subject, "units" | "videos" | "materials">): Material[] {
  const seen = new Set<string>();
  const out: Material[] = [];
  for (const m of [...(c.materials ?? []), ...courseUnits(c).flatMap((u) => u.materials ?? [])]) {
    if (seen.has(m.id)) continue;
    seen.add(m.id);
    out.push(m);
  }
  return out;
}

/**
 * يقسم كورساً مسطّحاً إلى وحدةٍ أولى تحمل دروسَه.
 *
 * ولا يمسّ `videos`: الكتابةُ تُضيف `units` وتترك الأصلَ مكانه، فإن ظهر
 * خللٌ رجع الكورسُ إلى ما كان بحذف `units` وحدَها.
 */
export function splitIntoFirstUnit(c: Subject): Unit[] {
  return [
    {
      id: `u${Date.now().toString(36)}`,
      title: "الوحدة الأولى",
      lessons: c.videos ?? [],
    },
  ];
}
