import "server-only";
import fs from "fs";
import path from "path";
import type { DB } from "./types";
import { firebaseConfigured, fbGet, fbSet, firebaseSecure, fbGetFrom, fbSetTo, type FirebaseConfig } from "./firebase";
import { orderNodes, markUp, markDown, writeTarget } from "./db-nodes";
import type { DbNode } from "./types";

/**
 * طبقة التخزين.
 *
 * • عند ضبط فايربيز: **Firebase Realtime Database هي مصدر الحقيقة**؛
 *   تُقرأ عند الإقلاع وتُحدَّث بعد كل تغيير، والملف المحلي يبقى نسخة احتياطية للطوارئ.
 * • بلا فايربيز: الملف المحلي هو المصدر (تشغيل بلا إنترنت أو قبل الربط).
 *
 * الكتابة تمرّ بطابور متسلسل يضمن ترتيب العمليات وعدم تداخلها،
 * ويمكن لأي مسار انتظار اكتمالها عبر flushStore() قبل الردّ على المستخدم.
 */

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const ROOT = "platform";
/** مدّة صلاحية النسخة المخزّنة في الذاكرة قبل إعادة القراءة من فايربيز. */
const TTL = 15_000;

type Cache = { data: DB | null; loadedAt: number };
const cache: Cache = { data: null, loadedAt: 0 };

let pending: Promise<void> = Promise.resolve();
let lastError: string | null = null;
let lastSyncAt: string | null = null;
let source: "firebase" | "local" = "local";

/**
 * فايربيز تحذف المصفوفات الفارغة، وتُعيد المصفوفة ككائن بمفاتيح رقمية إن كانت مثقوبة.
 * نُعيدها لشكلها الصحيح حتى يبقى باقي التطبيق يتعامل مع مصفوفات دائماً.
 */
const LIST_KEYS = ["users", "students", "subjects", "grades", "codes", "exams", "live", "tickets", "notifications", "plans"] as const;

function toArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value.filter((v) => v !== null && v !== undefined);
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .filter(([k]) => /^\d+$/.test(k))
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([, v]) => v)
      .filter((v) => v !== null && v !== undefined);
  }
  return [];
}

function normalizeLists(db: DB): DB {
  const out = db as unknown as Record<string, unknown>;
  for (const k of LIST_KEYS) out[k] = toArray(out[k]);
  // مصفوفات داخلية داخل الكيانات
  (out.subjects as { videos?: unknown; materials?: unknown; units?: unknown }[]).forEach((s) => {
    s.videos = toArray(s.videos);
    /*
      Firebase يُعيد المصفوفةَ الفارغةَ عدماً والمصفوفةَ المتقطّعةَ كائناً.
      فلولا التطبيعُ هنا لانفجر `.map` على وحدةٍ حُذف آخرُ درسٍ منها —
      ودروسُ الوحدة تُطبَّع كما تُطبَّع دروسُ الكورس، فهي المصفوفةُ
      المتغيّرةُ الآن لا تلك.
    */
    s.units = toArray(s.units).map((u) => {
      const unit = u as { lessons?: unknown; materials?: unknown };
      return { ...unit, lessons: toArray(unit.lessons), materials: toArray(unit.materials) };
    });
    s.materials = toArray(s.materials);
  });
  (out.users as { subscriptions?: unknown; quizResults?: unknown; examAttempts?: unknown; pushSubs?: unknown; enrolled?: unknown; readNotifications?: unknown }[]).forEach((u) => {
    if (u.subscriptions !== undefined) u.subscriptions = toArray(u.subscriptions);
    if (u.quizResults !== undefined) u.quizResults = toArray(u.quizResults);
    if (u.examAttempts !== undefined) u.examAttempts = toArray(u.examAttempts);
    if (u.pushSubs !== undefined) u.pushSubs = toArray(u.pushSubs);
    if (u.enrolled !== undefined) u.enrolled = toArray(u.enrolled);
    if (u.readNotifications !== undefined) u.readNotifications = toArray(u.readNotifications);
  });
  (out.exams as { questions?: unknown }[]).forEach((e) => { e.questions = toArray(e.questions); });
  const sec = out.security as { events?: unknown; bans?: unknown } | undefined;
  if (sec) { sec.events = toArray(sec.events); sec.bans = toArray(sec.bans); }
  return db;
}

/* ---------- الملف المحلي ---------- */

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function readLocal(): DB | null {
  try {
    if (READ_ONLY_FS || !fs.existsSync(DB_FILE)) return null;
    return JSON.parse(fs.readFileSync(DB_FILE, "utf-8")) as DB;
  } catch {
    return null;
  }
}

