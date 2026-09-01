/**
 * فحصُ الترابط.
 * ------------------------------------------------------------------
 * لا يفحص الشكلَ بل **القواعدَ التي تحكم المال والصلاحيات**: من يفتح
 * ماذا، وبأيّ خطّة، ومتى يُقفل. وهي القواعدُ التي لا يُرى خطؤها في
 * الشاشة — يُرى عند الطالب بعد أن يدفع.
 *
 * ويُشغَّل بـ`npm run verify`. والحزمُ لازمٌ لأنّ Node يجرّد الأنواعَ ولا
 * يَحُلّ الاستيرادَ بلا لاحقة.
 */
import { planTargets, unitActive, courseActive, ownsAnyUnit } from "../lib/access.ts";
import { picksOpenUnit, pickKey, parsePick, picksLabel } from "../lib/picks.ts";
import { emailHint } from "../lib/email-hint.ts";
import { gradeInStage, gradeHasTrack } from "../lib/data.ts";
import { depthFilter, depthLit } from "../lib/art-depth.ts";
import { courseUnits, isSplit } from "../lib/course-units.ts";
import { levelOf, stateOf, homeworkFor, homeworkTally } from "../lib/student-report.ts";

let pass = 0, fail = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`  ${ok ? "OK " : "FAIL"} ${name}${ok ? "" : `\n       got  ${JSON.stringify(got)}\n       want ${JSON.stringify(want)}`}`);
};

const course = {
  id: "SUB-1", name: "الفقه", teacher: "م", grade: "الأول الإعدادي", track: "الكل",
  term: 1, lessons: 4, students: 0, price: 0, videos: [], status: "منشورة",
  entryMode: "materials",
  units: [
    { id: "u1", title: "الطهارة", lessons: [{ id: "l1", title: "د1", url: "", isFree: true }] },
    { id: "u2", title: "الصلاة",  lessons: [{ id: "l2", title: "د2", url: "" }] },
    { id: "u3", title: "الصيام",  lessons: [{ id: "l3", title: "د3", url: "" }] },
  ],
};

console.log("\n== الخطّةُ المختارة تفتح ما أُشّر عليه لا أكثر ==");
const plan = { id: "P", name: "حزمة", kind: "term", scope: "picked", picks: ["SUB-1::u2"], price: 100, visible: true, createdAt: "" };
t("targets", planTargets(plan), ["SUB-1::u2"]);
const buyer = { subscriptions: [{ id: "s", subjectId: "SUB-1::u2", plan: "ترم", activatedAt: "", expiresAt: null }] };
t("المادّةُ المشتراة مفتوحة", unitActive(buyer, "SUB-1", "u2", Date.now(), 1), true);
t("وأختُها مقفلة",           unitActive(buyer, "SUB-1", "u3", Date.now(), 1), false);
t("والكورسُ لا يُفتح بها",    courseActive(buyer, "SUB-1", Date.now(), 1), false);
t("لكنّه يُعرف أنّه اشترى منه", ownsAnyUnit(buyer, "SUB-1"), true);

console.log("\n== وشراءُ الكورس يفتح موادَّه كلَّها (الاتّجاه واحد) ==");
const whole = { subscriptions: [{ id: "s", subjectId: "SUB-1", plan: "ترم", activatedAt: "", expiresAt: null }] };
t("u1", unitActive(whole, "SUB-1", "u1", Date.now(), 1), true);
t("u3", unitActive(whole, "SUB-1", "u3", Date.now(), 1), true);

console.log("\n== خطّةُ «كلّ المواد» تفتح كلَّ شيء ==");
const all = { subscriptions: [{ id: "s", subjectId: "*", plan: "ترم", activatedAt: "", expiresAt: null }] };
t("مادّةٌ في كورسٍ آخر", unitActive(all, "SUB-9", "uX", Date.now(), 2), true);

console.log("\n== والاشتراكُ المنتهي لا يفتح ==");
const dead = { subscriptions: [{ id: "s", subjectId: "SUB-1::u2", plan: "ترم", activatedAt: "", expiresAt: "2020-01-01T00:00:00.000Z" }] };
t("منتهٍ", unitActive(dead, "SUB-1", "u2", Date.now(), 1), false);

