/**
 * مؤشّراتُ الطالب — حسابٌ واحدٌ تُقرأ منه التقارير.
 * ------------------------------------------------------------------
 * صفحةُ الطالب الواحد تعرض تفصيلَه، وصفحةُ التقارير تُقارن بينهم. وكلتاهما
 * تحتاج المؤشّراتِ نفسَها — فتُحسب هنا مرّةً لا في الصفحتين.
 *
 * **والمؤشّراتُ لا تُصنع، تُشتقّ.** كلُّ رقمٍ هنا مأخوذٌ من بيانٍ مخزَّنٍ
 * فعلاً: الاشتراكاتُ في حساب الطالب، والنسبةُ في `progress`، والدرجاتُ في
 * `quizResults`، والتحويلاتُ في بوّابة الدفع. ولا يُخترع مؤشّرٌ لا سندَ
 * له في البيانات — فرقمٌ لا يُعرف مصدرُه أسوأُ من غيابه: يُبنى عليه قرارٌ
 * في حقّ طالب.
 */

import type { PayRequest, Subject, User } from "./types";
import { subscriptionFor } from "./access";

/**
 * ما يلزم من الطالب لبناء تقريره.
 * ------------------------------------------------------------------
 * وهو **أقلُّ من `User`**: التقريرُ لا يقرأ كلمةَ المرور ولا ملحَها، وما
 * يصل المتصفّحَ `PublicUser` مجرَّدٌ منهما أصلاً. فلو طُلب `User` هنا لما
 * صحّ استدعاؤها من اللوحة إلّا بقسرٍ في الأنواع.
 *
 * والتوقيعُ يقول ما يُقرأ فعلاً: من عدّله عرف أثرَه بلا قراءةِ الجسد.
 */
export type ReportedUser = Pick<User, "id" | "name"> &
  Partial<Pick<User, "grade" | "stage" | "progress" | "quizResults" | "lastSeen" | "subscriptions">>;

/** حالةُ الطالب — كلمةٌ واحدةٌ تلخّص وضعَه. */
export type StudentState =
  | "new"       // اشترك ولم يبدأ
  | "active"    // يتقدّم ودخل قريباً
  | "slow"      // اشترك وبدأ لكنّه متوقّف
  | "stalled"   // اشترك ولم يظهر منذ مدّة
  | "done"      // أتمّ ما اشترك فيه
  | "none";     // لا اشتراكَ نشط

export type StudentReport = {
  id: string;
  name: string;
  grade?: string;
  stage?: string;
  /** الكورساتُ المفتوحةُ له الآن. */
  activeCourses: number;
  /** متوسّطُ تقدّمه في الكورسات المفتوحة (٪). */
  progress: number;
  /** الدروسُ التي أُنجزت من مجموع دروس ما اشترك فيه. */
  lessonsDone: number;
  lessonsTotal: number;
  /** عددُ الواجبات المحلولةِ ومتوسّطُ درجاتها (٪) — و`null` إن لم يحلّ. */
  quizzes: number;
  quizAvg: number | null;
  /** مجموعُ ما دُفع وقُبل. */
  paid: number;
  /** أيّامٌ منذ آخر ظهور — و`null` إن لم يُسجَّل له ظهور. */
  daysSinceSeen: number | null;
  state: StudentState;
};

/** كم يوماً بين تاريخٍ واليوم — و`null` إن لم يصحّ التاريخ. */
export function daysSince(iso?: string, now = Date.now()): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return null;
  return Math.max(0, Math.floor((now - t) / 86_400_000));
}

/**
 * حدُّ «الغياب».
 * أربعةَ عشرَ يوماً لا سبعةً: الأسبوعُ يمرّ بالامتحانات والسفر والمرض،
 * ووسمُ طالبٍ بالغياب لأنّه لم يدخل أسبوعاً يُنتج قوائمَ لا تُقرأ لكثرة
 * من فيها. وأسبوعان غيابٌ يُسأل عنه.
 */
export const AWAY_DAYS = 14;

