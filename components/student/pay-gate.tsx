"use client";

/**
 * بوّابة الدفع كما يراها الطالب.
 * ------------------------------------------------------------------
 * أربع خطوات: الخطة ← طريقة الدفع ← بيانات التحويل والإيصال ← النتيجة.
 * الشكل كلّه أصنافٌ من `lib/pay-styles` على الغلاف، فالتصميم يتغيّر من
 * اللوحة دون أن يُمسّ هذا الملف.
 *
 * السعر يُعاد حسابه على الخادم عند الإرسال — ما يُعرض هنا للطالب لا
 * يُصدَّق منه شيء.
 */

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconCheck, IconCheckCircle, IconSpinner, IconCalendar, IconSparkle, IconArrowLeft,
} from "@/components/brand/icons";
import { useContent } from "@/components/content/content-provider";
import { findPayStyle, payClass, payColorVars } from "@/lib/pay-styles";
import { activeMethods, numberLabel, requestProblem, STATUS_LABEL } from "@/lib/payments";
import { planPrice, planColor } from "@/lib/plans";
import { planDuration, planScopeLabel } from "@/components/sections/plans";
import type { PayMethod, PayRequest, SitePlan, Subject } from "@/lib/types";
import { PayMark } from "@/components/brand/pay-marks";

const STEPS = ["الخطة", "طريقة الدفع", "التحويل"];

