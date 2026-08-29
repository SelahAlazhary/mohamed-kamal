/**
 * القيم الافتراضية (Seed).
 * المنصة تبدأ فارغة من أي بيانات — لا طلاب/مواد/أكواد/اختبارات وهمية.
 * كل المحتوى الفعلي يُضاف من لوحة الأدمن، والحسابات تُنشأ من التسجيل.
 * تبقى فقط: نصوص الواجهة (قابلة للتعديل) + حساب المالك (الأدمن).
 */
import type {
  SiteContent, SitePlan, Student, Subject, GradeRow, Code, Exam, Live, Ticket,
} from "./types";

export const defaultContent: SiteContent = {
  brand: "الشيماء أحمد",
  platformSubtitle: "Al-Shaimaa Ahmed",
  /* نسبةُ التطوير — الرابطُ والشعارُ يُملآن من اللوحة. */
  developer: { name: "EX-EG" },
  teacher: {
    name: "الشيماء أحمد",
    subject: "المواد الشرعية",
    headline: "في",
    tagline: "أصولُ الدين والفقه للإعدادية · والتفسيرُ والتوحيدُ والحديثُ والميراثُ والفقه للثانوية",
    bio: "مدرّس المواد الشرعية — من الأول الإعدادي إلى الثالث الثانوي؛ شرحٌ يبدأ من الدليل ثمّ يتفرّع إلى المسألة، ويفصل بين المذهبين فلا يختلطان، وتطبيقٌ بعد كلّ درس.",
    experienceYears: 15,
    avatar: "/teacher.svg",
    logo: "",
    rating: 0,
    ratingCount: 0,
    topStudents: 0,
  },
  hero: { statusPill: "", frame: 1 },
  plansSection: {
    eyebrow: "الخطط",
    title: "اختر خطة اشتراكك",
    desc: "خطط واضحة بأسعار ثابتة — فعّل خطتك بكود التفعيل وابدأ من الدرس الأول.",
    note: "حوّل قيمة الخطة على فودافون كاش أو إنستاباي، وأرسل الإيصال على واتساب ليصلك كود التفعيل.",
  },
  cta: {
    registerLabel: "سجّل الآن",
    registerUrl: "/register",
    heroPrimaryLabel: "أنشئ حساب طالب",
    secondaryLabel: "شاهد درساً مجانياً",
    videoUrl: "",
    whatsappLabel: "تواصل معنا على واتساب",
    whatsappUrl: "",
    whatsappText: "السلام عليكم، أود الاستفسار عن الاشتراك",
  },
  whatsapp: "201000000000",
  social: { facebook: "#", youtube: "#", telegram: "#" },
  support: { email: "", phone: "", whatsapp: "" },
  url: "",
  theme: { layout: "light", preset: "midad", customPrimary: null },
  grades: [],
  features: [
    { icon: "BookOpenCheck", tag: "التأصيل", title: "الدليلُ قبل الفرع", desc: "كلُّ مسألةٍ تبدأ من دليلها ووجه دلالته ثمّ تتفرّع — فتُفهم ولا تُحفظ حفظاً يزول بعد الامتحان.", span: "lg:col-span-2" },
    { icon: "ScrollText", tag: "المذهبان", title: "الشافعيُّ والحنفيُّ لا يختلطان", desc: "كلُّ مذهبٍ بترتيبه وأدلّته، ومواضعُ الخلاف تُبيَّن على حدة — فيعرف الطالب ما يُسأل عنه في ورقته.", span: "" },
    { icon: "ShieldCheck", tag: "الأمان", title: "حساب آمن بجهاز واحد", desc: "حسابك مرتبط بجهازك الشخصي فقط — تجربة عادلة وآمنة لكل طالب.", span: "" },
    { icon: "MessagesSquare", tag: "المتابعة", title: "تدريب وتصحيح مستمرّ", desc: "تدريبٌ من المنهج بعد كلّ درس، واختباراتٌ تُصحَّح فوراً، ومتابعةٌ حتى تستقيم المسألة.", span: "lg:col-span-2" },
  ],
  curriculum: [],
  honorStudents: [],
  faqs: [
    { q: "إزاي أشترك وأفعّل الكورس؟", a: "أنشئ حسابك، اختر الخطة المناسبة، ثم حوّل قيمتها فودافون كاش أو إنستاباي وابعت صورة الإيصال على واتساب — نراجع التحويل ونرسل لك كود التفعيل." },
    { q: "الكورس بيفضل مفتوح قد إيه؟", a: "بعد التفعيل يظل الكورس مفتوحاً لك بمشاهدة غير محدودة لكل دروسه طوال مدة الخطة." },
    { q: "إيه المراحل والفروع اللي بتتشرح؟", a: "الإعدادية: أصول الدين، والفقه الشافعي، والفقه الحنفي. والثانوية: التفسير، والتوحيد، والحديث، والميراث، والفقه الحنفي، والفقه الشافعي." },
    { q: "أنا مبتدئ في الفقه، أبدأ منين؟", a: "من أوّل درسٍ في الأصول — الشرحُ مبنيٌّ بالترتيب: التعريف والدليل، ثمّ المسائل واحدةً واحدة، مع تدريبٍ بعد كلّ درس." },
    { q: "أقدر أفتح حسابي من أكتر من جهاز؟", a: "الحساب مرتبط بجهاز واحد لضمان تجربة عادلة وآمنة. لو احتجت تغيير الجهاز تواصل مع الدعم." },
    { q: "المحاضرات مباشرة ولا مسجّلة؟", a: "الدروس مسجّلة بجودة عالية تشاهدها في أي وقت، مع حصص بث مباشر دورية للمراجعة والإجابة عن الأسئلة." },
  ],
};

/* المنصة تبدأ فارغة تماماً — كل شيء يُضاف من لوحة الأدمن. */
/** لا توجد خطط افتراضية — تُضاف كلها من «/admin/plans». */
export const defaultPlans: SitePlan[] = [];
export const defaultStudents: Student[] = [];
export const defaultSubjects: Subject[] = [];
export const defaultGrades: GradeRow[] = [];
export const defaultCodes: Code[] = [];
export const defaultExams: Exam[] = [];
export const defaultLive: Live[] = [];
export const defaultTickets: Ticket[] = [];
export const defaultNotifications: import("./types").Notification[] = [];