/** هل نظام الملفات قابل للكتابة؟ (على فيرسل وما شابهه: لا) */
const READ_ONLY_FS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

/**
 * الكتابة المحلية تُستخدم فقط في وضع «بلا سحابة» (تشغيل محلي قبل الربط).
 * عند تفعيل فايربيز — أو على استضافة بنظام ملفات للقراءة فقط — لا يُكتب شيء على القرص.
 */
export function writeLocal(db: DB) {
  if (firebaseUsable() || READ_ONLY_FS) return;
  try {
    ensureDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch {
    /* قرص غير قابل للكتابة — البيانات في السحابة على أي حال */
  }
}

/* ---------- القراءة ---------- */

/** هل يُسمح باستخدام فايربيز؟ (مضبوط + قواعده مقفلة أو موثّق باعتماد) */
export function firebaseUsable(): boolean {
  return firebaseConfigured() && firebaseSecure();
}

/**
 * يضمن وجود نسخة حديثة في الذاكرة. يُستدعى في بداية كل طلب.
 * seed: بذرة تُكتب إذا كانت القاعدة فارغة تماماً (أول تشغيل).
 */
export async function ensureStore(seed?: () => DB): Promise<DB> {
  const fresh = cache.data && Date.now() - cache.loadedAt < TTL;
  if (fresh) return cache.data!;

  if (firebaseUsable()) {
    try {
      /*
        تُجرَّب القواعد بترتيبها حتى تردّ واحدة.
        ------------------------------------------------------------
        بقاعدةٍ واحدة يبقى السلوك كما كان حرفاً بحرف — محاولةٌ واحدة
        ثم الخطأ. والفروعُ لا تُزاد إلا حين تُضاف، فلا تُدفع كلفةٌ لم
        تُطلب.
      */
      const remote = await readChain();
      if (remote && toArrayLength(remote.users)) {
        normalizeLists(remote);
        cache.data = remote;
        cache.loadedAt = Date.now();
        source = "firebase";
        lastError = null;
        return remote;
      }
      // القاعدة السحابية فارغة: ارفع المحلي (أو البذرة) إليها
      const local = readLocal() ?? seed?.() ?? null;
      if (local) {
        await fbSet(ROOT, { ...local, _syncedAt: new Date().toISOString() });
        cache.data = local;
        cache.loadedAt = Date.now();
        source = "firebase";
        lastSyncAt = new Date().toISOString();
        return local;
      }
    } catch (e) {
      lastError = (e as Error).message;
      // حماية حاسمة: لا نستبدل بيانات السحابة ببذرة فارغة عند تعذّر الوصول.
      // نُبقي آخر نسخة في الذاكرة إن وُجدت، وإلا نُفشل الطلب بوضوح بدل مسح البيانات.
      if (cache.data) return cache.data;
      const emergency = readLocal();
      if (emergency) {
        cache.data = emergency;
        cache.loadedAt = 0;
        source = "local";
        return emergency;
      }
      throw new Error(`تعذّر الوصول إلى قاعدة البيانات السحابية${lastError ? ` — ${lastError}` : ""}`);
    }
  }

  const local = readLocal() ?? seed?.() ?? null;
  if (!local) throw new Error("لا توجد بيانات");
  if (!firebaseUsable()) writeLocal(local);
  cache.data = local;
  cache.loadedAt = Date.now();
  source = firebaseUsable() ? "local" : "local";
  return local;
}

/** النسخة الحالية من الذاكرة (أو الملف المحلي إن لم تُحمّل بعد). */
export function peek(seed?: () => DB): DB {
  if (cache.data) return cache.data;
  const local = readLocal() ?? seed?.();
  if (!local) throw new Error("لا توجد بيانات");
  cache.data = local;
  cache.loadedAt = 0; // تُعاد القراءة من فايربيز في أول فرصة
  writeLocalIfMissing(local);
  return local;
}

function writeLocalIfMissing(db: DB) {
  if (!fs.existsSync(DB_FILE)) writeLocal(db);
}

/* ---------- الكتابة ---------- */

/** يحفظ فوراً محلياً، ويُدرج الكتابة السحابية في الطابور. */
export function commit(db: DB) {
  cache.data = db;
  cache.loadedAt = Date.now();
  writeLocal(db);

  if (!firebaseUsable()) return;
  pending = pending
    .then(() => writeChain({ ...db, _syncedAt: new Date().toISOString() }))
    .then(() => {
      lastSyncAt = new Date().toISOString();
      lastError = null;
    })
    .catch((e: Error) => {
      lastError = e.message;
    });
}

/** انتظار اكتمال كل الكتابات المعلّقة (يُستدعى قبل الردّ في المسارات المهمّة). */
export async function flushStore(): Promise<{ ok: boolean; error: string | null }> {
  await pending;
  return { ok: !lastError, error: lastError };
}

/** إسقاط النسخة المخزّنة لإجبار قراءة جديدة. */
export function invalidate() {
  cache.loadedAt = 0;
}

function toArrayLength(v: unknown): number {
  return Array.isArray(v) ? v.length : v && typeof v === "object" ? Object.keys(v).length : 0;
}

export function storeState() {
  return {
    source,
    lastSyncAt,
    lastError,
    cachedAt: cache.loadedAt ? new Date(cache.loadedAt).toISOString() : null,
    firebaseUsable: firebaseUsable(),
  };
}


/* ================================================================== */
/*  سلسلة القواعد                                                      */
/* ================================================================== */
/*
  الغرضان: السعةُ والاستمرار. قاعدةٌ تمتلئ فتستوعب التاليةُ ما بعدها،
  وقاعدةٌ تتعطّل فتحلّ التاليةُ محلَّها بلا تدخّل.

  وكلُّ قاعدةٍ تحمل النسخةَ كاملةً — ومنها قائمةُ القواعد نفسُها. فأيُّ
  قاعدةٍ تردّ تعرف أخواتِها، وتُحلّ بذلك مسألةُ «كيف نقرأ القائمة
  والرئيسيةُ معطّلة؟».
*/

/** القواعد المعروفة الآن: المحفوظةُ في آخر نسخةٍ قُرئت + قاعدةُ البيئة. */
function knownNodes(): DbNode[] {
  return orderNodes(cache.data?.integrations?.databases);
}

/** يُحوّل القاعدة إلى إعدادِ اتصال. */
function asConfig(n: DbNode): FirebaseConfig {
  return {
    databaseURL: n.url,
    clientEmail: n.clientEmail,
    privateKey: n.privateKey,
    secret: n.secret,
  };
}

/**
 * يقرأ من أوّل قاعدةٍ تردّ.
 * الأخطاءُ تُجمع فلا تضيع، وتُرفع آخرُها إن سقطت السلسلةُ كلُّها.
 */
async function readChain(): Promise<DB | null> {
  const nodes = knownNodes();

  /* بلا فروع: المسار القديم نفسُه بلا زيادة. */
  if (nodes.length <= 1) {
    const data = await fbGet<DB>(ROOT);
    return data;
  }

  let last: Error | null = null;
  for (const n of nodes) {
    try {
      const { data, bytes } = await fbGetFrom<DB>(asConfig(n), ROOT);
      markUp(n.url, bytes);
      if (data) {
        activeUrl = n.url;
        return data;
      }
    } catch (e) {
      last = e as Error;
      markDown(n.url, (e as Error).message);
    }
  }
  if (last) throw last;
  return null;
}

/**
 * يكتب في القاعدة العاملة، ثم يَنسخ إلى البقيّة.
 * النسخُ لا يُنتظَر ولا يُفشِل: الكتابةُ نجحت متى قبلتها قاعدةٌ واحدة،
 * والبقيّةُ نسخٌ للأمان تلحق متى استطاعت.
 */
async function writeChain(payload: DB & { _syncedAt: string }): Promise<void> {
  const nodes = knownNodes();

  if (nodes.length <= 1) {
    await fbSet(ROOT, payload);
    return;
  }

  const target = writeTarget(cache.data?.integrations?.databases) ?? nodes[0];
  let wrote = false;
  let last: Error | null = null;

  /* الهدفُ أوّلاً، فإن أبى جُرِّبت البقيّة بترتيبها. */
  for (const n of [target, ...nodes.filter((x) => x.url !== target.url)]) {
    try {
      await fbSetTo(asConfig(n), ROOT, payload);
      markUp(n.url);
      activeUrl = n.url;
      wrote = true;
      break;
    } catch (e) {
      last = e as Error;
      markDown(n.url, (e as Error).message);
    }
  }

  if (!wrote && last) throw last;

  /* نسخُ الأمان — بلا انتظار وبلا إفشال. */
  for (const n of nodes) {
    if (n.url === activeUrl) continue;
    void fbSetTo(asConfig(n), ROOT, payload)
      .then(() => markUp(n.url))
      .catch((e: Error) => markDown(n.url, e.message));
  }
}

/** عنوانُ القاعدة التي يُقرأ منها ويُكتب فيها الآن — للعرض في اللوحة. */
let activeUrl = "";
export function activeNodeUrl(): string {
  return activeUrl;
}
