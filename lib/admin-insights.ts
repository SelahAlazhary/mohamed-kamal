import type { PublicDB, User } from "./types";
import { can, type AdminPerm } from "./perms";
import { gatewayOn, activeMethods } from "./payments";
import { lessonCount } from "./course-units";

/**
 * ما يحتاج انتباه المشرف الآن.
 * ------------------------------------------------------------------
 * اللوحةُ كانت تعرض أرقاماً: كم طالباً، كم كورساً، كم إيراداً. والأرقام
 * تصف الماضي ولا تقول ما العمل. هذه الدالة تقلب السؤال: ما الذي يعطّل
 * المنصّة الآن، وما الذي ينتظر ردّاً، وما الذي نُصِب ولم يُكمَل؟
 *
 * قاعدتان تحكمان ما يُعرض:
 *   • لا يُعرض عملٌ لا يملك المشرف صلاحيتَه — تنبيهٌ لا يستطيع صاحبُه
 *     الاستجابةَ له إزعاجٌ لا إفادة.
 *   • لا يُعرض ما لا فعل له — «كل شيء تمام» ليس بنداً في قائمة مهامّ.
 */

export type InsightLevel = "urgent" | "warn" | "tip";

export type Insight = {
  id: string;
  level: InsightLevel;
  label: string;
  hint: string;
  href: string;
  perm: AdminPerm;
  /** عدد يُعرض شارةً بجانب البند. */
  count?: number;
};

const RANK: Record<InsightLevel, number> = { urgent: 0, warn: 1, tip: 2 };