/** تقريرُ طالبٍ واحد. */
export function reportFor(
  u: ReportedUser,
  subjects: Subject[],
  payments: PayRequest[],
  now = Date.now(),
): StudentReport {
  /* الكورساتُ المفتوحةُ له — بالاشتراك لا بالرغبة */
  const open = subjects.filter((s) => subscriptionFor(u, s.id));

  const prog = u.progress ?? {};
  const pcts = open.map((s) => Math.max(0, Math.min(100, Math.round(prog[s.id] ?? 0))));
  const progress = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0;

  /*
    عددُ الدروس يُشتقّ من النسبة لا يُعدّ من سجلٍّ.
    الإنجازُ يُحفظ في جهاز الطالب (`localStorage`) وتُرسَل نسبتُه فقط —
    فلا يملك الخادمُ قائمةَ ما أُنجز. والاشتقاقُ تقريبٌ يُقال إنّه تقريب،
    ولا يُقدَّم على أنّه عدٌّ.
  */
  const lessonsTotal = open.reduce((n, s) => n + countLessons(s), 0);
  const lessonsDone = open.reduce(
    (n, s) => n + Math.round((countLessons(s) * Math.max(0, Math.min(100, prog[s.id] ?? 0))) / 100),
    0,
  );

  const qs = u.quizResults ?? [];
  const quizAvg = qs.length
    ? Math.round(qs.reduce((a, r) => a + (r.percent ?? 0), 0) / qs.length)
    : null;

  const paid = payments
    .filter((p) => p.userId === u.id && p.status === "approved")
    .reduce((a, p) => a + (Number(p.amount) || 0), 0);

  const daysSinceSeen = daysSince(u.lastSeen, now);

  return {
    id: u.id,
    name: u.name,
    grade: u.grade,
    stage: u.stage,
    activeCourses: open.length,
    progress,
    lessonsDone,
    lessonsTotal,
    quizzes: qs.length,
    quizAvg,
    paid,
    daysSinceSeen,
    state: stateOf({ open: open.length, progress, daysSinceSeen }),
  };
}

/**
 * الحالةُ — ترتيبُ الفحص مقصود.
 * «لا اشتراك» أوّلاً لأنّ ما بعده لا معنى له بدونه: طالبٌ بلا اشتراكٍ
 * تقدّمُه صفرٌ دائماً، ووسمُه بـ«متعثّر» ظلمٌ له وتشويشٌ على القائمة.
 */
export function stateOf(x: {
  open: number;
  progress: number;
  daysSinceSeen: number | null;
}): StudentState {
  if (x.open === 0) return "none";
  if (x.progress >= 100) return "done";
  if (x.progress === 0) return "new";
  if (x.daysSinceSeen !== null && x.daysSinceSeen >= AWAY_DAYS) return "stalled";
  if (x.daysSinceSeen !== null && x.daysSinceSeen >= 7) return "slow";
  return "active";
}

export const STATE_LABEL: Record<StudentState, string> = {
  new: "لم يبدأ",
  active: "منتظم",
  slow: "متباطئ",
  stalled: "غائب",
  done: "أتمّ",
  none: "بلا اشتراك",
};

/** دروسُ الكورس — من الموادّ إن قُسّم، ومن المقاطع إن لم يُقسَّم. */
function countLessons(s: Subject): number {
  const inUnits = (s.units ?? []).reduce((n, u) => n + (u.lessons ?? []).length, 0);
  return inUnits || (s.videos ?? []).length || 0;
}

/**
 * التقريرُ ملفّاً يُفتح في Excel.
 * ------------------------------------------------------------------
 * **وBOM في أوّله ليس زينة**: Excel على ويندوز يقرأ CSV بترميز النظام لا
 * بـUTF-8 ما لم يجد العلامة، فتخرج العربيةُ رموزاً. وهذا يقع في كلّ
 * تصديرٍ عربيٍّ لا يضعها.
 *
 * **والحقلُ يُقتبس ويُضاعف اقتباسُه**: اسمٌ فيه فاصلةٌ يكسر الأعمدة، واسمٌ
 * فيه علامةُ اقتباسٍ يكسر الحقل. وأسماءُ الطلاب تُكتب بأيديهم.
 */
export function reportsToCsv(rows: StudentReport[]): string {
  const head = [
    "الاسم", "الصفّ", "المرحلة", "الحالة", "كورسات مفتوحة",
    "التقدّم ٪", "دروس منجَزة", "إجمالي الدروس",
    "واجبات محلولة", "متوسّط الدرجات ٪", "المدفوع", "أيام منذ آخر ظهور",
  ];
  const cell = (v: unknown) => {
    const t = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
  };
  const lines = rows.map((r) => [
    r.name, r.grade ?? "", r.stage ?? "", STATE_LABEL[r.state], r.activeCourses,
    r.progress, r.lessonsDone, r.lessonsTotal,
    r.quizzes, r.quizAvg ?? "", r.paid, r.daysSinceSeen ?? "",
  ].map(cell).join(","));
  return "﻿" + [head.join(","), ...lines].join("\r\n");
}