export function PayGate({
  plans, subject, onDone,
}: {
  plans: SitePlan[];
  subject?: Subject;
  onDone: () => void;
}) {
  const { content, db, session, refresh } = useContent();
  const cfg = content.payments ?? {};
  const style = findPayStyle(cfg.style);
  const methods = useMemo(() => activeMethods(cfg.methods), [cfg.methods]);

  /* طلبات هذا الطالب — الخادم لا يرسل له غيرها أصلاً. */
  const mine = ((db?.payments ?? []) as PayRequest[]).filter((r) => r.userId === session?.uid);
  /*
    ما زال للطالب شأنٌ قائم؟
    ------------------------------------------------------------------
    كان يُبحث عن الطلب المعلّق وحده، فبعد القبول تعود شاشةُ اختيار الخطة
    كأنّ شيئاً لم يكن — والطالبُ دفع فعلاً وكودُه ينتظره. فيُبحث أوّلاً
    عن مقبولٍ لم يُستعمل كودُه، ثم عن معلّق.
  */
  const readyOne = mine.find((r) => r.status === "approved" && r.code && !r.redeemedAt);
  const pendingOne = mine.find((r) => r.status === "pending");
  const openOne = readyOne ?? pendingOne;

  const [plan, setPlan] = useState<SitePlan | null>(plans.length === 1 ? plans[0] : null);
  const [method, setMethod] = useState<PayMethod | null>(null);
  const [senderName, setSenderName] = useState("");
  const [senderAccount, setSenderAccount] = useState("");
  const [senderRef, setSenderRef] = useState("");
  const [note, setNote] = useState("");
  const [receipt, setReceipt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<PayRequest | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  /* اختيار الطريقة صار إقراراً «حوّلتُ عليها» لا انتقالاً، فالانتقال
     يحتاج ضغطةً صريحة — وإلا قفزت الشاشة قبل أن يقرأ الأرقام. */
  const [stepDone, setStepDone] = useState(false);

  const step = done ? 3 : plan ? (method && stepDone ? 2 : 1) : 0;

  const copy = (v: string) => {
    navigator.clipboard?.writeText(v);
    setCopied(v);
    setTimeout(() => setCopied(null), 1500);
  };

  const upload = async (file: File) => {
    setErr(null);
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("purpose", "receipt");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    setUploading(false);
    if (!res.ok) { setErr(data.error || "تعذّر رفع الصورة"); return; }
    setReceipt(data.url);
  };

  const submit = async () => {
    setErr(null);
    const problem = requestProblem(
      { methodId: method?.id, senderName, senderAccount, receipt },
      { requireReceipt: cfg.requireReceipt, requireSender: cfg.requireSender }
    );
    if (problem) { setErr(problem); return; }

    setBusy(true);
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planId: plan?.id,
        methodId: method?.id,
        subjectId: subject?.id,
        senderName, senderAccount, senderRef, note, receipt,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setErr(data.error || "تعذّر إرسال الطلب"); return; }
    setDone(data.request as PayRequest);
    await refresh();
  };

  /* ---------------- طلب سابق قيد المراجعة ---------------- */
  if (!done && openOne) {
    return (
      <div className="pay-gate" style={payColorVars(cfg.colors)}>
        <Pending r={openOne} subject={subject} onClose={onDone} onRefresh={refresh} />
        <RecentList list={mine.filter((r) => r.id !== openOne.id)} />
      </div>
    );
  }

  return (
    <div className={`pay-gate ${payClass(style)}`} style={payColorVars(cfg.colors)}>
      {/* العنوان والوصف من اللوحة */}
      <div className="mb-3">
        <p className="font-display text-base font-extrabold">{cfg.title || "ادفع واستلم كود التفعيل"}</p>
        {cfg.desc && <p className="mt-0.5 text-[11px] text-muted-foreground">{cfg.desc}</p>}
      </div>

      {/* مؤشّر الخطوات */}
      <div className="pay-steps mb-4">
        {STEPS.map((s, i) => (
          <span key={s} className="pay-step" data-on={i <= step ? "1" : "0"} title={s}>
            <span className="pay-step-num">{(i + 1).toLocaleString("ar-EG")}</span>
          </span>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ---------- ١ · الخطة ---------- */}
        {step === 0 && (
          <Step key="plan">
            {plans.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                لم تُضَف خطط لهذا الكورس بعد.
              </p>
            ) : (
              <div className="pay-methods">
                {plans.map((p) => {
                  const priced = planPrice(p);
                  const tone = planColor(p);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPlan(p)}
                      className="pay-method flex w-full items-start justify-between gap-3 p-3.5 text-right"
                      style={tone ? ({ "--pg-accent": tone } as React.CSSProperties) : undefined}
                    >
                      <span className="min-w-0">
                        <span className="font-display block font-extrabold">{p.name}</span>
                        <span className="pay-method-note block text-[11px] text-muted-foreground">
                          {p.desc || planScopeLabel(p, subject?.name)}
                        </span>
                        <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                          <IconCalendar className="size-3" /> {planDuration(p, content.termEnd)}
                        </span>
                      </span>
                      <span className="shrink-0 text-left">
                        {p.badge && (
                          <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-white">
                            <IconSparkle className="size-2.5" /> {p.badge}
                          </span>
                        )}
                        <span className="font-display block text-xl font-extrabold" style={{ color: tone ?? "hsl(var(--primary))" }}>
                          {priced.price.toLocaleString("ar-EG")}
                        </span>
                        {priced.active && (
                          <span className="block text-[10px] font-bold text-muted-foreground line-through">
                            {priced.original.toLocaleString("ar-EG")}
                          </span>
                        )}
                        <span className="block text-[11px] text-muted-foreground">ج.م</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </Step>
        )}

        {/* ---------- ٢ · طريقة الدفع ---------- */}
        {step === 1 && plan && (
          <Step key="method">
            <Head title={`${plan.name} — ${planPrice(plan).price.toLocaleString("ar-EG")} ج.م`} onBack={() => { setPlan(null); setMethod(null); setStepDone(false); }} />
            {methods.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                لم تُضَف طرق دفع بعد — تواصل مع الدعم.
              </p>
            ) : (
              <>
                {/*
                  الطرق كلُّها ببياناتها معاً.
                  ------------------------------------------------------------
                  كانت تُعرض أسماءً فقط، فيختار الطالب واحدةً ثم يرى رقمها —
                  وهو يريد أن يرى الأرقام كلَّها ليقارن ويحوّل من محفظته هو.
                  فصارت كلُّ طريقة تعرض بياناتها في مكانها، والضغطُ يقول
                  «حوّلتُ على هذه» لا «أرني هذه».
                */}
                <p className="mb-3 text-[11px] font-bold text-muted-foreground">
                  حوّل المبلغ على أيّ طريقة تناسبك، ثم اختر التي حوّلت عليها:
                </p>

                <div className="pay-methods">
                  {methods.map((m) => (
                    <div
                      key={m.id}
                      className="pay-method p-3.5"
                      data-on={method?.id === m.id ? "1" : "0"}
                      style={m.color ? ({ "--pg-accent": m.color } as React.CSSProperties) : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <PayMark
                          kind={m.kind}
                          name={m.name}
                          logo={m.logo}
                          color={m.color}
                          className="pay-method-icon size-10"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold">{m.name}</span>
                          {m.holder && (
                            <span className="block text-[11px] text-muted-foreground">{m.holder}</span>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => setMethod(m)}
                          className={`shrink-0 rounded-xl px-3.5 py-2 text-[11px] font-bold transition ${
                            method?.id === m.id
                              ? "btn-glow text-white"
                              : "border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                          }`}
                        >
                          {method?.id === m.id ? "✓ حوّلت عليها" : "حوّلت عليها"}
                        </button>
                      </div>

                      {/* بيانات التحويل — ظاهرة لكل طريقة بلا ضغط */}
                      <div className="mt-3 grid gap-1.5 border-t border-border pt-2.5">
                        <Row label={numberLabel(m.kind)} value={m.number} onCopy={copy} copied={copied} big />
                        {m.extra && <Row label="بيانات إضافية" value={m.extra} onCopy={copy} copied={copied} />}
                        {m.note && (
                          <p className="text-[10px] leading-relaxed text-muted-foreground">{m.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pay-details mt-4 grid gap-2">
                  <Row
                    label="المبلغ المطلوب"
                    value={`${planPrice(plan).price.toLocaleString("ar-EG")} ج.م`}
                    onCopy={copy}
                    copied={copied}
                    big
                  />
                </div>

                {method && (
                  <button
                    type="button"
                    onClick={() => setStepDone(true)}
                    className="btn-glow mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white"
                  >
                    <IconCheckCircle className="size-4" /> تابع — أرفق الإيصال
                  </button>
                )}
              </>
            )}
          </Step>
        )}

        {/* ---------- ٣ · التحويل ---------- */}
        {step === 2 && plan && method && (
          <Step key="pay">
            <Head title={`${method.name} — ${planPrice(plan).price.toLocaleString("ar-EG")} ج.م`} onBack={() => setStepDone(false)} />

            <div className="pay-details mb-4 grid gap-2">
              <Row label={numberLabel(method.kind)} value={method.number} onCopy={copy} copied={copied} big />
              {method.holder && <Row label="اسم صاحب الحساب" value={method.holder} onCopy={copy} copied={copied} />}
              {method.extra && <Row label="بيانات إضافية" value={method.extra} onCopy={copy} copied={copied} />}
              <Row label="المبلغ" value={`${planPrice(plan).price.toLocaleString("ar-EG")} ج.م`} onCopy={copy} copied={copied} />
            </div>

            {method.note && (
              <p className="mb-4 rounded-2xl bg-primary/5 px-3.5 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
                {method.note}
              </p>
            )}

            <div className="grid gap-3">
              {/*
                الرقم المُحوَّل منه هو ما تُطابَق به العملية في كشف
                الحساب، فهو مطلوب دائماً لا بحسب الإعداد.
              */}
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold text-muted-foreground">
                  الرقم أو الحساب الذي حوّلت منه <b className="text-rose-500">*</b>
                </span>
                <input
                  value={senderAccount}
                  onChange={(e) => setSenderAccount(e.target.value)}
                  dir="ltr"
                  inputMode="numeric"
                  placeholder="01xxxxxxxxx"
                  className="w-full rounded-2xl border border-border bg-card/60 px-4 py-2.5 text-right font-mono text-sm outline-none focus:border-primary/50"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold text-muted-foreground">
                  اسم من حوّل المبلغ {cfg.requireSender !== false && <b className="text-rose-500">*</b>}
                </span>
                <input
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="الاسم كما ظهر في رسالة التحويل"
                  className="w-full rounded-2xl border border-border bg-card/60 px-4 py-2.5 text-sm outline-none focus:border-primary/50"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold text-muted-foreground">رقم العملية (اختياري)</span>
                <input
                  value={senderRef}
                  onChange={(e) => setSenderRef(e.target.value)}
                  placeholder="رقم مرجعي من رسالة التحويل"
                  className="w-full rounded-2xl border border-border bg-card/60 px-4 py-2.5 font-mono text-sm outline-none focus:border-primary/50"
                />
              </label>

              {/* صورة الإيصال */}
              <div>
                <span className="mb-1 block text-[11px] font-semibold text-muted-foreground">
                  صورة إيصال التحويل {cfg.requireReceipt !== false && <b className="text-rose-500">*</b>}
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-border px-4 py-2.5 text-xs font-bold transition hover:border-primary/60">
                    {uploading ? <IconSpinner className="size-4 animate-spin text-primary" /> : <IconCheck className="size-4 text-primary" />}
                    {receipt ? "تغيير الصورة" : "اختر صورة"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void upload(f); }}
                    />
                  </label>
                  {receipt && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={receipt} alt="إيصال التحويل" className="size-16 rounded-xl border border-border object-cover" />
                  )}
                </div>
              </div>

              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold text-muted-foreground">ملاحظة (اختياري)</span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="w-full rounded-2xl border border-border bg-card/60 px-4 py-2.5 text-sm outline-none focus:border-primary/50"
                />
              </label>
            </div>

            {err && <p className="mt-3 rounded-2xl bg-rose-500/10 px-3 py-2 text-center text-xs font-bold text-rose-500">{err}</p>}

            <button
              type="button"
              onClick={submit}
              disabled={busy || uploading}
              className="btn-glow mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {busy ? <IconSpinner className="size-4 animate-spin" /> : <IconCheckCircle className="size-4" />}
              إرسال طلب التفعيل
            </button>

            {cfg.note && (
              <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">{cfg.note}</p>
            )}
          </Step>
        )}

        {/* ---------- ٤ · النتيجة ---------- */}
        {step === 3 && done && (
          <Step key="done">
            <Pending r={done} subject={subject} onClose={onDone} onRefresh={refresh} />
          </Step>
        )}
      </AnimatePresence>

      {step < 3 && <RecentList list={mine} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Step({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -18 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Head({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <p className="min-w-0 truncate text-xs font-bold text-primary">{title}</p>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[10px] font-bold text-muted-foreground transition hover:text-foreground"
      >
        <IconArrowLeft className="size-3 rotate-180" /> رجوع
      </button>
    </div>
  );
}

function Row({
  label, value, onCopy, copied, big,
}: {
  label: string; value: string; onCopy: (v: string) => void; copied: string | null; big?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onCopy(value)}
      className="flex w-full items-center justify-between gap-3 text-right"
      title="اضغط للنسخ"
    >
      <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
      <span className={`pay-value min-w-0 truncate font-bold ${big ? "text-sm" : "text-xs"}`}>
        {copied === value ? "تم النسخ ✓" : value}
      </span>
    </button>
  );
}

/** حالة الطلب — ما بعد الإرسال. */
function Pending({
  r, subject, onClose, onRefresh,
}: {
  r: PayRequest;
  subject?: Subject;
  onClose: () => void;
  onRefresh?: () => Promise<void>;
}) {
  const ok = r.status === "approved";
  const no = r.status === "rejected";
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [used, setUsed] = useState(Boolean(r.redeemedAt));

  /* التفعيل من مكانه — الكودُ أمامه، فلا يُطلب منه نسخُه ونقلُه. */
  const activate = async () => {
    if (!r.code) return;
    setErr(null);
    setBusy(true);
    const res = await fetch("/api/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: r.code,
        subjectId: subject?.id ?? (r.subjectId && !/^(\*|T[12])$/.test(r.subjectId) ? r.subjectId : undefined),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      if (/مستخدم|منته/.test(data.error ?? "")) { setUsed(true); return; }
      setErr(data.error || "تعذّر التفعيل");
      return;
    }
    setUsed(true);
    await onRefresh?.();
  };
  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-2xl border p-6 text-center ${
        ok ? "border-emerald-500/30 bg-emerald-500/10"
          : no ? "border-rose-500/30 bg-rose-500/10"
            : "border-amber-500/30 bg-amber-500/10"
      }`}
    >
      <IconCheckCircle className={`size-11 ${ok ? "text-emerald-500" : no ? "text-rose-500" : "text-amber-500"}`} />
      <p className="font-display text-lg font-extrabold">
        {ok ? "تم قبول تحويلك 🎉" : no ? "لم يُقبل التحويل" : "طلبك قيد المراجعة"}
      </p>
      <p className="max-w-xs text-sm text-muted-foreground">
        {ok
          ? "هذا كود التفعيل — أدخله بالأسفل لتفعيل اشتراكك."
          : no
            ? r.reason || "راجع بيانات التحويل ثم أرسل الطلب مرّة أخرى."
            : "وصل طلبك للمشرفة. سيصلك كود التفعيل في الإشعارات فور مراجعة التحويل."}
      </p>
      {ok && r.code && (
        <>
          <p className="rounded-xl bg-white/70 px-4 py-2 font-mono text-base font-extrabold tracking-wider text-emerald-700 dark:bg-black/30 dark:text-emerald-300">
            {r.code}
          </p>
          {used ? (
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              تم التفعيل ✓
            </span>
          ) : (
            <button
              type="button"
              onClick={activate}
              disabled={busy}
              className="btn-glow inline-flex items-center gap-2 rounded-2xl px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {busy ? <IconSpinner className="size-4 animate-spin" /> : <IconCheckCircle className="size-4" />}
              فعّل الآن
            </button>
          )}
          {err && <span className="text-[11px] font-bold text-rose-500">{err}</span>}
        </>
      )}
      <p className="text-[11px] text-muted-foreground">
        {r.planName} · {r.amount.toLocaleString("ar-EG")} ج.م · <span className="font-mono">{r.id}</span>
      </p>
      <button
        type="button"
        onClick={onClose}
        className="rounded-2xl border border-border px-4 py-2 text-xs font-bold"
      >
        إغلاق
      </button>
    </div>
  );
}

/** طلباتي السابقة — يطمئنّ الطالب أن تحويله مسجَّل ولم يضِع. */
function RecentList({ list }: { list: PayRequest[] }) {
  if (list.length === 0) return null;
  return (
    <div className="mt-5">
      <p className="mb-2 text-[11px] font-bold text-muted-foreground">طلباتي السابقة</p>
      <div className="grid gap-2">
        {list.slice(0, 4).map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2">
            <span className="min-w-0">
              <span className="block truncate text-[11px] font-bold">{r.planName}</span>
              <span className="block text-[10px] text-muted-foreground">
                {new Date(r.at).toLocaleDateString("ar-EG")} · {r.amount.toLocaleString("ar-EG")} ج.م
              </span>
            </span>
            <span className="shrink-0 text-left">
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                r.status === "approved" ? "bg-emerald-500/15 text-emerald-600"
                  : r.status === "rejected" ? "bg-rose-500/15 text-rose-500"
                    : "bg-amber-500/15 text-amber-600"
              }`}>
                {STATUS_LABEL[r.status]}
              </span>
              {r.status === "approved" && r.code && (
                <span className="mt-0.5 block font-mono text-[10px] font-bold">{r.code}</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
