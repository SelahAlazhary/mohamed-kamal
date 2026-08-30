"use client";

/**
 * نافذةُ «إدارة الدرس».
 * ------------------------------------------------------------------
 * الدرسُ أربعةُ أشياءَ لا شيءٌ واحد: عنوانُه ومدّتُه، وفيديوه، وواجبُه،
 * ومرفقاتُه. وكانت موزّعةً في ثلاثة مواضع — صفٌّ في جدول، ومحرّرُ واجبٍ
 * يُفتح تحته، وملفّاتٌ في قسمٍ آخرَ من الصفحة. فمن أراد إتمامَ درسٍ واحدٍ
 * تنقّل بين ثلاثة مواضعَ ولم يعرف ما نقص منه.
 *
 * فجُمعت في نافذةٍ واحدةٍ بأربعة تبويبات، والعدّادُ على التبويب يقول ما
 * فيه قبل فتحه — «المرفقات (٣)» و«الواجب ✓» — فيُعرف الناقصُ بنظرة.
 *
 * **والبنيةُ من التصميم الذي أرسله الأستاذ**، والألوانُ من هوية المنصّة:
 * كحليٌّ وذهبيٌّ وورق. ونقلُ الأسودِ والرماديِّ كما هما يجعل النافذةَ
 * غريبةً عن اللوحة التي تُفتح فوقها — والمقصودُ ترتيبُها لا استبدالُ
 * هويّتها.
 *
 * **ولا تُحفظ إلّا بالضغط.** الحقولُ تُجمع في حالةٍ محلّيّةٍ ثمّ تُكتب
 * دفعةً واحدة: نافذةٌ تحفظ مع كلّ حرفٍ تكتب في القاعدة عشراتِ المرّات،
 * ومن فتحها ليطّلع ثمّ أغلقها يجد نفسَه قد عدّل.
 */

import { useEffect, useMemo, useState } from "react";
import {
  X, FileText, Video, ListChecks, Paperclip, Plus, Trash2, Link2,
  Upload, Gift, Clock, Check, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { QuizEditor } from "@/components/admin/quiz-editor";
import type { Lesson, Material, Quiz } from "@/lib/types";

const ar = (n: number) => n.toLocaleString("ar-EG");

type Tab = "content" | "video" | "quiz" | "files";

/** يُتعرَّف على مزوّد الفيديو من الرابط — يُعرض ولا يُطلب من الأستاذ. */
function provider(url: string): { name: string; ok: boolean } {
  const u = (url ?? "").trim();
  if (!u) return { name: "لا رابط بعد", ok: false };
  if (u.includes("mediadelivery.net") || /^\d{3,7}\/[0-9a-f-]{20,}$/i.test(u)) return { name: "Bunny Stream", ok: true };
  if (u.includes("drive.google.com") || u.includes("googleusercontent.com")) return { name: "Google Drive", ok: true };
  if (u.includes("youtu.be") || u.includes("youtube.com")) return { name: "YouTube", ok: true };
  if (u.includes("vimeo.com")) return { name: "Vimeo", ok: true };
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(u)) return { name: "ملفّ فيديو مباشر", ok: true };
  return { name: "رابطٌ غيرُ معروف — قد لا يُشغَّل", ok: false };
}