console.log("\n== مفاتيحُ الاختيار ==");
t("مفتاحُ الكورس يفتح موادَّه", picksOpenUnit(["SUB-1"], "SUB-1", "u3"), true);
t("ومفتاحُ مادّةٍ لا يفتح أختَها", picksOpenUnit(["SUB-1::u2"], "SUB-1", "u3"), false);
t("الفكُّ", parsePick(pickKey("SUB-1", "u2")), { subjectId: "SUB-1", unitId: "u2" });
t("وصفٌ مقروء", picksLabel(["SUB-1", "SUB-1::u2"], [course]), "الفقه · الطهارة".replace("الطهارة", "الصلاة"));

console.log("\n== الصفُّ والمرحلةُ والشعبة ==");
t("ثانوية + إعدادي = تناقض", gradeInStage("الأول الإعدادي", "ثانوية"), false);
t("إعدادية + إعدادي = صحيح", gradeInStage("الأول الإعدادي", "إعدادية"), true);
t("ثانوية + ثانوي = صحيح",  gradeInStage("الثالث الثانوي", "ثانوية"), true);
t("لا شعبةَ للإعدادي", gradeHasTrack("الثاني الإعدادي"), false);
t("وللثانويّ شعبة",   gradeHasTrack("الثاني الثانوي"), true);

console.log("\n== تقسيمُ الكورس ==");
t("مقسَّم", isSplit(course), true);
t("عددُ المواد", courseUnits(course).length, 3);
t("غيرُ المقسَّم يُلَفّ في واحدة", courseUnits({ videos: [{ id: "x", title: "د", url: "" }] }).length, 1);

console.log("\n== تصحيحُ نطاق البريد ==");
t("gmial", emailHint("ali@gmial.com"), "ali@gmail.com");
t("hotmial", emailHint("ali@hotmial.com"), "ali@hotmail.com");
t("الصحيحُ لا يُقترح عليه", emailHint("ali@gmail.com"), null);
t("نطاقٌ بعيدٌ يُترك", emailHint("ali@azhar.edu.eg"), null);

console.log("\n== عمقُ الرسوم ==");
t("المسطّحةُ بلا مرشّح", depthFilter("flat"), "");
t("والمجسَّمةُ تُضيء", depthLit("deep"), true);
t("والظلُّ الخفيفُ لا يُضيء", depthLit("soft"), false);

console.log("\n== تقريرُ الطالب ==");
/* من لم يحلّ لا يُقيَّم — ووسمُ من لم يُسأل بالتعثّر حكمٌ بلا بيّنة */
t("لم يحلّ ⇒ لم يُقيَّم", levelOf(null), "unknown");
t("٤٩ متعثّر", levelOf(49), "weak");
t("٨٥ ممتاز", levelOf(85), "top");
/* وبلا اشتراكٍ لا حالةَ تعثّر: تقدّمُه صفرٌ لأنّه لا يملك شيئاً */
t("بلا اشتراك", stateOf({ open: 0, progress: 0, daysSinceSeen: 400 }), "none");
t("ولا ظهورَ مسجَّل ليس غياباً", stateOf({ open: 1, progress: 40, daysSinceSeen: null }), "active");

