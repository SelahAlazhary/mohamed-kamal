"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Plus, Trash2, PlayCircle, Gift, FileText, Upload, ImageIcon,
  ListChecks, ChevronDown, Check, Link2, X, Loader2, Video, Palette, Wallet, Layers,
  ListVideo,
} from "lucide-react";
import { courseUnits, isSplit, withUnits, LEGACY_UNIT_ID } from "@/lib/course-units";
import { PageHeader, Card } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/primitives";
import { useContent } from "@/components/content/content-provider";
import { CourseArt, COVER_PATTERNS } from "@/components/brand/course-art";
import { CoverTextEditor } from "@/components/admin/cover-text-editor";
import { QuizEditor } from "@/components/admin/quiz-editor";
import { CoverStickersEditor } from "@/components/admin/cover-stickers-editor";
import type { Lesson, Material, Subject, Quiz, QuizQuestion, ImageFit, CoverPattern, CoverText, CoverSticker, Unit } from "@/lib/types";
import { mediaSrc } from "@/lib/media";
import { Section } from "@/components/dashboard/section";

/** ألوان خلفية جاهزة للوحة الغلاف — من عائلة هوية المخطوط. */
const COVER_COLORS: { hex: string; label: string }[] = [
  { hex: "#233b8b", label: "مِداد" },
  { hex: "#095e86", label: "نِيلي" },
  { hex: "#245c4b", label: "أندلسي" },
  { hex: "#87263a", label: "رُمّاني" },
  { hex: "#8a6212", label: "ذهب عتيق" },
  { hex: "#4a3570", label: "بنفسج" },
  { hex: "#1f5a5e", label: "فيروزي" },
  { hex: "#6b3a1e", label: "بُنّي" },
];