export function LessonModal({
  lesson, courseName, unitName, onClose, onSave, quizResults,
}: {
  lesson: Lesson;
  courseName: string;
  unitName: string;
  onClose: () => void;
  onSave: (next: Lesson) => void;
  quizResults?: { attempts: number; avg: number; passed: number };
}) {
  const [tab, setTab] = useState<Tab>("content");
  const [draft, setDraft] = useState<Lesson>(lesson);
  const [link, setLink] = useState({ title: "", url: "" });

  /* درسٌ آخرُ يُفتح في النافذة نفسِها: تُعاد الحالةُ إليه ولا تبقى مسوّدةُ سابقه */
  useEffect(() => { setDraft(lesson); setTab("content"); }, [lesson]);

  /* الإغلاق بـEsc — ونافذةٌ لا تُغلق إلّا بالفأرة تُتعب من يكتب */
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  const files = draft.materials ?? [];
  const qCount = draft.quiz?.enabled ? (draft.quiz.questions?.length ?? 0) : 0;
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(lesson), [draft, lesson]);
  const p = provider(draft.url);

  const set = (patch: Partial<Lesson>) => setDraft((d) => ({ ...d, ...patch }));

  const addLink = () => {
    const t = link.title.trim();
    const u = link.url.trim();
    if (!t || !u) return;
    set({ materials: [...files, { id: `M-${Date.now().toString(36)}`, title: t, url: u }] });
    setLink({ title: "", url: "" });
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "content", label: "المحتوى", icon: <FileText className="size-3.5" /> },
    { id: "video", label: "الفيديو", icon: <Video className="size-3.5" />, badge: p.ok ? "✓" : undefined },
    { id: "quiz", label: "الواجب", icon: <ListChecks className="size-3.5" />, badge: qCount ? ar(qCount) : undefined },
    { id: "files", label: "المرفقات", icon: <Paperclip className="size-3.5" />, badge: files.length ? ar(files.length) : undefined },
  ];

  const fld = "w-full rounded-2xl border border-border bg-card/60 px-3.5 py-2.5 text-sm outline-none transition focus:border-primary/60";
  const lbl = "mb-1.5 block text-xs font-semibold text-muted-foreground";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/45 p-4 py-[6vh] backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-label="إدارة الدرس"
    >
      <div className="glass w-full max-w-2xl overflow-hidden rounded-[1.5rem] border border-border shadow-2xl">
        {/* الترويسة */}
        <div className="relative border-b border-border bg-gradient-to-l from-[hsl(var(--gold)/0.10)] to-transparent px-5 py-4">
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-[hsl(var(--gold))]" />
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="absolute start-4 top-4 grid size-8 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
          <h2 className="font-display text-lg font-extrabold">إدارة الدرس</h2>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {courseName} · {unitName}
          </p>
        </div>

        {/* التبويبات — شريطٌ مقسَّمٌ والمفتوحُ مرفوعٌ عنه */}
        <div className="border-b border-border px-5 pt-4">
          <div className="flex gap-1 rounded-2xl bg-muted/60 p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`font-kufi flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[11.5px] font-bold transition ${
                  tab === t.id
                    ? "bg-card text-foreground shadow-[0_1px_2px_rgba(16,24,40,.06),0_4px_10px_-6px_rgba(16,24,40,.3)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.icon}
                {t.label}
                {t.badge && (
                  <span className="rounded-full bg-[hsl(var(--gold)/0.3)] px-1.5 text-[9px] font-extrabold text-primary">
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[58vh] overflow-y-auto p-5">
          {tab === "content" && (
            <div className="grid gap-3">
              <label className="block">
                <span className={lbl}>عنوان الدرس</span>
                <input value={draft.title} onChange={(e) => set({ title: e.target.value })} className={fld} />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className={lbl}>المدّة</span>
                  <span className="relative block">
                    <Clock className="pointer-events-none absolute end-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input value={draft.duration ?? ""} onChange={(e) => set({ duration: e.target.value || undefined })} className={`${fld} pe-9`} placeholder="١٢:٤٠" />
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 self-end rounded-2xl border border-border bg-card/60 px-3.5 py-2.5">
                  <input
                    type="checkbox"
                    checked={Boolean(draft.isFree)}
                    onChange={(e) => set({ isFree: e.target.checked })}
                    className="size-4 accent-[hsl(var(--primary))]"
                  />
                  <Gift className={`size-4 ${draft.isFree ? "text-emerald-500" : "text-muted-foreground"}`} />
                  <span className="text-sm font-bold">درسٌ مجّانيّ</span>
                </label>
              </div>
              <p className="rounded-2xl bg-muted/50 px-3.5 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
                الدرسُ المجّانيُّ يُشاهَد بلا اشتراك — يُجرَّب به الكورسُ قبل الشراء.
              </p>
            </div>
          )}

          {tab === "video" && (
            <div className="grid gap-3">
              <div className={`flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-[11.5px] font-bold ${
                p.ok ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
              }`}>
                <Video className="size-4 shrink-0" />
                {p.ok ? `يُشغَّل عبر ${p.name}` : p.name}
              </div>

              <label className="block">
                <span className={lbl}>رابط الفيديو</span>
                <span className="relative block">
                  <input value={draft.url} onChange={(e) => set({ url: e.target.value })} dir="ltr" className={`${fld} text-left font-mono text-xs`} placeholder="https://…" />
                </span>
              </label>

              {draft.url.trim() && (
                <a href={draft.url} target="_blank" rel="noreferrer"
                  className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-[11px] font-bold text-muted-foreground transition hover:border-primary hover:text-primary">
                  <ExternalLink className="size-3.5" /> افتح الرابط للتأكّد
                </a>
              )}

              <div className="rounded-2xl border border-border p-3.5">
                <p className="mb-1.5 text-xs font-bold">الصيغُ المقبولة</p>
                <ul className="grid gap-1 text-[11px] leading-relaxed text-muted-foreground">
                  <li>· <b>Bunny Stream</b> — الرابطُ أو «معرّف المكتبة/معرّف الفيديو»</li>
                  <li>· <b>Google Drive</b> — أيُّ صيغةِ رابطٍ للملفّ</li>
                  <li>· <b>YouTube</b> و<b>Vimeo</b> — رابطُ المشاهدة العاديّ</li>
                  <li>· ملفٌّ مباشر — ‎.mp4‎ · ‎.webm‎ · ‎.ogg‎</li>
                </ul>
              </div>
            </div>
          )}

          {tab === "quiz" && (
            /*
              محرّرُ الواجب يكتب في `quiz` مباشرةً — ولا يُنسخ هنا: هو نفسُه
              الذي في محرّر الكورس، فلا يفترق ما يُبنى من هنا عمّا يُبنى
              من هناك.
            */
            <QuizEditor
              lesson={draft}
              onChange={(q: Quiz | undefined) => set({ quiz: q })}
              results={quizResults ?? { attempts: 0, avg: 0, passed: 0 }}
            />
          )}

          {tab === "files" && (
            <div className="grid gap-4">
              <div className="rounded-2xl border border-border p-3.5">
                <p className="mb-2.5 flex items-center gap-1.5 text-xs font-bold">
                  <Link2 className="size-3.5 text-primary" /> إضافة مرفق
                </p>
                <div className="grid gap-2 sm:grid-cols-[1fr_1.4fr_auto]">
                  <input value={link.title} onChange={(e) => setLink({ ...link, title: e.target.value })} className={fld} placeholder="عنوان الملفّ" />
                  <input value={link.url} onChange={(e) => setLink({ ...link, url: e.target.value })} dir="ltr" className={`${fld} text-left`} placeholder="https://…" />
                  <Button className="px-4 py-2.5" onClick={addLink} disabled={!link.title.trim() || !link.url.trim()}>
                    <Plus className="size-4" /> إضافة
                  </Button>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  مذكّرةٌ أو ملزمةٌ أو رابطٌ خارجيّ — يفتحه الطالبُ مع هذا الدرس وحدَه.
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold">
                  المرفقاتُ الحالية {files.length > 0 && <span className="text-muted-foreground">({ar(files.length)})</span>}
                </p>
                {files.length === 0 ? (
                  <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-border py-10 text-center">
                    <span className="grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
                      <Upload className="size-5" />
                    </span>
                    <p className="text-sm font-bold">لا مرفقات بعد</p>
                    <p className="text-[11px] text-muted-foreground">أضِف ملفّاً أو رابطاً يُثري الدرس.</p>
                  </div>
                ) : (
                  <ul className="grid gap-2">
                    {files.map((m: Material) => (
                      <li key={m.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card/60 p-2.5">
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[hsl(var(--gold)/0.22)] text-primary">
                          <FileText className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold">{m.title}</p>
                          <p dir="ltr" className="truncate text-left font-mono text-[10px] text-muted-foreground">{m.url}</p>
                        </div>
                        <a href={m.url} target="_blank" rel="noreferrer" title="فتح"
                          className="grid size-8 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition hover:border-primary hover:text-primary">
                          <ExternalLink className="size-3.5" />
                        </a>
                        <button
                          onClick={() => set({ materials: files.filter((x) => x.id !== m.id) })}
                          title="حذف المرفق"
                          className="grid size-8 shrink-0 place-items-center rounded-full border border-border text-rose-500 transition hover:border-rose-500"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/*
          الحفظُ في قدم النافذة لا في كلّ تبويب.
          الدرسُ واحدٌ وإن تعدّدت تبويباتُه، وزرُّ حفظٍ في كلٍّ منها يجعل من
          عدّل في اثنين يحفظ مرّتين — أو ينسى إحداهما.
        */}
        <div className="flex flex-wrap items-center gap-3 border-t border-border bg-muted/30 px-5 py-3.5">
          <Button className="px-6 py-2.5" onClick={() => onSave(draft)} disabled={!dirty || !draft.title.trim()}>
            <Check className="size-4" /> حفظ التعديلات
          </Button>
          <button onClick={onClose} className="rounded-full border border-border px-5 py-2.5 text-sm font-bold text-muted-foreground transition hover:text-foreground">
            إغلاق
          </button>
          <p className="ms-auto text-[11px] text-muted-foreground">
            {dirty ? "فيه تعديلاتٌ لم تُحفظ" : "لا تعديلات"}
          </p>
        </div>
      </div>
    </div>
  );
}
