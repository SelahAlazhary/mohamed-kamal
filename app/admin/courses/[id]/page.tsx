"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Plus, Trash2, PlayCircle, Gift, FileText, Upload, ImageIcon,
  ListChecks, ChevronDown, Check, Link2, X, Loader2, Video, Palette,
} from "lucide-react";
import { Collapse } from "@/components/dashboard/collapse";
import { courseUnits, LEGACY_UNIT_ID } from "@/lib/course-units";
import { PageHeader, Card } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/primitives";
import { useContent } from "@/components/content/content-provider";
import { CourseArt, COVER_PATTERNS } from "@/components/brand/course-art";
import { CoverTextEditor } from "@/components/admin/cover-text-editor";
import { CoverStickersEditor } from "@/components/admin/cover-stickers-editor";
import { CoursePricesEditor } from "@/components/admin/course-prices-editor";
import type { Lesson, Material, Subject, Quiz, QuizQuestion, ImageFit, CoverPattern, CoverText, CoverSticker, Unit } from "@/lib/types";
import { mediaSrc } from "@/lib/media";

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
  /** الوحدةُ التي يُضاف إليها الدرسُ الجديد. */
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
    الوحداتُ هي مصدرُ الحقيقة، و`videos` مرآةٌ لها.
    ------------------------------------------------------------
    والمرآةُ مقصودة: أربعةٌ وخمسون كورساً وعشرةُ قرّاءٍ في الشيفرة يقرؤون
    `videos`. فلو صارت الوحداتُ وحدَها هي المكتوبة لوجب تغييرُ العشرة
    دفعةً واحدة، ويكفي أن يُنسى واحدٌ ليقرأ كورساً فارغاً. فالكتابةُ
    تُحدّثهما معاً: القديمُ يقرأ ما يعرف، والجديدُ يقرأ الوحدات.

    ولا تُكتب `units` حتّى يُقسّم الأستاذُ فعلاً — فكورسٌ لم يُقسَّم يبقى
    في القاعدة كما كان، ولا يتبدّل شكلُ أربعةٍ وخمسين كورساً لأنّ أحدَها
    فُتح.
  */
  const units = courseUnits(subject);
  const videos = units.flatMap((u) => u.lessons ?? []);

  const persistUnits = (next: Unit[]) => {
    const flat = next.flatMap((u) => u.lessons ?? []);
    const split = next.length > 1 || next[0]?.id !== LEGACY_UNIT_ID;
    const updated: Subject = {
      ...subject,
      units: split ? next : [],
      videos: flat,
      lessons: flat.length,
    };
    save({ subjects: subjects.map((s) => (s.id === id ? updated : s)) });
  };

  /** يمرّ على دروس الوحدات كلِّها — للاختبار والتعديل الموضعيّ. */
  const mapLessons = (fn: (l: Lesson) => Lesson) =>
    persistUnits(units.map((u) => ({ ...u, lessons: (u.lessons ?? []).map(fn) })));

  const add = () => {
    if (!form.title.trim() || !form.url.trim()) return;
    const lesson: Lesson = { id: `L-${Date.now()}`, title: form.title.trim(), url: form.url.trim(), duration: form.duration.trim() || undefined, isFree: form.isFree };
    /* يُضاف إلى الوحدة المختارة، أو إلى آخر وحدةٍ إن لم تُختر واحدة. */
    const target = units.some((u) => u.id === intoUnit) ? intoUnit : units[units.length - 1].id;
    persistUnits(units.map((u) => (u.id === target ? { ...u, lessons: [...(u.lessons ?? []), lesson] } : u)));
    setForm({ title: "", url: "", duration: "", isFree: false });
  };
  const remove = (lid: string) =>
    persistUnits(units.map((u) => ({ ...u, lessons: (u.lessons ?? []).filter((v) => v.id !== lid) })));
  /** تحديث اختبار درس (تشغيل/إيقاف + الأسئلة). */
  const setQuiz = (lid: string, quiz: Quiz | undefined) =>
    mapLessons((v) => (v.id === lid ? { ...v, quiz } : v));

  /* ---------- إدارةُ الوحدات ---------- */
  const addUnit = () => {
    /*
      أوّلُ إضافةٍ تُثبّت الوحدةَ الملفوفة وحدةً حقيقيّةً بمعرّفٍ خاصّ بها.
      ولولا ذلك لبقي معرّفُها `u-legacy` فيظنّها المُخزِّن غيرَ مقسَّمةٍ
      ويكتبها مسطّحةً — فتضيع الوحدةُ الثانيةُ فورَ إنشائها.
    */
    const base = units[0]?.id === LEGACY_UNIT_ID
      ? [{ ...units[0], id: `u${Date.now().toString(36)}`, title: "الوحدة الأولى" }]
      : units;
    persistUnits([...base, { id: `u${Date.now().toString(36)}x`, title: `الوحدة ${(base.length + 1).toLocaleString("ar-EG")}`, lessons: [] }]);
  };
  const renameUnit = (uid: string, title: string) =>
    persistUnits(units.map((u) => (u.id === uid ? { ...u, title } : u)));
  /** حذفُ وحدةٍ يُعيد دروسَها إلى ما قبلها — ولا يحذفها معها. */
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
  /** نقلُ درسٍ إلى وحدةٍ أخرى — يُنزع من موضعه ويُلحق بآخر المقصد. */
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
    الترتيبُ داخل الوحدة لا عبرها.
    كان السهمُ يبدّل الدرسَ بجاره في القائمة المسطّحة — وجارُه قد يكون في
    وحدةٍ أخرى، فيقفز الدرسُ بين البابين بضغطةٍ لم تُرِد ذلك. والنقلُ بين
    الوحدات له قائمتُه المنسدلة، وهو فعلٌ يُقصد لا يقع بالسهو.
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

      {/* غلاف الكورس */}
      <Card className="mb-6">
        <h3 className="mb-1 flex items-center gap-2 font-display font-extrabold"><ImageIcon className="size-5 text-primary" /> غلاف الكورس</h3>
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
      </Card>

      {/* نصّ على الغلاف */}
      <Card className="mb-6">
        <h3 className="mb-1 flex items-center gap-2 font-display font-extrabold">
          <ImageIcon className="size-5 text-primary" /> نصّ على الغلاف
        </h3>
        <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
          اكتب نصّاً يظهر فوق لوحة الغلاف، ثم اسحبه بالماوس إلى مكانه. الموضع يُحفظ بالنسبة
          المئوية فيبقى في مكانه على بطاقة الطالب الصغيرة وعلى المعاينة الكبيرة سواء.
        </p>
        <CoverTextEditor subject={subject} onChange={setCoverText} />
      </Card>

      {/* صور على الغلاف */}
      <Card className="mb-6">
        <h3 className="mb-1 flex items-center gap-2 font-display font-extrabold">
          <ImageIcon className="size-5 text-primary" /> صور على الغلاف
        </h3>
        <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
          ارفع صورة — تُفتح أداة القصّ وإزالة الخلفية أولاً — ثم اسحبها بالماوس إلى مكانها
          واضبط حجمها ودورانها وشفافيتها. الصور تُرسم تحت نصّ الغلاف ليبقى النصّ فوقها.
        </p>
        <CoverStickersEditor subject={subject} onChange={setCoverStickers} />
      </Card>

      {/* أسعار الكورس */}
      <Card className="mb-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-extrabold">أسعار هذا الكورس</h3>
            <p className="text-xs text-muted-foreground">
              أضف أكثر من خيار — شهري · ترم كامل · حصّة · مرّة واحدة — فيختار الطالب ما يناسبه
              من بوّابة الدفع. الخيار الأوّل هو السعر الأساسي المعروض في البطاقات.
            </p>
          </div>
          <label className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">السعر الأساسي</span>
            <input type="number" value={subject.price}
              onChange={(e) => save({ subjects: subjects.map((s) => (s.id === id ? { ...subject, price: Number(e.target.value) || 0 } : s)) })}
              className="w-24 rounded-2xl border border-border bg-card/60 px-3 py-2 text-sm outline-none focus:border-primary/50" />
            <span className="text-xs text-muted-foreground">ج.م</span>
          </label>
        </div>

        <CoursePricesEditor
          subject={subject}
          onChange={(patch) => save({ subjects: subjects.map((s) => (s.id === id ? { ...subject, ...patch } : s)) })}
        />
      </Card>

      {/* إضافة درس */}
      <Card className="mb-6">
        <h3 className="mb-4 font-display font-extrabold">إضافة درس</h3>
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
            الوحدةُ المقصودة — تظهر حين تكون هناك وحداتٌ يُختار بينها.
            وواحدةٌ لا اختيارَ فيها، فإظهارُ قائمةٍ بخيارٍ واحدٍ حشو.
          */}
          {units.length > 1 && (
            <label className="sm:col-span-5"><span className="mb-1 block text-xs font-semibold text-muted-foreground">تُضاف إلى وحدة</span>
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
      </Card>

      {/* ---------- الوحدات ودروسُها ---------- */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-extrabold">وحدات الكورس</h3>
          <p className="text-xs text-muted-foreground">
            المسار: <b>الكورس ← وحدة ← دروس</b>. قسّم المنهج أبواباً — الطهارة ثمّ الصلاة —
            فيقرأ الطالبُ منهجاً لا قائمةَ فيديوهات.
          </p>
        </div>
        <Button className="px-4 py-2 text-xs" onClick={addUnit}>+ إضافة وحدة</Button>
      </div>

      {videos.length === 0 && units.length === 1 ? (
        <p className="rounded-3xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">لا توجد دروس بعد. أضِف أول درس بالأعلى.</p>
      ) : (
        <div className="space-y-2">
          {units.map((unit, ui) => (
            <Collapse
              key={unit.id}
              defaultOpen={units.length === 1 || ui === 0}
              storageKey={`course.${id}.${unit.id}`}
              title={
                /*
                  العنوانُ حقلٌ يُكتب فيه مباشرةً — لا زرَّ «إعادة تسمية»
                  يفتح نافذة. والتسميةُ أكثرُ ما يُفعل بالوحدة، فجعلُها
                  ثلاثَ نقراتٍ يجعل الأستاذ يتركها بأسمائها الافتراضيّة.
                */
                <input
                  value={unit.title}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => renameUnit(unit.id, e.target.value)}
                  className="w-full rounded-xl border border-transparent bg-transparent px-2 py-1 text-sm font-bold outline-none transition hover:border-border focus:border-primary/50 focus:bg-card"
                />
              }
              count={(unit.lessons ?? []).length}
              actions={
                <>
                  <button onClick={() => moveUnit(ui, -1)} disabled={ui === 0} title="أعلى"
                    className="grid size-7 place-items-center rounded-full border border-border text-muted-foreground transition hover:text-primary disabled:opacity-30">▲</button>
                  <button onClick={() => moveUnit(ui, 1)} disabled={ui === units.length - 1} title="أسفل"
                    className="grid size-7 place-items-center rounded-full border border-border text-muted-foreground transition hover:text-primary disabled:opacity-30">▼</button>
                  <button onClick={() => removeUnit(unit.id)} disabled={units.length <= 1}
                    title="حذف الوحدة — دروسُها تنتقل إلى ما قبلها ولا تُحذف"
                    className="grid size-7 place-items-center rounded-full border border-border text-rose-500 transition hover:border-rose-500 disabled:opacity-30">
                    <Trash2 className="size-3.5" />
                  </button>
                </>
              }
            >
              {(unit.lessons ?? []).length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">وحدةٌ فارغة — اختَرها في نموذج الإضافة بالأعلى.</p>
              ) : (
        <div className="space-y-2">
          {(unit.lessons ?? []).map((v, i) => (
            <Card key={v.id} className="!p-3">
              <div className="flex items-center gap-3">
                <div className="flex flex-col text-muted-foreground">
                  <button onClick={() => move(unit.id, i, -1)} className="hover:text-primary disabled:opacity-30" disabled={i === 0}>▲</button>
                  <button onClick={() => move(unit.id, i, 1)} className="hover:text-primary disabled:opacity-30" disabled={i === (unit.lessons ?? []).length - 1}>▼</button>
                </div>
                <span className="grid size-9 place-items-center rounded-2xl bg-primary/12 text-primary"><PlayCircle className="size-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-semibold">{i + 1}. {v.title} {v.isFree && <Gift className="size-3.5 text-emerald-500" />}</p>
                  <p className="truncate text-[11px] text-muted-foreground" dir="ltr">{v.url}</p>
                </div>
                {v.duration && <span className="text-xs text-muted-foreground">{v.duration}</span>}
                <button onClick={() => setQuizFor(quizFor === v.id ? null : v.id)} title="اختبار الدرس"
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                    v.quiz?.enabled ? "border-emerald-500/40 text-emerald-500" : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                  }`}>
                  <ListChecks className="size-4" />
                  {v.quiz?.enabled ? `اختبار (${v.quiz.questions.length})` : "اختبار"}
                  <ChevronDown className={`size-3 transition ${quizFor === v.id ? "rotate-180" : ""}`} />
                </button>
                {units.length > 1 && (
                  <select value={unit.id} onChange={(e) => moveLessonTo(v.id, e.target.value)} title="نقل إلى وحدة"
                    className="rounded-full border border-border bg-card/60 px-2.5 py-1.5 text-xs font-bold outline-none focus:border-primary/50">
                    {units.map((u) => <option key={u.id} value={u.id}>{u.title}</option>)}
                  </select>
                )}
                <button onClick={() => remove(v.id)} title="حذف" className="grid size-8 place-items-center rounded-full border border-border text-rose-500 transition hover:border-rose-500"><Trash2 className="size-4" /></button>
              </div>
              {quizFor === v.id && (
                <QuizEditor lesson={v} onChange={(q) => setQuiz(v.id, q)} results={quizStats(v.id)} />
              )}
            </Card>
          ))}
        </div>
              )}
            </Collapse>
          ))}
        </div>
      )}

      {/* مواد وملفات الكورس */}
      <div className="mt-8">
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-extrabold"><FileText className="size-5 text-primary" /> المواد والملفات (PDF…)</h3>
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

      <style>{`.inp{width:100%;border-radius:0.9rem;border:1px solid hsl(var(--border));background:hsl(var(--card)/0.6);padding:0.55rem 0.8rem;font-size:0.85rem;outline:none;color:inherit;font-family:inherit}.inp:focus{border-color:hsl(var(--primary)/0.6)}.lbl{margin-bottom:0.35rem;display:block;font-size:0.7rem;font-weight:600;color:hsl(var(--muted-foreground))}`}</style>
    </>
  );
}

/* ---------- محرّر الاختبار التفاعلي لدرس واحد (اختياري) ---------- */
function QuizEditor({
  lesson, onChange, results,
}: {
  lesson: Lesson;
  onChange: (q: Quiz | undefined) => void;
  results: { attempts: number; avg: number; passed: number };
}) {
  const quiz: Quiz = lesson.quiz ?? { enabled: false, passScore: 60, questions: [] };
  const [q, setQ] = useState({ text: "", options: ["", "", "", ""], correct: 0 });

  const update = (patch: Partial<Quiz>) => onChange({ ...quiz, ...patch });
  const addQuestion = () => {
    const options = q.options.map((o) => o.trim()).filter(Boolean);
    if (!q.text.trim() || options.length < 2) return;
    const correct = Math.min(q.correct, options.length - 1);
    const item: QuizQuestion = { id: `Q-${Date.now()}`, text: q.text.trim(), options, correct };
    update({ enabled: true, questions: [...quiz.questions, item] });
    setQ({ text: "", options: ["", "", "", ""], correct: 0 });
  };
  const removeQuestion = (qid: string) =>
    update({ questions: quiz.questions.filter((x) => x.id !== qid) });
  const setOption = (i: number, v: string) =>
    setQ((prev) => ({ ...prev, options: prev.options.map((o, k) => (k === i ? v : o)) }));

  return (
    <div className="mt-3 rounded-2xl border border-border bg-muted/30 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold">
          <input type="checkbox" checked={quiz.enabled} onChange={(e) => update({ enabled: e.target.checked })} className="size-4 accent-[hsl(var(--primary))]" />
          تفعيل اختبار تفاعلي على هذا الفيديو
        </label>
        <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          نسبة النجاح
          <input type="number" min={0} max={100} value={quiz.passScore ?? 60}
            onChange={(e) => update({ passScore: Math.max(0, Math.min(100, Number(e.target.value))) })}
            className="w-20 rounded-xl border border-border bg-card/60 px-2 py-1 text-xs outline-none" />
          ٪
        </label>
        {results.attempts > 0 && (
          <span className="text-xs text-muted-foreground">
            {results.attempts.toLocaleString("ar-EG")} محاولة · متوسط {results.avg}٪ · ناجح {results.passed.toLocaleString("ar-EG")}
          </span>
        )}
      </div>

      {quiz.questions.length > 0 && (
        <div className="mb-4 space-y-2">
          {quiz.questions.map((item, i) => (
            <div key={item.id} className="rounded-2xl border border-border bg-card/50 p-3">
              <div className="flex items-start gap-2">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/12 text-xs font-bold text-primary">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{item.text}</p>
                  <ul className="mt-1 flex flex-wrap gap-2 text-xs">
                    {item.options.map((o, k) => (
                      <li key={k} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${k === item.correct ? "bg-emerald-500/15 font-bold text-emerald-500" : "bg-muted text-muted-foreground"}`}>
                        {k === item.correct && <Check className="size-3" />}{o}
                      </li>
                    ))}
                  </ul>
                </div>
                <button onClick={() => removeQuestion(item.id)} title="حذف السؤال" className="grid size-7 shrink-0 place-items-center rounded-full border border-border text-rose-500 transition hover:border-rose-500"><X className="size-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-2">
        <input value={q.text} onChange={(e) => setQ({ ...q, text: e.target.value })} className="inp" placeholder="نص السؤال…" />
        <div className="grid gap-2 sm:grid-cols-2">
          {q.options.map((o, i) => (
            <label key={i} className="flex items-center gap-2">
              <input type="radio" name={`correct-${lesson.id}`} checked={q.correct === i} onChange={() => setQ({ ...q, correct: i })} className="size-4 accent-[hsl(var(--primary))]" />
              <input value={o} onChange={(e) => setOption(i, e.target.value)} className="inp" placeholder={`الاختيار ${i + 1}${i === 0 ? " (حدّد الصحيح بالدائرة)" : ""}`} />
            </label>
          ))}
        </div>
        <Button className="w-fit px-5 py-2" onClick={addQuestion}><Plus className="size-4" /> إضافة السؤال</Button>
      </div>
    </div>
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
