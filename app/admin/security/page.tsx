"use client";

/**
 * الأمان — كل محاولة مشبوهة مسجّلة هنا، والحظر التلقائي واليدوي للعناوين.
 */
import { useCallback, useEffect, useState } from "react";
import {
  ShieldCheck, ShieldAlert, RefreshCw, Ban, Undo2, Loader2, Activity, Lock, KeyRound, TriangleAlert,
} from "lucide-react";
import { PageHeader, Card, StatCard, DataTable } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/primitives";

type Event = {
  id: string; at: string; kind: string; ip: string; ua?: string;
  detail?: string; username?: string; severity: "info" | "high";
};
type BanRow = { ip: string; until: string; reason: string; at: string };
type State = {
  events: Event[];
  bans: BanRow[];
  stats: { total: number; last24h: number; high: number; activeBans: number };
  hardening?: { authSecret: boolean; adminPassword: boolean; cookieSecure: boolean };
};

const KIND_LABEL: Record<string, string> = {
  login_failed: "دخول فاشل",
  login_ok: "دخول ناجح",
  unauthorized_admin: "وصول إداري مرفوض",
  device_mismatch: "جهاز غير مرتبط",
  bad_code: "كود تفعيل خاطئ",
  rate_limited: "تجاوز حدّ المحاولات",
  path_probe: "فحص مسارات",
  bot_trap: "فخّ الآليّات",
  db_promote: "تبديل قاعدة البيانات",
  db_open_rules: "قاعدة مفتوحة للعالم",
  db_down: "قاعدة بيانات ساقطة",
  csrf_blocked: "طلب من أصل خارجي",
  media_denied: "ملف غير مسجّل",
  banned_hit: "محاولة من محظور",
  signup: "إنشاء حساب",
};