export default function CourseManage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { db, save, uploadImage, content } = useContent();
  const subjects = db?.subjects ?? [];
  const subject = subjects.find((s) => s.id === id);
  const [form, setForm] = useState({ title: "", url: "", duration: "", isFree: false });
  const [mat, setMat] = useState({ title: "", url: "" });
  const coverRef = useRef<HTMLInputElement>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [quizFor, setQuizFor] = useState<string | null>(null);
  /*
    المادّةُ المفتوحة.
    عرضُ الموادّ كلِّها بدروسها معاً يجعل الصفحةَ طوماراً: عشرُ موادّ في
    كلٍّ عشرةُ دروسٍ تعني مئةَ بطاقةٍ في شاشةٍ واحدة. فالموادُّ شبكةٌ
    تُتصفَّح بالنظر، والدروسُ لا تُفتح إلّا لمن طُلبت مادّتُه.
  */
  const [openUnit, setOpenUnit] = useState<string | null>(null);
  /** المادّةُ التي يُضاف إليها الدرسُ الجديد. */
  const [intoUnit, setIntoUnit] = useState<string>("");
  const videoRef = useRef<HTMLInputElement>(null);
  const matRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<"video" | "material" | null>(null);
  const driveOn = content.mediaHost === "drive";

  if (!subject) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <p className="py-6 text-sm text-muted-foreground">الكورس غير موجود.</p>
        <Link href="/admin/subjects" className="inline-flex rounded-full border border-border px-5 py-2 text-sm font-bold">العودة للكورسات</Link>
      </Card>
    );
  }
  /*
    الموادُّ هي مصدرُ الحقيقة، و`videos` مرآةٌ لها.
    ------------------------------------------------------------
    والمرآةُ مقصودة: أربعةٌ وخمسون كورساً وعشرةُ قرّاءٍ في الشيفرة يقرؤون
    `videos`. فلو صارت الموادُّ وحدَها هي المكتوبة لوجب تغييرُ العشرة
    دفعةً واحدة، ويكفي أن يُنسى واحدٌ ليقرأ كورساً فارغاً. فالكتابةُ
    تُحدّثهما معاً: القديمُ يقرأ ما يعرف، والجديدُ يقرأ الموادّ.

    ولا تُكتب `units` حتّى يُقسّم الأستاذُ فعلاً — فكورسٌ لم يُقسَّم يبقى
    في القاعدة كما كان، ولا يتبدّل شكلُ أربعةٍ وخمسين كورساً لأنّ أحدَها
    فُتح.
  */
  const units = courseUnits(subject);
  const videos = units.flatMap((u) => u.lessons ?? []);

  /* التركيبُ في `lib/course-units` — يُكتب من هنا ومن قسم «كلّ الدروس»
     بالطريقة نفسِها، فلا يفترق الحقلان. */
  const persistUnits = (next: Unit[]) => {
    const updated = withUnits(subject, next);
    save({ subjects: subjects.map((s) => (s.id === id ? updated : s)) });
  };

  /** يمرّ على دروس الموادّ كلِّها — للاختبار والتعديل الموضعيّ. */
  const mapLessons = (fn: (l: Lesson) => Lesson) =>
    persistUnits(units.map((u) => ({ ...u, lessons: (u.lessons ?? []).map(fn) })));

  const add = () => {
    if (!form.title.trim() || !form.url.trim()) return;
    const lesson: Lesson = { id: `L-${Date.now()}`, title: form.title.trim(), url: form.url.trim(), duration: form.duration.trim() || undefined, isFree: form.isFree };
    /* يُضاف إلى المادّة المختارة، أو إلى آخر مادّةٍ إن لم تُختر واحدة. */
    const target = units.some((u) => u.id === intoUnit) ? intoUnit : units[units.length - 1].id;
    persistUnits(units.map((u) => (u.id === target ? { ...u, lessons: [...(u.lessons ?? []), lesson] } : u)));
    setForm({ title: "", url: "", duration: "", isFree: false });
  };
  const remove = (lid: string) =>
    persistUnits(units.map((u) => ({ ...u, lessons: (u.lessons ?? []).filter((v) => v.id !== lid) })));
  /** تحديث اختبار درس (تشغيل/إيقاف + الأسئلة). */
  const setQuiz = (lid: string, quiz: Quiz | undefined) =>
    mapLessons((v) => (v.id === lid ? { ...v, quiz } : v));

  /* ---------- إدارةُ الموادّ ---------- */
  const addUnit = () => {
    /*
      أوّلُ إضافةٍ تُثبّت المادّةَ الملفوفة مادّةً حقيقيّةً بمعرّفٍ خاصّ بها.
      ولولا ذلك لبقي معرّفُها `u-legacy` فيظنّها المُخزِّن غيرَ مقسَّمةٍ
      ويكتبها مسطّحةً — فتضيع المادّةُ الثانيةُ فورَ إنشائها.
    */
    const base = units[0]?.id === LEGACY_UNIT_ID
      ? [{ ...units[0], id: `u${Date.now().toString(36)}`, title: "المادّة الأولى" }]
      : units;
    persistUnits([...base, { id: `u${Date.now().toString(36)}x`, title: `المادّة ${(base.length + 1).toLocaleString("ar-EG")}`, lessons: [] }]);
  };
  const renameUnit = (uid: string, title: string) =>
    persistUnits(units.map((u) => (u.id === uid ? { ...u, title } : u)));
  /** حذفُ مادّةٍ يُعيد دروسَها إلى ما قبلها — ولا يحذفها معها. */
  const removeUnit = (uid: string) => {
    if (units.length <= 1) return;
    const i = units.findIndex((u) => u.id === uid);
    const keep = units[i].lessons ?? [];
    const rest = units.filter((u) => u.id !== uid);
    const at = Math.max(0, i - 1);
    persistUnits(rest.map((u, k) => (k === at ? { ...u, lessons: [...(u.lessons ?? []), ...keep] } : u)));
  };
  const moveUnit = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= units.length) return;
    const arr = [...units];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    persistUnits(arr);
  };
  /** نقلُ درسٍ إلى مادّةٍ أخرى — يُنزع من موضعه ويُلحق بآخر المقصد. */
  const moveLessonTo = (lid: string, uid: string) => {
    const lesson = videos.find((v) => v.id === lid);
    if (!lesson) return;
    persistUnits(
      units.map((u) => ({
        ...u,
        lessons:
          u.id === uid
            ? [...(u.lessons ?? []).filter((v) => v.id !== lid), lesson]
            : (u.lessons ?? []).filter((v) => v.id !== lid),
      })),
    );
  };

  /** إحصاء محاولات الطلاب على اختبار درس. */
  const quizStats = (lid: string) => {
    const rs = (db?.users ?? []).flatMap((u) => (u.quizResults ?? []).filter((r) => r.lessonId === lid));
    if (!rs.length) return { attempts: 0, avg: 0, passed: 0 };
    return {
      attempts: rs.length,
      avg: Math.round(rs.reduce((a, r) => a + r.percent, 0) / rs.length),
      passed: rs.filter((r) => r.passed).length,
    };
  };

  const materials = subject.materials ?? [];
  const persistMats = (m: Material[]) =>
    save({ subjects: subjects.map((s) => (s.id === id ? { ...subject, materials: m } : s)) });
  /** الملفات تُضاف برابط خارجي (Google Drive / PDF / أي رابط مباشر). */
  const addMaterial = () => {
    if (!mat.url.trim()) return;
    persistMats([...materials, { id: `M-${Date.now()}`, title: mat.title.trim() || mat.url.trim(), url: mat.url.trim() }]);
    setMat({ title: "", url: "" });
  };
  const removeMaterial = (mid: string) => persistMats(materials.filter((m) => m.id !== mid));

  /** قياس نسبة الغلاف الأصلية مرّة واحدة (لوضع «الإطار يتبع الصورة»). */
  useEffect(() => {
    if (!subject?.cover) return;
    const img = new window.Image();
    img.onload = () => {
      const r = Number((img.naturalWidth / img.naturalHeight).toFixed(4));
      if (r > 0 && Math.abs((subject.coverRatio ?? 0) - r) > 0.01) {
        save({ subjects: subjects.map((x) => (x.id === id ? { ...subject, coverRatio: r } : x)) });
      }
    };
    img.src = subject.cover;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject?.cover]);

  /** ضبط الغلاف (محاذاة/تكبير) — يُحفظ فوراً وتتحدّث المعاينة. */
  const setCoverFit = (patch: Partial<ImageFit>) =>
    save({
      subjects: subjects.map((s) =>
        s.id === id ? { ...subject, coverFit: { ...(subject.coverFit ?? {}), ...patch } } : s
      ),
    });

  /** الصور الملصقة على الغلاف. */
  const setCoverStickers = (next: CoverSticker[]) =>
    save({ subjects: subjects.map((s) => (s.id === id ? { ...subject, coverStickers: next } : s)) });

  /** نصّ الغلاف وموضعه — يُحفظ عند كل تغيير (السحب يحفظ عند رفع الإصبع). */
  const setCoverText = (next: CoverText) =>
    save({ subjects: subjects.map((s) => (s.id === id ? { ...subject, coverText: next } : s)) });

  /** زخرفة اللوحة (المربّعات) — "auto" اشتقاق تلقائي و"none" بلا زخرفة. */
  const setCoverPattern = (pattern: CoverPattern) =>
    save({ subjects: subjects.map((s) => (s.id === id ? { ...subject, coverPattern: pattern } : s)) });

  /** لون خلفية اللوحة — فارغ يعيدها لألوان الثيم. */
  const setCoverColor = (hex: string) =>
    save({ subjects: subjects.map((s) => (s.id === id ? { ...subject, coverColor: hex } : s)) });

  const uploadCover = async (file: File) => {
    setCoverUploading(true);
    const url = await uploadImage(file);
    setCoverUploading(false);
    if (url) save({ subjects: subjects.map((s) => (s.id === id ? { ...subject, cover: url } : s)) });
    if (coverRef.current) coverRef.current.value = "";
  };
  /*
    الترتيبُ داخل المادّة لا عبرها.
    كان السهمُ يبدّل الدرسَ بجاره في القائمة المسطّحة — وجارُه قد يكون في
    مادّةٍ أخرى، فيقفز الدرسُ بين البابين بضغطةٍ لم تُرِد ذلك. والنقلُ بين
    الموادّ له قائمتُه المنسدلة، وهو فعلٌ يُقصد لا يقع بالسهو.
  */
  const move = (uid: string, k: number, dir: -1 | 1) => {
    const u = units.find((x) => x.id === uid);
    if (!u) return;
    const arr = [...(u.lessons ?? [])];
    const j = k + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[k], arr[j]] = [arr[j], arr[k]];
    persistUnits(units.map((x) => (x.id === uid ? { ...x, lessons: arr } : x)));
  };

  return (
    <>
      <Link href="/admin/subjects" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-primary">
        <ArrowRight className="size-4" /> كل الكورسات
      </Link>
      <PageHeader title={`دروس: ${subject.name}`} subtitle={`${videos.length} درس · السعر ${subject.price.toLocaleString("ar-EG")} ج.م`} />

      {/*
        التصميمُ مفصولٌ عن العمل.
        غلافُ الكورس ونصُّه وصورُه تُضبط مرّةً عند إنشائه ثمّ لا تُمسّ؛
        وإضافةُ الدروس وترتيبُها عملٌ يوميّ. وجمعُهما في عمودٍ واحدٍ
        مفتوحٍ يجعل الأستاذ يمرّ على أربع لوحاتِ تصميمٍ كلَّ مرّةٍ يضيف
        فيها درساً. فالتصميمُ مطويٌّ والعملُ مفتوح.
      */}
      <p className="font-kufi mb-2 mt-2 text-[11px] font-bold text-muted-foreground">تصميم البطاقة</p>
      {/* غلاف الكورس */}
      <Section className="mb-6" title="غلاف الكورس" subtitle="الصورةُ التي تُرى على بطاقة الكورس" icon={<ImageIcon className="size-4" />}>
        <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
          مقاس البطاقة ثابت ولا يتمدّد. عند التكبير ١٠٠٪ تظهر صورتك <b>كاملة</b>؛ ولو أردت ملء الإطار
          كبّرها وحرّكها بنفسك — ما يخرج عن الإطار يُقصّ بإرادتك أنت لا تلقائياً.
        </p>
        <div className="flex flex-wrap items-start gap-5">
          <div className="w-full max-w-xs">
            <CourseArt seed={subject.id} title={subject.name} cover={subject.cover} coverFit={subject.coverFit} coverRatio={subject.coverRatio} coverColor={subject.coverColor} coverPattern={subject.coverPattern} coverText={subject.coverText} coverStickers={subject.coverStickers} progress={42} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="w-64"><span className="mb-1 block text-xs font-semibold text-muted-foreground">رابط صورة الغلاف</span>
              <input defaultValue={subject.cover ?? ""} dir="ltr" className="inp text-right"
                onBlur={(e) => save({ subjects: subjects.map((s) => (s.id === id ? { ...subject, cover: e.target.value.trim() } : s)) })}
                placeholder="https://…" />
            </label>
            <input ref={coverRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f); }} />
            <Button variant="outline" onClick={() => coverRef.current?.click()} disabled={coverUploading}>
              <Upload className="size-4" /> {coverUploading ? "جارٍ الرفع…" : "رفع غلاف"}
            </Button>
            {subject.cover && (
              <button onClick={() => save({ subjects: subjects.map((s) => (s.id === id ? { ...subject, cover: "" } : s)) })}
                className="rounded-full border border-border px-4 py-2 text-xs font-bold text-rose-500 transition hover:border-rose-500">إزالة الغلاف</button>
            )}

            {/* لون خلفية اللوحة — يظهر خلف الزخرفة، وكاملاً إن لم يكن هناك غلاف */}
            <div className="mt-2 w-64">
              <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">لون خلفية الغلاف</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setCoverColor("")}
                  title="ألوان الثيم"
                  className={`grid size-8 place-items-center rounded-xl border text-[9px] font-bold transition ${
                    !subject.coverColor ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"
                  }`}
                  style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))", color: "#fff" }}
                >
                  ثيم
                </button>
                {COVER_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setCoverColor(c.hex)}
                    title={c.label}
                    aria-label={c.label}
                    className={`size-8 rounded-xl border transition ${
                      subject.coverColor?.toLowerCase() === c.hex ? "border-primary ring-2 ring-primary/40" : "border-border hover:border-primary/50"
                    }`}
                    style={{ background: c.hex }}
                  />
                ))}
                <label
                  title="لون مخصّص"
                  className="grid size-8 cursor-pointer place-items-center rounded-xl border border-dashed border-border transition hover:border-primary/50"
                  style={{ background: subject.coverColor || "transparent" }}
                >
                  <input
                    type="color"
                    className="size-0 opacity-0"
                    value={subject.coverColor || "#233b8b"}
                    onChange={(e) => setCoverColor(e.target.value)}
                  />
                  {!subject.coverColor && <Palette className="size-4 text-muted-foreground" />}
                </label>
              </div>
              <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">
                يظهر خلف الزخرفة الهندسية، وفي الهوامش حول الصورة — والمعاينة على اليمين تتغيّر فوراً.
              </p>
            </div>
          </div>

          {/* زخرفة اللوحة — المربّعات خلف الصورة */}
          <div className="w-full">
            <span className="lbl">زخرفة الغلاف</span>
            <div className="flex flex-wrap items-center gap-2">
              {([{ id: "auto", label: "تلقائي" }, { id: "none", label: "بلا زخرفة" }] as const).map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setCoverPattern(o.id)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
                    (subject.coverPattern ?? "auto") === o.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  {o.label}
                </button>
              ))}
              {COVER_PATTERNS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setCoverPattern(o.id)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
                    subject.coverPattern === o.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              «تلقائي» يختار نمطاً ثابتاً من معرّف الكورس فيبقى لكل كورس هويّة مميّزة، و«بلا زخرفة» تترك الخلفية سادة.
            </p>
          </div>

          {/* محاذاة الغلاف وضبطه */}
          {subject.cover && (
            <div className="grid min-w-56 flex-1 gap-3 self-center">
              <div>
                <span className="lbl">شكل الحواف</span>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: "arch", label: "قوس" },
                    { id: "rounded", label: "دائرية" },
                    { id: "square", label: "مستقيمة" },
                  ] as const).map((o) => (
                    <button key={o.id} type="button" onClick={() => setCoverFit({ shape: o.id })}
                      className={`rounded-2xl border px-3 py-2 text-xs font-bold transition ${
                        (subject.coverFit?.shape ?? ((subject.coverFit?.frame ?? "fixed") === "image" ? "rounded" : "arch")) === o.id
                          ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"
                      }`}>{o.label}</button>
                  ))}
                </div>
              </div>

              <CoverSlider label="انحناء الحواف" value={subject.coverFit?.radius ?? 22} min={0} max={48} step={1}
                display={`${subject.coverFit?.radius ?? 22}`} onChange={(v) => setCoverFit({ radius: v })} />
              <CoverSlider label="التكبير" value={subject.coverFit?.scale ?? 1} min={0.6} max={2.5} step={0.02}
                display={`${Math.round((subject.coverFit?.scale ?? 1) * 100)}٪`} onChange={(v) => setCoverFit({ scale: v })} />
              <CoverSlider label="الإزاحة الأفقية" value={subject.coverFit?.x ?? 0} min={-40} max={40} step={1}
                display={`${subject.coverFit?.x ?? 0}٪`} onChange={(v) => setCoverFit({ x: v })} />
              <CoverSlider label="الإزاحة الرأسية" value={subject.coverFit?.y ?? 0} min={-40} max={40} step={1}
                display={`${subject.coverFit?.y ?? 0}٪`} onChange={(v) => setCoverFit({ y: v })} />
              <button onClick={() => setCoverFit({ shape: "arch", radius: 22, x: 0, y: 0, scale: 1 })}
                className="w-fit rounded-full border border-border px-4 py-2 text-xs font-bold transition hover:border-primary hover:text-primary">
                إعادة الضبط
              </button>
            </div>
          )}
        </div>
      </Section>

      {/* نصّ على الغلاف */}
      <Section className="mb-6" title="نصّ الغلاف" subtitle="كلمةٌ تُكتب فوق الصورة وتُحرَّك بالسحب" icon={<Palette className="size-4" />}>
        <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
          اكتب نصّاً يظهر فوق لوحة الغلاف، ثم اسحبه بالماوس إلى مكانه. الموضع يُحفظ بالنسبة
          المئوية فيبقى في مكانه على بطاقة الطالب الصغيرة وعلى المعاينة الكبيرة سواء.
        </p>
        <CoverTextEditor subject={subject} onChange={setCoverText} />
      </Section>

      {/* صور على الغلاف */}
      <Section className="mb-6" title="ملصقات الغلاف" subtitle="صورٌ صغيرةٌ تُلصق فوق الغلاف" icon={<ImageIcon className="size-4" />}>
        <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
          ارفع صورة — تُفتح أداة القصّ وإزالة الخلفية أولاً — ثم اسحبها بالماوس إلى مكانها
          واضبط حجمها ودورانها وشفافيتها. الصور تُرسم تحت نصّ الغلاف ليبقى النصّ فوقها.
        </p>
        <CoverStickersEditor subject={subject} onChange={setCoverStickers} />
      </Section>

      {/* أسعار الكورس */}
      {/*
        ما يحدث حين يضغط طالبٌ لا يملك الكورس.
        كان واحداً لا خيارَ فيه: يُساق إلى بوّابة الدفع فوراً. وهو يصلح
        لكورسٍ يُباع كتلةً واحدة، ولا يصلح لمنهجٍ طويلٍ يريد الطالبُ منه
        باباً أو بابين — فيُساق إلى دفع المنهج كلِّه أو ينصرف.
      */}
      <Section
        className="mb-6"
        title="عند الضغط على الكورس"
        subtitle="ماذا يرى طالبٌ لا يملكه — بوّابةَ الدفع أم موادَّ يشتري منها"
        icon={<Wallet className="size-4" />}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {([
            { id: "gateway", title: "بوّابة الدفع مباشرة", hint: "الكورسُ يُباع كتلةً واحدة — يُساق إلى خطط شرائه فوراً." },
            { id: "materials", title: "موادّ الكورس", hint: "تُفتح له الموادُّ وفي كلٍّ سعرُها وزرُّ شرائها — يشتري ما يحتاج ويترك ما لا يحتاج." },
          ] as const).map((m) => {
            const on = (subject.entryMode ?? "gateway") === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => save({ subjects: subjects.map((s) => (s.id === id ? { ...subject, entryMode: m.id } : s)) })}
                className={`rounded-2xl border p-3 text-right transition ${
                  on ? "border-primary bg-primary/5 ring-2 ring-primary/25" : "border-border hover:border-primary/40"
                }`}
              >
                <span className="block text-sm font-bold">{m.title}</span>
                <span className="mt-0.5 block text-[11px] leading-relaxed text-muted-foreground">{m.hint}</span>
              </button>
            );
          })}
        </div>
        {/*
          وضعُ «الموادّ» في كورسٍ بلا موادّ لا يفعل شيئاً.
          الكورسُ غيرُ المقسَّم له مادّةٌ واحدةٌ ملفوفةٌ لا تُباع وحدَها، فمن
          ضبطه على البيع المفرَّق ولم يقسّمه رأى بوّابةَ الدفع كما كان —
          وظنّ الإعدادَ معطّلاً. فيُقال له ما ينقص.
        */}
        {(subject.entryMode ?? "gateway") === "materials" && !isSplit(subject) && (
          <p className="mt-3 rounded-2xl bg-rose-500/10 px-3 py-2 text-[11px] font-bold leading-relaxed text-rose-600 dark:text-rose-400">
            هذا الكورس لم يُقسَّم إلى موادّ بعد — فلا شيءَ يُباع مفرَّقاً، ويبقى الطالبُ
            يُساق إلى بوّابة الدفع كما كان. أضِف موادَّ من الأسفل أوّلاً.
          </p>
        )}
        {(subject.entryMode ?? "gateway") === "materials" && isSplit(subject) && (
          <p className="mt-3 rounded-2xl bg-amber-500/10 px-3 py-2 text-[11px] font-bold leading-relaxed text-amber-700 dark:text-amber-400">
            في هذا الوضع تُفتح للطالب موادُّ الكورس ليشتري ما يحتاج. وتُسعَّر كلُّ مادّةٍ
            من <b>بوّابة الدفع</b>: أنشئ خطّةً نطاقُها «موادّ مختارة» وأشّر على المادّة.
            والمادّةُ التي لا تفتحها خطّةٌ تبقى مقفلةً بلا زرِّ شراء.
          </p>
        )}
      </Section>

      {/*
        الأسعارُ ليست هنا — ولا يُترك مكانُها فارغاً بلا بيان.
        كانت تُضاف في الكورس وفي المادّة وفي الخطّة معاً، فيصير للشيء
        الواحد سعران أو ثلاثة لا يُعرف أيُّها يُحصَّل. فصار مصدرُها واحداً:
        بوّابة الدفع. وهذا السطرُ يدلّ عليه، وإلّا بحث الأستاذُ عن الحقل
        الذي كان هنا وظنّ أنّه عُطّل.
      */}
      <Section
        className="mb-6"
        title="السعر ومدّة التفعيل"
        subtitle="مصدرُهما بوّابةُ الدفع — سعرٌ واحدٌ في موضعٍ واحد"
        icon={<Wallet className="size-4" />}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display font-extrabold">السعر ومدّة التفعيل</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              تُضبَطان من <b>بوّابة الدفع</b> لا من هنا — سعرٌ واحدٌ في موضعٍ واحد.
              أنشئ خطّةً هناك وحدّد ما تفتحه: الكورسَ كلَّه، أو موادَّ منه تؤشّر عليها،
              وسعرَها ومدّتها.
            </p>
          </div>
          <Link
            href="/admin/plans"
            className="btn-glow inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold text-white"
          >
            <Wallet className="size-4" /> افتح بوّابة الدفع
          </Link>
        </div>
      </Section>

      {/* إضافة درس */}
      <Section className="mb-6" title="إضافة درس" subtitle="عنوانُ الدرس ورابطُه والمادّةُ التي يقع فيها" icon={<Plus className="size-4" />}>
        <div className="grid gap-3 sm:grid-cols-6">
          <label className="sm:col-span-2"><span className="mb-1 block text-xs font-semibold text-muted-foreground">عنوان الدرس</span>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="inp" placeholder="مثال: مقدّمة في علوم القرآن" />
          </label>
          <label className="sm:col-span-3"><span className="mb-1 block text-xs font-semibold text-muted-foreground">رابط الفيديو</span>
            <div className="flex gap-2">
              <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} dir="ltr" className="inp text-right" placeholder="YouTube / Google Drive / Bunny / mp4" />
              <input ref={videoRef} type="file" accept="video/*" hidden onChange={async (e) => {
                const file = e.target.files?.[0]; if (!file) return;
                setUploading("video");
                const url = await uploadImage(file);
                setUploading(null);
                if (url) setForm((f) => ({ ...f, url, title: f.title || file.name.replace(/\.[^.]+$/, "") }));
                if (videoRef.current) videoRef.current.value = "";
              }} />
              <button type="button" onClick={() => videoRef.current?.click()} disabled={uploading === "video"}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-2xl border border-primary/40 px-3 text-xs font-bold text-primary transition hover:bg-primary/10 disabled:opacity-60">
                {uploading === "video" ? <Loader2 className="size-4 animate-spin" /> : <Video className="size-4" />}
                {driveOn ? "رفع إلى Drive" : "رفع"}
              </button>
            </div>
            <span className="mt-1 block text-[11px] text-muted-foreground">
              الصق رابطاً جاهزاً، أو ارفع الملف {driveOn ? "ليُخزَّن في Google Drive الحساب المربوط ويُملأ الرابط تلقائياً" : "ليُحفظ على الخادم"}.
            </span>
          </label>
          <label><span className="mb-1 block text-xs font-semibold text-muted-foreground">المدة</span>
            <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="inp" placeholder="١٢:٣٠" />
          </label>
          {/*
            المادّةُ المقصودة — تظهر حين تكون هناك موادٌّ يُختار بينها.
            وواحدةٌ لا اختيارَ فيها، فإظهارُ قائمةٍ بخيارٍ واحدٍ حشو.
          */}
          {units.length > 1 && (
            <label className="sm:col-span-5"><span className="mb-1 block text-xs font-semibold text-muted-foreground">تُضاف إلى مادّة</span>
              <select value={units.some((u) => u.id === intoUnit) ? intoUnit : units[units.length - 1].id}
                onChange={(e) => setIntoUnit(e.target.value)} className="inp">
                {units.map((u) => <option key={u.id} value={u.id}>{u.title}</option>)}
              </select>
            </label>
          )}
          <label className="flex items-center gap-2 sm:col-span-5">
            <input type="checkbox" checked={form.isFree} onChange={(e) => setForm({ ...form, isFree: e.target.checked })} className="size-4 accent-[hsl(var(--primary))]" />
            <span className="text-sm text-muted-foreground">درس تجريبي مجاني (يظهر لغير المشتركين)</span>
          </label>
          <div className="flex items-end">
            <Button className="w-full px-5 py-2.5" onClick={add}><Plus className="size-4" /> إضافة</Button>
          </div>
        </div>
      </Section>

      {/* ---------- الموادّ ودروسُها ---------- */}
      <Section
        className="mb-6"
        title="موادّ الكورس ودروسُها"
        subtitle="المسار: الكورس ← مادّة ← دروس. قسّم المنهجَ أبواباً فيقرأ الطالبُ منهجاً لا قائمةَ فيديوهات."
        icon={<Layers className="size-4" />}
        count={units.length}
        actions={<Button className="px-4 py-2 text-xs" onClick={addUnit}>+ إضافة مادّة</Button>}
      >

      {videos.length === 0 && units.length === 1 ? (
        <p className="rounded-3xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">لا توجد دروس بعد. أضِف أول درس بالأعلى.</p>
      ) : (
        /*
          المادّةُ بطاقةٌ بغلافها لا طيّةٌ في قائمة.
          الطيُّ يُخفي المادّةَ خلف سطرٍ نصّيّ، والأستاذُ يتنقّل بين موادّه
          بالنظر لا بالقراءة. فصار لكلّ مادّةٍ غلافٌ ببذرتها — فتُعرف من
          لوحتها قبل اسمها — ودروسُها تحتها بأغلفتها.
        */
        <div className={openUnit ? "grid gap-5" : "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"}>
          {units
            .filter((u) => !openUnit || u.id === openUnit)
            .map((unit) => {
              const ui = units.findIndex((x) => x.id === unit.id);
              return (
            <div key={unit.id} className="overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-bento">
              {/* ---------- ترويسةُ المادّة: غلافٌ واسمٌ وإجراءات ---------- */}
              <div className="flex flex-wrap items-center gap-3 border-b border-border p-3 sm:p-4">
                {/*
                  الغلافُ هو البابُ حين تكون المادّةُ مغلقة — لا زرٌّ صغيرٌ
                  بجانبه. أكبرُ ما في البطاقة أولى بأن يكون مقبضَها.
                */}
                <button
                  type="button"
                  onClick={() => setOpenUnit(openUnit === unit.id ? null : unit.id)}
                  title={openUnit === unit.id ? "إغلاق المادّة" : "افتح دروس المادّة"}
                  className="relative w-24 shrink-0 overflow-hidden rounded-2xl sm:w-28"
                >
                  <CourseArt seed={unit.id} title={unit.title} className="aspect-[16/9] w-full" />
                  <span className="absolute inset-0 grid place-items-center bg-black/25 text-white transition hover:bg-black/10">
                    {openUnit === unit.id ? <X className="size-5" /> : <ListVideo className="size-5" />}
                  </span>
                </button>

                <div className="min-w-0 flex-1">
                  {/*
                    العنوانُ حقلٌ يُكتب فيه مباشرةً — لا زرَّ «إعادة تسمية»
                    يفتح نافذة. والتسميةُ أكثرُ ما يُفعل بالمادّة، فجعلُها
                    ثلاثَ نقراتٍ يجعل الأستاذ يتركها بأسمائها الافتراضيّة.
                  */}
                  <input
                    value={unit.title}
                    onChange={(e) => renameUnit(unit.id, e.target.value)}
                    className="w-full rounded-xl border border-transparent bg-transparent px-2 py-1 text-base font-bold outline-none transition hover:border-border focus:border-primary/50 focus:bg-background"
                  />
                  <p className="mt-0.5 px-2 text-[11px] text-muted-foreground">
                    {(unit.lessons ?? []).length.toLocaleString("ar-EG")} درساً
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button onClick={() => moveUnit(ui, -1)} disabled={ui === 0} title="أعلى"
                    className="grid size-8 place-items-center rounded-full border border-border text-muted-foreground transition hover:text-primary disabled:opacity-30">▲</button>
                  <button onClick={() => moveUnit(ui, 1)} disabled={ui === units.length - 1} title="أسفل"
                    className="grid size-8 place-items-center rounded-full border border-border text-muted-foreground transition hover:text-primary disabled:opacity-30">▼</button>
                  <button onClick={() => removeUnit(unit.id)} disabled={units.length <= 1}
                    title="حذف المادّة — دروسُها تنتقل إلى ما قبلها ولا تُحذف"
                    className="grid size-8 place-items-center rounded-full border border-border text-rose-500 transition hover:border-rose-500 disabled:opacity-30">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* ---------- دروسُ المادّة — للمفتوحة وحدَها ---------- */}
              {openUnit === unit.id && (
              <div className="p-3 sm:p-4">
                            {(unit.lessons ?? []).length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">مادّةٌ فارغة — اختَرها في نموذج الإضافة بالأعلى.</p>
              ) : (
        /*
          الدروسُ بطاقاتٌ بأغلفتها لا صفوفَ قائمة.
          الدرسُ ليس سطرَ نصّ: له غلافٌ يراه الطالبُ في بوابته، ومدّةٌ
          واختبارٌ ومرفقات. والصفُّ يُخفي الغلافَ كلَّه — وهو أوّلُ ما
          يميّز درساً عن درس. والغلافُ هنا `CourseArt` ببذرة الدرس، فلكلّ
          درسٍ لوحتُه ولا تتشابه.
        */
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {(unit.lessons ?? []).map((v, i) => (
            <div key={v.id} className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition hover:border-primary/40">
              <div className="relative">
                <CourseArt seed={v.id} title={v.title} className="aspect-[16/9] w-full" />
                <span className="absolute inset-0 grid place-items-center bg-black/25 text-white transition hover:bg-black/10">
                  <PlayCircle className="size-8 drop-shadow" />
                </span>
                <span className="absolute right-2 top-2 flex items-center gap-1.5">
                  {v.isFree && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      <Gift className="size-3" /> مجاني
                    </span>
                  )}
                  {v.duration && (
                    <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white">{v.duration}</span>
                  )}
                </span>
                {/* الترتيبُ يُبدَّل من الغلاف — أكثرُ ما يُفعل بالدرس بعد إضافته */}
                <span className="absolute bottom-2 right-2 flex overflow-hidden rounded-full border border-white/25 bg-black/55 text-white">
                  <button onClick={() => move(unit.id, i, -1)} disabled={i === 0} title="أعلى"
                    className="px-2 py-0.5 text-[11px] transition hover:bg-white/15 disabled:opacity-30">▲</button>
                  <button onClick={() => move(unit.id, i, 1)} disabled={i === (unit.lessons ?? []).length - 1} title="أسفل"
                    className="px-2 py-0.5 text-[11px] transition hover:bg-white/15 disabled:opacity-30">▼</button>
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-2.5 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">
                    {(i + 1).toLocaleString("ar-EG")}. {v.title}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground" dir="ltr">{v.url}</p>
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-1.5">
                  <button onClick={() => setQuizFor(quizFor === v.id ? null : v.id)} title="اختبار الدرس"
                    className={`inline-flex flex-1 items-center justify-center gap-1 rounded-2xl border px-2.5 py-1.5 text-[11px] font-bold transition ${
                      v.quiz?.enabled ? "border-emerald-500/40 text-emerald-500" : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                    }`}>
                    <ListChecks className="size-3.5" />
                    {v.quiz?.enabled ? `اختبار (${v.quiz.questions.length.toLocaleString("ar-EG")})` : "اختبار"}
                    <ChevronDown className={`size-3 transition ${quizFor === v.id ? "rotate-180" : ""}`} />
                  </button>
                  {units.length > 1 && (
                    <select value={unit.id} onChange={(e) => moveLessonTo(v.id, e.target.value)} title="نقل إلى مادّة"
                      className="max-w-[7.5rem] rounded-2xl border border-border bg-card/60 px-2 py-1.5 text-[11px] font-bold outline-none focus:border-primary/50">
                      {units.map((u) => <option key={u.id} value={u.id}>{u.title}</option>)}
                    </select>
                  )}
                  <button onClick={() => remove(v.id)} title="حذف"
                    className="grid size-8 shrink-0 place-items-center rounded-2xl border border-border text-rose-500 transition hover:border-rose-500">
                    <Trash2 className="size-4" />
                  </button>
                </div>

                {quizFor === v.id && (
                  <QuizEditor lesson={v} onChange={(q) => setQuiz(v.id, q)} results={quizStats(v.id)} />
                )}
              </div>
            </div>
          ))}
        </div>
              )}
              </div>
              )}
            </div>
              );
            })}
        </div>
      )}

      </Section>

      {/* مواد وملفات الكورس */}
      <Section
        className="mb-6"
        title="ملفّات الكورس"
        subtitle="مذكّراتٌ وملازمُ PDF يفتحها الطالبُ مع الدروس"
        icon={<FileText className="size-4" />}
      >
      <div>
        <Card className="mb-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="min-w-40 flex-1"><span className="mb-1 block text-xs font-semibold text-muted-foreground">عنوان الملف</span>
              <input value={mat.title} onChange={(e) => setMat({ ...mat, title: e.target.value })} className="inp" placeholder="مثال: مذكّرة النحو" />
            </label>
            <label className="min-w-56 flex-[2]"><span className="mb-1 block text-xs font-semibold text-muted-foreground">رابط الملف</span>
              <input value={mat.url} onChange={(e) => setMat({ ...mat, url: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addMaterial()} dir="ltr" className="inp text-right" placeholder="https://drive.google.com/… أو رابط PDF مباشر" />
            </label>
            <Button className="px-5 py-2.5" onClick={addMaterial}><Link2 className="size-4" /> إضافة بالرابط</Button>
            <input ref={matRef} type="file" hidden onChange={async (e) => {
              const file = e.target.files?.[0]; if (!file) return;
              setUploading("material");
              const url = await uploadImage(file);
              setUploading(null);
              if (url) persistMats([...materials, { id: `M-${Date.now()}`, title: mat.title.trim() || file.name, url }]);
              setMat({ title: "", url: "" });
              if (matRef.current) matRef.current.value = "";
            }} />
            <Button variant="outline" className="px-5 py-2.5" onClick={() => matRef.current?.click()} disabled={uploading === "material"}>
              {uploading === "material" ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              {driveOn ? "رفع إلى Drive" : "رفع ملف"}
            </Button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            أضِف الملف برابط خارجي، أو ارفعه {driveOn ? "إلى Google Drive الحساب المربوط" : "إلى خادم المنصّة"}.
          </p>
        </Card>
        {materials.length > 0 && (
          <div className="space-y-2">
            {materials.map((m) => (
              <Card key={m.id} className="!p-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-2xl bg-primary/12 text-primary"><FileText className="size-5" /></span>
                  <a href={m.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate font-semibold hover:text-primary">{m.title}</a>
                  <button onClick={() => removeMaterial(m.id)} title="حذف" className="grid size-8 place-items-center rounded-full border border-border text-rose-500 transition hover:border-rose-500"><Trash2 className="size-4" /></button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      </Section>
    </>
  );
}


/** منزلق ضبط الغلاف. */
function CoverSlider({
  label, value, min, max, step, display, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number; display: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-xs font-semibold text-muted-foreground">
        {label} <span className="font-bold text-primary">{display}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[hsl(var(--primary))]" />
    </label>
  );
}
