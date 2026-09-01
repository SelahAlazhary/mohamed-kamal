"use client";

/**
 * طلباتُ نقل المرحلة — من جهة الأستاذ.
 * ------------------------------------------------------------------
 * لوحٌ يُطوى فوق جدول الطلاب: المفتوحةُ تُفتح تلقائياً حين توجد، وتُطوى
 * حين لا توجد — فلا يزاحم القائمةَ لوحٌ فارغ، ولا يُخفى طلبٌ ينتظر.
 *
 * **والقبولُ هو ما يكتب مرحلةَ الطالب** — لا الطالبُ نفسُه. وذلك يقع في
 * الخادم بعد `can(me, "students")`؛ وهذا اللوحُ يرسل القرارَ لا يُنفّذه.
 */

import { useState } from "react";
import { IconLayers } from "@/components/brand/icons";
import { Collapse } from "@/components/dashboard/collapse";
import { useContent } from "@/components/content/content-provider";

const arDate = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("ar-EG", { timeZone: "Africa/Cairo",  month: "long", day: "numeric" });
};

export function GradeRequests() {
  const { db, refresh } = useContent();
  const rows = db?.gradeRequests ?? [];
  const open = rows.filter((r) => r.status === "قيد المراجعة");
  const closed = rows.filter((r) => r.status !== "قيد المراجعة").slice(0, 12);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  if (!rows.length) return null;

  const decide = async (id: string, decision: "مقبول" | "مرفوض") => {
    setErr(null);
    setBusy(id + decision);
    try {
      const res = await fetch("/api/grade-request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, decision }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) setErr(data.error ?? "تعذّر حفظ القرار");
      else await refresh();
    } catch {
      setErr("تعذّر الاتّصال — أعد المحاولة");
    }
    setBusy(null);
  };

  return (
    <div className="mb-6">
      <Collapse
        icon={<IconLayers className="size-5" />}
        title="طلبات نقل المرحلة"
        subtitle={
          open.length
            ? `${open.length.toLocaleString("ar-EG")} بانتظار قرارك`
            : "لا طلباتٍ مفتوحة"
        }
        count={open.length}
        tone="alert"
        /* المفتوحةُ تفتح اللوحَ من نفسها: طلبٌ ينتظر خلف عنوانٍ مطويّ
           يبقى أسبوعاً بلا أن يُرى. */
        defaultOpen={open.length > 0}
        storageKey="admin.gradeRequests"
      >
        {err && <p className="mb-3 text-xs font-bold text-rose-500">{err}</p>}

        {open.length === 0 ? (
          <p className="py-2 text-center text-xs text-muted-foreground">لا طلباتٍ قيد المراجعة.</p>
        ) : (
          <div className="space-y-2">
            {open.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card/60 p-3"
              >
                <div className="min-w-40 flex-1">
                  <p className="text-sm font-bold">{r.userName}</p>
                  <p className="font-kufi mt-0.5 text-[11px] text-muted-foreground">
                    {r.from} <span className="text-[hsl(var(--gold))]">←</span> {r.to} · {arDate(r.at)}
                  </p>
                  {r.reason && <p className="mt-1 text-[11px] text-muted-foreground">«{r.reason}»</p>}
                </div>
                <button
                  onClick={() => decide(r.id, "مقبول")}
                  disabled={busy !== null}
                  className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                >
                  {busy === r.id + "مقبول" ? "…" : "قبول ونقل"}
                </button>
                <button
                  onClick={() => decide(r.id, "مرفوض")}
                  disabled={busy !== null}
                  className="rounded-full border border-border px-4 py-2 text-xs font-bold text-rose-500 transition hover:border-rose-500 disabled:opacity-50"
                >
                  {busy === r.id + "مرفوض" ? "…" : "رفض"}
                </button>
              </div>
            ))}
          </div>
        )}

        {closed.length > 0 && (
          <div className="mt-4 border-t border-border pt-3">
            <p className="mb-2 text-[11px] font-bold text-muted-foreground">آخر ما حُسم</p>
            <div className="space-y-1">
              {closed.map((r) => (
                <p key={r.id} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span
                    className={`inline-block size-1.5 shrink-0 rounded-full ${
                      r.status === "مقبول" ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                  />
                  <span className="font-bold text-foreground">{r.userName}</span>
                  {r.from} ← {r.to} · {r.status} · {arDate(r.decidedAt)}
                </p>
              ))}
            </div>
          </div>
        )}
      </Collapse>
    </div>
  );
}