export default function SecurityPage() {
  const [st, setSt] = useState<State | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [ip, setIp] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/security", { cache: "no-store" });
    if (res.ok) setSt(await res.json());
  }, []);
  useEffect(() => { void load(); }, [load]);

  const act = async (action: "ban" | "unban", target: string) => {
    setBusy(target);
    try {
      const res = await fetch("/api/security", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ip: target, minutes: 120 }),
      });
      if (res.ok) setSt(await res.json());
      setIp("");
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <PageHeader
        title="الأمان"
        subtitle="كل محاولة مشبوهة مسجّلة — والتكرار الخطير يُحظر تلقائياً"
        action={<Button variant="outline" className="px-4 py-2.5" onClick={() => void load()}><RefreshCw className="size-4" /> تحديث</Button>}
      />

      {/*
        حالةُ التحصين — أوّلُ ما يُرى، فهو أهمُّ من عدّاد الأحداث.
        المشرفُ يسأل «أنا محميّ؟» — فيُجاب بنظرة: أخضرُ = مضبوط، وأحمرُ =
        ناقصٌ يحتاج ضبطاً في إعدادات النشر. ولا يُكشف السرُّ نفسُه، بل
        وجودُه من عدمه.
      */}
      {st?.hardening && (
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <Guard
            ok={st.hardening.authSecret}
            title="سرّ توقيع الجلسات"
            good="مضبوطٌ ودائم — الجلساتُ لا تُزوَّر ولا تسقط"
            bad="مؤقّت — اضبط AUTH_SECRET، وإلا سقطت الجلسات عند كل نشر"
            icon={<KeyRound className="size-5" />}
          />
          <Guard
            ok={st.hardening.adminPassword}
            title="كلمة مرور الأدمن"
            good="مضبوطة — الحساب محميّ"
            bad="غير مضبوطة — الحساب مقفلٌ بكلمة عشوائية حتى تضبط ADMIN_PASSWORD"
            icon={<Lock className="size-5" />}
          />
          <Guard
            ok={st.hardening.cookieSecure}
            title="كوكي آمنة (HTTPS)"
            good="مفعّلة — الكوكي لا تُرسَل إلا على اتصالٍ مشفّر"
            bad="غير مفعّلة — اضبط COOKIE_SECURE=1 عند النشر على HTTPS"
            icon={<ShieldCheck className="size-5" />}
          />
        </div>
      )}

      {st && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard index={0} label="أحداث آخر ٢٤ ساعة" value={st.stats.last24h.toLocaleString("ar-EG")} tone="primary" icon={<Activity className="size-5" />} />
          <StatCard index={1} label="محاولات خطيرة" value={st.stats.high.toLocaleString("ar-EG")} tone="amber" icon={<ShieldAlert className="size-5" />} />
          <StatCard index={2} label="عناوين محظورة" value={st.stats.activeBans.toLocaleString("ar-EG")} tone="violet" icon={<Ban className="size-5" />} />
          <StatCard index={3} label="إجمالي السجلّ" value={st.stats.total.toLocaleString("ar-EG")} tone="emerald" icon={<ShieldCheck className="size-5" />} />
        </div>
      )}

      {/* ---------- حمايةُ الفيديو ---------- */}
      <BunnyCard />

      {/* حظر يدوي */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-display font-extrabold">حظر عنوان يدوياً</p>
            <p className="text-xs text-muted-foreground">يمنع الدخول والتسجيل من هذا العنوان لمدّة ساعتين.</p>
          </div>
          <input value={ip} onChange={(e) => setIp(e.target.value)} dir="ltr" placeholder="203.0.113.7"
            className="w-48 rounded-2xl border border-border bg-card/60 px-3 py-2.5 text-right font-mono text-sm outline-none focus:border-primary/50" />
          <Button className="px-5 py-2.5" onClick={() => ip.trim() && act("ban", ip.trim())} disabled={!ip.trim() || busy !== null}>
            {busy === ip.trim() ? <Loader2 className="size-4 animate-spin" /> : <Ban className="size-4" />} حظر
          </Button>
        </div>
      </Card>

      {/* المحظورون */}
      {st && st.bans.length > 0 && (
        <div className="mb-6">
          <p className="mb-3 font-display font-bold">العناوين المحظورة</p>
          <DataTable head={["العنوان", "السبب", "ينتهي الحظر", "إجراء"]}>
            {st.bans.map((b) => (
              <tr key={b.ip} className="transition hover:bg-muted/50">
                <td className="px-4 py-3 font-mono text-xs" dir="ltr">{b.ip}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.reason}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(b.until).toLocaleString("ar-EG", { timeZone: "Africa/Cairo" })}</td>
                <td className="px-4 py-3">
                  <button onClick={() => act("unban", b.ip)} disabled={busy !== null}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-bold text-primary transition hover:border-primary disabled:opacity-50">
                    <Undo2 className="size-3.5" /> رفع الحظر
                  </button>
                </td>
              </tr>
            ))}
          </DataTable>
        </div>
      )}

      {/* السجلّ */}
      <p className="mb-3 font-display font-bold">آخر المحاولات</p>
      {st && st.events.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-emerald-500/12 text-emerald-500"><Lock className="size-7" /></span>
          <p className="font-display font-extrabold">لا توجد محاولات مشبوهة</p>
          <p className="text-sm text-muted-foreground">سيظهر هنا أي دخول فاشل أو محاولة وصول غير مصرّح بها.</p>
        </Card>
      ) : (
        <DataTable head={["الوقت", "الحدث", "العنوان", "التفاصيل", "الخطورة"]}>
          {(st?.events ?? []).map((e) => (
            <tr key={e.id} className="transition hover:bg-muted/50">
              <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{new Date(e.at).toLocaleString("ar-EG", { timeZone: "Africa/Cairo" })}</td>
              <td className="px-4 py-3 font-semibold">{KIND_LABEL[e.kind] ?? e.kind}</td>
              <td className="px-4 py-3">
                <span className="font-mono text-xs" dir="ltr">{e.ip}</span>
                {e.ip !== "local" && (
                  <button onClick={() => act("ban", e.ip)} disabled={busy !== null} title="حظر هذا العنوان"
                    className="mr-2 rounded-full border border-border px-2 py-0.5 text-[10px] font-bold text-rose-500 transition hover:border-rose-500">
                    حظر
                  </button>
                )}
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {e.username ? <span className="font-semibold text-foreground">{e.username}</span> : null}
                {e.username && e.detail ? " · " : ""}
                {e.detail}
              </td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${e.severity === "high" ? "bg-rose-500/15 text-rose-500" : "bg-muted text-muted-foreground"}`}>
                  {e.severity === "high" ? "خطير" : "عادي"}
                </span>
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </>
  );
}


/**
 * حمايةُ فيديوهات Bunny.
 * ------------------------------------------------------------------
 * رابطُ التشغيل اليوم ثابتٌ ومكشوف: من نسخه من مصدر الصفحة أعطاه من
 * شاء، ويعمل من أيّ مكانٍ إلى الأبد بلا حسابٍ ولا اشتراك. وكلُّ حراسةٍ
 * في المنصّة لا تمسّه بشيء — هذه أخطرُ ثغرةٍ فيها، وأوسعُها التفافاً.
 *
 * والتوقيعُ يُنهيها: الرابطُ يحمل بصمةً وتاريخَ انتهاء، فالمنسوخُ يموت.
 *
 * **والمفتاحُ يُكتب ولا يُقرأ.** الخادمُ يقول «مضبوطٌ» ولا يقول ما هو،
 * فلو سُرقت جلسةُ مشرفٍ لم يُسرق معها مفتاحُ المكتبة.
 */
/** بطاقةُ حالة تحصينٍ واحدة — خضراءُ إن كانت مضبوطةً وحمراءُ إن نقصت. */
function Guard({
  ok, title, good, bad, icon,
}: {
  ok: boolean;
  title: string;
  good: string;
  bad: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className={`!p-4 ${ok ? "" : "ring-1 ring-rose-500/40"}`}>
      <div className="flex items-start gap-3">
        <span className={`grid size-10 shrink-0 place-items-center rounded-2xl ${ok ? "bg-emerald-500/12 text-emerald-600" : "bg-rose-500/12 text-rose-500"}`}>
          {ok ? icon : <TriangleAlert className="size-5" />}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-bold">
            {title}
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${ok ? "bg-emerald-500/15 text-emerald-600" : "bg-rose-500/15 text-rose-500"}`}>
              {ok ? "مضبوط" : "ناقص"}
            </span>
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{ok ? good : bad}</p>
        </div>
      </div>
    </Card>
  );
}

function BunnyCard() {
  const [st, setSt] = useState<{ configured: boolean; keyFromEnv: boolean; libraryId: string | null; ttl: number } | null>(null);
  const [key, setKey] = useState("");
  const [lib, setLib] = useState("");
  const [ttl, setTtl] = useState(14400);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/bunny").then((x) => x.json()).catch(() => null);
    if (!r || r.error) return;
    setSt(r);
    setLib(r.libraryId ?? "");
    setTtl(r.ttl ?? 14400);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const save = async (clearKey = false) => {
    setBusy(true);
    setMsg(null);
    const r = await fetch("/api/bunny", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tokenKey: key, libraryId: lib, ttl, clearKey }),
    }).then((x) => x.json()).catch(() => null);
    setBusy(false);
    if (!r || r.error) { setMsg(r?.error ?? "تعذّر الحفظ"); return; }
    setKey("");
    setMsg(clearKey ? "مُسح المفتاح — عادت الروابطُ مكشوفة." : "حُفظ. الروابطُ تُوقَّع من الآن.");
    void load();
  };

  return (
    <Card className="mb-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display font-bold">حماية فيديوهات Bunny</p>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            بلا توقيعٍ يعمل رابطُ الفيديو لمن نسخه، من أيّ مكانٍ وإلى الأبد. وبالتوقيع
            ينتهي بعد ساعات — فالمنسوخُ يموت ولا يُشارَك.
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${
            st?.configured ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-600"
          }`}
        >
          {st?.configured ? "التوقيع مُفعَّل" : "غير مفعَّل — الروابط مكشوفة"}
        </span>
      </div>

      {st?.keyFromEnv && (
        <p className="mb-3 rounded-xl border border-border px-3 py-2 text-[11px] text-muted-foreground">
          المفتاحُ مضبوطٌ من متغيّرات البيئة (<code dir="ltr">BUNNY_TOKEN_KEY</code>) — وهو يسبق ما يُكتب هنا.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-muted-foreground">
            Token Authentication Key {st?.configured && "— مضبوطٌ الآن، اكتب مفتاحاً جديداً لتبديله"}
          </span>
          {/*
            `type="password"` كي لا يظهر المفتاحُ على شاشةٍ قد تُصوَّر،
            و`autoComplete="off"` كي لا يحفظه المتصفّح في خانةِ كلمات المرور.
          */}
          <input
            type="password"
            autoComplete="off"
            dir="ltr"
            className="inp text-right"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder={st?.configured ? "••••••••••••••••" : "الصق المفتاح من لوحة Bunny"}
          />
        </label>

        <label>
          <span className="mb-1 block text-xs font-semibold text-muted-foreground">معرّف المكتبة</span>
          <input dir="ltr" className="inp text-right" value={lib} onChange={(e) => setLib(e.target.value)} placeholder="718182" />
        </label>

        <label>
          <span className="mb-1 block text-xs font-semibold text-muted-foreground">عمر الرابط (بالثواني)</span>
          <input
            type="number"
            min={60}
            max={21600}
            className="inp"
            value={ttl}
            onChange={(e) => setTtl(Number(e.target.value))}
          />
          <span className="mt-1 block text-[10px] leading-relaxed text-muted-foreground">
            القصيرُ أأمن، والطويلُ يحتمل درساً كاملاً بلا انقطاع. ‏٤ ساعاتٍ = ١٤٤٠٠.
          </span>
        </label>

        <div className="flex items-end gap-2 sm:col-span-3">
          <Button className="px-5 py-2.5" onClick={() => void save(false)} disabled={busy}>
            حفظ
          </Button>
          {st?.configured && !st.keyFromEnv && (
            <button
              type="button"
              onClick={() => void save(true)}
              disabled={busy}
              className="rounded-2xl border border-rose-500/40 px-4 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-500/10 disabled:opacity-60"
            >
              مسح المفتاح
            </button>
          )}
          {msg && <span className="text-[11px] font-semibold text-muted-foreground">{msg}</span>}
        </div>
      </div>

      <p className="mt-3 rounded-xl border border-dashed border-border px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
        بعد الحفظ، ارجع إلى لوحة Bunny ← <span dir="ltr">Stream → مكتبتك → Security</span> وشغّل
        <span dir="ltr"> Embed view token authentication</span>. ولا تشغّله قبل الحفظ — يتوقّف التشغيل.
      </p>
    </Card>
  );
}