export function adminInsights(
  db: PublicDB | null | undefined,
  me: Pick<User, "role" | "owner" | "adminPerms"> | null | undefined
): Insight[] {
  if (!db) return [];
  const out: Insight[] = [];
  const content = db.content;

  /* ---------- مالٌ ينتظر ---------- */
  const pendingPays = (db.payments ?? []).filter((p) => p.status === "pending");
  if (pendingPays.length > 0) {
    out.push({
      id: "pay-pending",
      level: "urgent",
      count: pendingPays.length,
      label: "تحويلات تنتظر المراجعة",
      hint: `${pendingPays.map((p) => p.student).slice(0, 3).join(" · ")}${pendingPays.length > 3 ? " …" : ""}`,
      href: "/admin/payments",
      perm: "payments",
    });
  }

  /* مالٌ وصل ولم يُستعمل كودُه — يعني طالباً دفع ولم يدرس بعد */
  const unusedPaid = (db.payments ?? []).filter((p) => p.status === "approved" && p.code && !p.redeemedAt);
  if (unusedPaid.length > 0) {
    out.push({
      id: "pay-unused",
      level: "warn",
      count: unusedPaid.length,
      label: "أكواد مدفوعة لم تُفعَّل بعد",
      hint: "طلابٌ دفعوا ولم يستعملوا كودهم — قد يحتاجون تذكيراً",
      href: "/admin/payments",
      perm: "payments",
    });
  }

  /* ---------- طلابٌ ينتظرون ردّاً ---------- */
  const waiting = (db.tickets ?? []).filter((t) =>
    (t.messages ?? []).some((m) => m.from === "student" && !m.readByAdmin)
  );
  if (waiting.length > 0) {
    out.push({
      id: "support",
      level: "urgent",
      count: waiting.length,
      label: "رسائل دعم تنتظر ردّاً",
      hint: waiting.map((t) => t.student).slice(0, 3).join(" · "),
      href: "/admin/support/chat",
      perm: "support",
    });
  }

  /* ---------- إعدادٌ نُصِب ولم يُكمَل ---------- */
  const methods = activeMethods(content.payments?.methods);
  if (content.payments?.enabled === true && methods.length === 0) {
    out.push({
      id: "pay-no-methods",
      level: "urgent",
      label: "بوّابة الدفع مشغّلة بلا طريقة دفع",
      hint: "الطالب لن يرى أين يحوّل — أضف طريقة واحدة على الأقلّ",
      href: "/admin/payments",
      perm: "payments",
    });
  }
  if (methods.length > 0 && !gatewayOn(content.payments)) {
    out.push({
      id: "pay-off",
      level: "tip",
      label: "طرق الدفع جاهزة والبوّابة مطفأة",
      hint: "الشراء ما زال يمرّ عبر واتساب — شغّلها ليتمّ داخل المنصّة",
      href: "/admin/payments",
      perm: "payments",
    });
  }

  /* ---------- كورساتٌ لا تُفيد أحداً ---------- */
  const emptyPublished = (db.subjects ?? []).filter(
    (s) => s.status === "منشورة" && lessonCount(s) === 0
  );
  if (emptyPublished.length > 0) {
    out.push({
      id: "course-empty",
      level: "warn",
      count: emptyPublished.length,
      label: "كورسات منشورة بلا دروس",
      hint: emptyPublished.map((s) => s.name).slice(0, 3).join(" · "),
      href: "/admin/subjects",
      perm: "subjects",
    });
  }

  const drafts = (db.subjects ?? []).filter(
    (s) => s.status === "مسودّة" && lessonCount(s) > 0
  );
  if (drafts.length > 0) {
    out.push({
      id: "course-draft",
      level: "tip",
      count: drafts.length,
      label: "كورسات جاهزة لم تُنشَر",
      hint: `${drafts.map((s) => s.name).slice(0, 3).join(" · ")} — فيها دروس ولا يراها أحد`,
      href: "/admin/subjects",
      perm: "subjects",
    });
  }

  /* ---------- خططٌ لا تُشترى ---------- */
  const freePlans = (db.plans ?? []).filter((p) => p.visible && (p.price ?? 0) <= 0);
  if (freePlans.length > 0) {
    out.push({
      id: "plan-free",
      level: "warn",
      count: freePlans.length,
      label: "خطط ظاهرة بسعر صفر",
      hint: freePlans.map((p) => p.name).slice(0, 3).join(" · "),
      href: "/admin/plans",
      perm: "plans",
    });
  }

  if ((db.subjects ?? []).length > 0 && (db.plans ?? []).filter((p) => p.visible).length === 0) {
    const noOwnPrices = (db.subjects ?? []).every((s) => (s.prices?.length ?? 0) === 0);
    if (noOwnPrices) {
      out.push({
        id: "plan-none",
        level: "urgent",
        label: "لا خطط ولا أسعار — لا أحد يستطيع الشراء",
        hint: "أضف خطة في «الخطط» أو خيارات سعر داخل الكورس",
        href: "/admin/plans",
        perm: "plans",
      });
    }
  }

  /* ---------- طلابٌ عالقون ---------- */
  const suspended = (db.users ?? []).filter((u) => u.role === "student" && !u.active);
  if (suspended.length > 0) {
    out.push({
      id: "students-off",
      level: "tip",
      count: suspended.length,
      label: "حسابات طلاب موقوفة",
      hint: "لا يستطيعون الدخول حتى تُفعَّل",
      href: "/admin/students",
      perm: "students",
    });
  }

  /* ---------- بثٌّ نُسي مفتوحاً ---------- */
  const liveOn = (db.live ?? []).filter((l) => l.status === "مباشر");
  if (liveOn.length > 1) {
    out.push({
      id: "live-many",
      level: "warn",
      count: liveOn.length,
      label: "أكثر من بثّ معلَّم «مباشر»",
      hint: "الطالب يرى أوّلها فقط — أغلق ما انتهى",
      href: "/admin/live",
      perm: "live",
    });
  }

  /* ---------- إشعارٌ لا يصل ---------- */
  const students = (db.users ?? []).filter((u) => u.role === "student");
  const subscribed = students.filter((u) => (u.pushDevices ?? 0) > 0).length;

  if (db.integrations?.push === false) {
    out.push({
      id: "push-off",
      level: "warn",
      label: "إشعارات الأجهزة غير مضبوطة",
      hint: "كود التفعيل لن يصل الطالبَ وهو مغلقٌ للموقع — تحتاج مفاتيح VAPID على الاستضافة",
      href: "/admin/notifications",
      perm: "notifications",
    });
  } else if (students.length > 0 && subscribed === 0) {
    out.push({
      id: "push-none",
      level: "tip",
      label: "لا أحد فعّل إشعارات جهازه",
      hint: "الإشعارات تصل داخل المنصّة فقط حتى يسمح الطالب بها من صفحة الإشعارات",
      href: "/admin/notifications",
      perm: "notifications",
    });
  }

  /* ---------- هويةٌ ناقصة ---------- */
  if (!content.whatsapp?.trim()) {
    out.push({
      id: "no-wa",
      level: "warn",
      label: "رقم واتساب المنصّة غير مضبوط",
      hint: "أزرار التواصل في الموقع بلا وجهة",
      href: "/admin/customize",
      perm: "customize",
    });
  }

  return out
    .filter((x) => can(me, x.perm))
    .sort((a, b) => RANK[a.level] - RANK[b.level] || (b.count ?? 0) - (a.count ?? 0));
}

/**
 * عدّادات القوائم — تُعرض شارةً بجانب القسم.
 * الشارةُ تقول «هنا عملٌ ينتظر»، فلا تُوضع إلا حيث ينتظر عمل فعلاً.
 */
export function navBadges(
  db: PublicDB | null | undefined
): Record<string, number> {
  if (!db) return {};
  const out: Record<string, number> = {};

  const pending = (db.payments ?? []).filter((p) => p.status === "pending").length;
  if (pending) out["/admin/payments"] = pending;

  const waiting = (db.tickets ?? []).filter((t) =>
    (t.messages ?? []).some((m) => m.from === "student" && !m.readByAdmin)
  ).length;
  if (waiting) out["/admin/support/chat"] = waiting;

  /*
    طلباتُ نقل المرحلة تُشار في القائمة.
    وبدونها تبقى داخل صفحة الطلاب لا يعلم بها أحدٌ حتّى يفتحها — والطالبُ
    ينتظر. والشارةُ تصعد إلى مجموعة «الطلاب والاشتراكات» حين تُطوى.
  */
  const moves = (db.gradeRequests ?? []).filter((r) => r.status === "قيد المراجعة").length;
  if (moves) out["/admin/students"] = moves;

  return out;
}