{
  const qz = (n) => ({ enabled: true, passScore: 60, questions: Array.from({ length: n }, (_, i) => ({ id: String(i) })) });
  const subs = [
    { id: "S1", name: "الفقه", units: [{ id: "u1", title: "الطهارة", lessons: [
      { id: "l1", title: "أ", url: "", quiz: qz(2) },
      { id: "l2", title: "ب", url: "", quiz: qz(3) },
      { id: "l3", title: "بلا واجب", url: "" },
    ] }] },
    { id: "S2", name: "غيرُ مملوك", units: [{ id: "u9", title: "و", lessons: [{ id: "l9", title: "د", url: "", quiz: qz(4) }] }] },
  ];
  const stu = {
    id: "U", name: "ط",
    subscriptions: [{ id: "s", subjectId: "S1", plan: "ترم", activatedAt: "", expiresAt: null }],
    quizResults: [{ subjectId: "S1", lessonId: "l1", score: 1, total: 2, percent: 50, passed: false, at: "" }],
  };
  const hw = homeworkFor(stu, subs);
  t("الدرسُ بلا واجبٍ يُستثنى", hw.some((h) => h.lessonId === "l3"), false);
  t("وكورسٌ غيرُ مملوكٍ يُستثنى", hw.some((h) => h.subjectId === "S2"), false);
  /* الفارغُ يظهر فارغاً — والتقريرُ يُفتح لما لم يُحلّ */
  t("غيرُ المحلول أوّلاً", hw[0].lessonId, "l2");
  t("ونتيجتُه فارغة", hw[0].percent, null);
  t("الخلاصة", homeworkTally(hw), { total: 2, solved: 1, pending: 1, passed: 0, failed: 1, avg: 50 });
}

/*
  ==================================================================
  أصنافٌ في الترميز بلا قاعدةٍ في الأنماط
  ------------------------------------------------------------------
  وقع هذا فعلاً: استُبدل قسمٌ في `lesson-ui.css` بالقصّ من موضعه **إلى
  آخر الملفّ**، فذهب معه ما بعده — وبقيت أصنافُ شريط الأدوات مكتوبةً في
  الترميز بلا أنماط، فخرج اسمُ الطالب وصفُّه ملتصقَين بلا قرص.

  **ولم يظهر في بناءٍ ولا في فحصِ أنواع**: صنفٌ بلا قاعدةٍ ليس خطأً في
  CSS ولا في TypeScript — لا يُرى إلّا في الشاشة. فيُفحص هنا.

  والفحصُ مقصورٌ على البادئات المكتوبة بأيدينا؛ وأصنافُ Tailwind تُولَّد
  عند البناء فلا تُفحص.
  ==================================================================
*/
console.log("\n== أصنافُ الهوية لها قواعدُها ==");
{
  const { readFileSync, readdirSync, statSync } = await import("node:fs");
  const { join } = await import("node:path");

  const walk = (dir, out = []) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (/node_modules|[.]next|[.]git/.test(p)) continue;
      if (statSync(p).isDirectory()) walk(p, out);
      else out.push(p);
    }
    return out;
  };

  const files = [...walk("app"), ...walk("components")];
  const css = files
    .filter((f) => f.endsWith(".css"))
    .map((f) => readFileSync(f, "utf8"))
    .join("\n");
  const code = files
    .filter((f) => /[.]tsx?$/.test(f))
    .map((f) => readFileSync(f, "utf8"))
    .join("\n");

  /*
    الأصنافُ تُقرأ من `className` وحدَها لا من الملفّ كلِّه.
    فمسحُ الملفّ كلِّه يلتقط ما ليس صنفاً: أسماءَ الوحدات في الاستيراد
    (`lib/pay-styles`) وأسماءَ متغيّرات CSS (`--pg-a`) — فتُعدّ يتيمةً
    وهي ليست أصنافاً أصلاً.
  */
  const ATTR = /className\s*=\s*(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\})/g;
  const PREFIX = /\b((?:lp|uc|cu|ch|tb|rp|hw|xs|pay|pg|sp|lm|pnl)-[a-z0-9-]+)\b/g;
  const used = new Set();
  for (const a of code.matchAll(ATTR)) {
    const value = a[1] ?? a[2] ?? a[3] ?? "";
    for (const m of value.matchAll(PREFIX)) used.add(m[1]);
  }

  const orphans = [...used].filter((c) => !css.includes("." + c)).sort();
  t(
    `كلُّ صنفٍ مستعملٍ له قاعدة (فُحص ${used.size})`,
    orphans.length ? orphans.slice(0, 12) : 0,
    0,
  );
}

console.log(`\n${fail === 0 ? "كلُّها سليمة" : "فيها خلل"} — نجح ${pass} · فشل ${fail}`);
process.exit(fail ? 1 : 0);
