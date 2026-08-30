"use client";

/**
 * رسومُ الحالات الفارغة.
 * ------------------------------------------------------------------
 * كانت مرسومةً هنا بالخطّ والمساحة — وكلُّ محاولةٍ لتحسينها كانت تزيدها
 * شبهاً بالرسم المولَّد: تناظرٌ زائدٌ، وخطٌّ متساوي السُمك في كلّ موضع،
 * وتفصيلٌ بلا قصد. وهذا أوّلُ ما تلتقطه العينُ وإن لم تسمّه.
 *
 * فالحلُّ ألّا يُرسم بديلٌ أصلاً: هذه الحالاتُ تعرض الآن **الصورَ
 * المتحرّكة التي اختارها الأستاذ** — رسمٌ صنعه مصمّمون، بحركةٍ حقيقيةٍ
 * وألوانٍ مقصودة. والحالةُ الفارغةُ تشغل نصفَ الشاشة، فأولى ما فيها أن
 * يكون حيّاً لا خطّاً باهتاً يبدو كأنّ الصفحةَ لم تُحمَّل بعد.
 *
 * **والألوانُ تتبع اختيارَ اللوحة:** الصورةُ تحمل `anim-art` فيسري عليها
 * مرشّحُ التلوين — فمن أرادها كحليّةً أو ذهبيّةً نالها، ومن أراد ألوانَها
 * كما هي تركها.
 *
 * والواجهةُ نفسُها (`className` و`width`) باقيةٌ كما كانت، فلا يُمَسّ
 * موضعُ استعمالٍ واحد.
 */

import { ShariAnim, type ShariAnimId } from "./shari-art";

type Props = { className?: string; width?: number };

/**
 * قاعدةٌ واحدة لكلّ الحالات.
 * والعرضُ الوارد كان يُقاس على لوحةٍ ١٦٠×١٢٠ — والصورةُ مربّعة، فيُؤخذ
 * منه نسبةٌ لا كلُّه، وإلّا خرجت أطولَ ممّا يتوقّعه الموضع.
 */
function Empty({ id, className = "", width = 176 }: Props & { id: ShariAnimId }) {
  return (
    <span className={`inline-grid place-items-center ${className}`}>
      <ShariAnim id={id} size={Math.round(width * 0.78)} framed={false} />
    </span>
  );
}

/** لا خطط بعد — القبّعةُ والنجوم: هنا يبدأ الاشتراك. */
export function EmptyPlans(p: Props) {
  return <Empty {...p} id="capStarsAnim" />;
}

/** لا كورسات — كتبٌ وقبّعة. */
export function EmptyCourses(p: Props) {
  return <Empty {...p} id="booksCapAnim" />;
}

/** لا إشعارات — دفترٌ وقلم. */
export function EmptyBell(p: Props) {
  return <Empty {...p} id="notepadAnim" />;
}

/** الكورس مقفل — القبّعةُ والكتاب: اشترك يُفتح. */
export function EmptyLock(p: Props) {
  return <Empty {...p} id="capBookAnim" />;
}

/** لا بثّ الآن — شاشةُ الدرس المباشر. */
export function EmptyLive(p: Props) {
  return <Empty {...p} id="onlineClassAnim" />;
}
