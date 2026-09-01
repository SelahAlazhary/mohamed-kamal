"use client";

/**
 * طلبُ نقلِ المرحلة — من جهة الطالب.
 * ------------------------------------------------------------------
 * الطالبُ يترقّى، أو يكتشف أنّه سجّل في المرحلة الخطأ، أو يريد الرجوعَ
 * إلى سابقته. والذهابُ والرجوعُ طلبٌ واحدٌ في المسار: كلاهما تغييرُ
 * مرحلةٍ يُقرّه من يملك المحتوى.
 *
 * **ولا يكتب الطالبُ مرحلتَه هنا ولا في غيره.** لو كُتبت من جهته لصار
 * حقلُ المرحلة زينةً: من أراد محتوى الثالث الثانوي بدّل حقلَه وأخذه.
 * فهذا النموذجُ يرسل **طلباً**، والكتابةُ في الخادم بعد إقرار الأستاذ.
 *
 * وحالةُ الطلب تُعرض هنا نفسِها: من أرسل ولم يرَ لطلبه أثراً أعاد إرساله
 * مرّاتٍ، ثمّ ظنّ الميزةَ معطّلة.
 */

import { useState } from "react";
import { IconLayers } from "@/components/brand/icons";
import { Card } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/primitives";
import { useContent } from "@/components/content/content-provider";

const arDate = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("ar-EG", { timeZone: "Africa/Cairo",  year: "numeric", month: "long", day: "numeric" });
};

export function GradeRequestCard() {
  const { db, session, refresh } = useContent();
  const me = db?.users?.find((u) => u.id === session?.uid);
  const grades = db?.grades ?? [];
  const mine = (db?.gradeRequests ?? []).filter((r) => r.userId === me?.id);
  const open = mine.find((r) => r.status === "قيد المراجعة");
  const last = mine[0];

  const [to, setTo] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!me) return null;

  const send = async () => {
    setErr(null);
    if (!to) return setErr("اختر المرحلة المطلوبة");
    setBusy(true);
    try {
      const res = await fetch("/api/grade-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, reason }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) setErr(data.error ?? "تعذّر إرسال الطلب");
      else {
        setTo("");
        setReason("");
        await refresh();
      }
    } catch {
      setErr("تعذّر الاتّصال — أعد المحاولة");
    }
    setBusy(false);
  };

  return (
    <Card>
      <h3 className="font-display mb-1 flex items-center gap-2 font-extrabold">
        <IconLayers className="size-5 text-primary" /> نقل المرحلة الدراسية
      </h3>
      <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
        مرحلتك الآن <b>{me.grade || "—"}</b>. تريد الانتقال إلى مرحلةٍ جديدة أو الرجوع إلى
        السابقة؟ أرسل طلباً — والنقلُ لا يتمّ إلّا بموافقة الأستاذ.
      </p>

      {/* حالةُ آخر طلب — قبل النموذج، فهي ما يبحث عنه العائد */}
      {last && (
        <div
          className={`mb-4 rounded-2xl border p-3 text-xs ${
            last.status === "مقبول"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
              : last.status === "مرفوض"
                ? "border-rose-500/40 bg-rose-500/10 text-rose-600"
                : "border-[hsl(var(--gold)/0.5)] bg-[hsl(var(--gold)/0.12)]"
          }`}
        >
          <p className="font-bold">
            {last.status === "قيد المراجعة"
              ? `طلبك قيد المراجعة: ${last.from} ← ${last.to}`
              : `${last.status}: ${last.from} ← ${last.to}`}
          </p>
          <p className="mt-0.5 opacity-80">
            {arDate(last.decidedAt ?? last.at)}
            {last.note ? ` · ${last.note}` : ""}
          </p>
        </div>
      )}

      {open ? (
        <p className="text-xs text-muted-foreground">
          لا يمكن إرسالُ طلبٍ جديد حتّى يُبتّ في الطلب الحالي.
        </p>
      ) : (
        <div className="grid gap-3">
          <label>
            <span className="mb-1 block text-xs font-semibold text-muted-foreground">المرحلة المطلوبة</span>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-2xl border border-border bg-card/60 px-3 py-2.5 text-sm outline-none focus:border-primary/50"
            >
              <option value="">— اختر —</option>
              {/* مرحلتُه الحالية لا تُعرض: طلبُ الانتقال إليها لا معنى له */}
              {grades
                .filter((g) => g.name !== me.grade)
                .map((g) => (
                  <option key={g.id} value={g.name}>
                    {g.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-muted-foreground">السبب (اختياري)</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              maxLength={300}
              placeholder="مثال: انتقلتُ إلى الصف الثاني هذا العام"
              className="w-full resize-none rounded-2xl border border-border bg-card/60 px-3 py-2.5 text-sm outline-none focus:border-primary/50"
            />
          </label>
          {err && <p className="text-xs font-bold text-rose-500">{err}</p>}
          <Button className="px-5 py-2.5" onClick={send} disabled={busy}>
            {busy ? "جارٍ الإرسال…" : "إرسال الطلب"}
          </Button>
        </div>
      )}
    </Card>
  );
}
