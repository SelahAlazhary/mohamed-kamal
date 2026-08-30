"use client";

/**
 * شبكةُ الأقسام — بطاقاتٌ تُفتح نوافذَ.
 * ------------------------------------------------------------------
 * مرّ التقسيمُ بثلاث صور، وكلُّ واحدةٍ حلّت مشكلةً وأورثت أخرى:
 *
 *   ١ ــ **ألواحٌ تُطوى**: تُخفي ما لا يُعرف مكانُه، فمن يبحث يفتحها
 *        واحداً واحداً، ومن يعرف يضغط ضغطةً زائدةً في كلّ زيارة.
 *   ٢ ــ **أقسامٌ مفتوحةٌ كلُّها**: تُري كلَّ شيءٍ وتُطيل الشاشةَ أكثرَ ممّا
 *        كانت — أحدَ عشرَ قسماً مفتوحاً في شاشة المظهر.
 *   ٣ ــ **شريطُ تبويبات**: يُقصّر الشاشة، ويُخفي الأسماءَ في شريطٍ يُمرَّر
 *        عرضاً حين تكثر — سبعَ عشرةَ شارةً في التخصيص.
 *
 * **والرابعةُ تحلّ الثلاثَ معاً**: الشاشةُ تفتح على **شبكةِ بطاقات** —
 * كلُّ قسمٍ بطاقةٌ بأيقونته واسمه وسطرٍ يقول ما يفعل. فيُرى ما في الشاشة
 * كلُّه بنظرةٍ واحدة (لا يُخفى شيء)، في مساحةٍ لا تطول (البطاقاتُ صفوفٌ لا
 * عمود)، وبأسماءٍ كاملةٍ لا شاراتٍ مقتضبة.
 *
 * **والضغطُ يفتح نافذةً للقسم وحدَه**: مساحةٌ واسعةٌ لا يزاحمها شيء، ولا
 * تمريرَ في صفحةٍ طويلة. والإغلاقُ يُعيد إلى الشبكة، فالانتقالُ بين قسمين
 * ضغطتان لا بحثٌ في عمود.
 *
 * ------------------------------------------------------------------
 * **والقسمُ يبقى مركَّباً وإن لم يُعرض** (`hidden`): نزعُه من الشجرة يُفقد
 * ما كُتب في حقوله ويُرجعه فارغاً عند العودة — وهو أسوأُ ما يقع في نموذجٍ
 * طويلٍ كنموذج الخطّة.
 *
 * **والبطاقةُ تُعرّف نفسَها**: كلُّ `Section` تُسجّل عنوانَها ووصفَها
 * وأيقونتَها عند التركيب، فتُبنى الشبكةُ من الموجود فعلاً — وصفحةٌ تُضاف
 * غداً تنالها بلا سطرٍ يُكتب لها.
 *
 * **ولا شبكةَ لقسمٍ أو قسمين**: ما يُرى كلُّه في شاشةٍ لا يحتاج بابَ دخول.
 */

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  type ReactNode,
} from "react";
import { X } from "lucide-react";

type Entry = {
  id: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  group?: string;
  alert?: boolean;
  count?: number;
};

type Ctx = {
  register: (e: Entry) => void;
  unregister: (id: string) => void;
  active: string | null;
  close: () => void;
  /** تُعرض شبكةٌ فعلاً؟ — دون ثلاثة أقسامٍ تبقى في مكانها. */
  gridded: boolean;
};

const SectionTabsCtx = createContext<Ctx | null>(null);

export function useSectionTab(e: Entry) {
  const ctx = useContext(SectionTabsCtx);
  const reg = ctx?.register;
  const unreg = ctx?.unregister;
  const { id, title, subtitle, group, alert, count, icon } = e;

  /*
    الترتيبُ ترتيبُ التسجيل، والتسجيلُ في أثرٍ — وآثارُ الإخوة تعمل بترتيب
    الشجرة. فيأتي التسجيلُ بترتيب الصفحة نفسِه بلا عدّادٍ يُدار.

    والأيقونةُ خارج قائمة التبعيّات: هي عنصرٌ جديدٌ في كلّ رسم، فوضعُها
    فيها يُعيد التسجيلَ بلا انقطاع.
  */
  useEffect(() => {
    if (!reg || !unreg) return;
    reg({ id, title, subtitle, icon, group, alert, count });
    return () => unreg(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reg, unreg, id, title, subtitle, group, alert, count]);

  if (!ctx) return { hidden: false, inModal: false, close: () => {} };
  return {
    hidden: ctx.gridded && ctx.active !== id,
    inModal: ctx.gridded && ctx.active === id,
    close: ctx.close,
  };
}

export function SectionTabs({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Entry[]>([]);
  const [active, setActive] = useState<string | null>(null);

  const register = useCallback((e: Entry) => {
    setItems((prev) => {
      const at = prev.findIndex((x) => x.id === e.id);
      if (at < 0) return [...prev, e];
      const same =
        prev[at].title === e.title && prev[at].subtitle === e.subtitle &&
        prev[at].group === e.group && prev[at].alert === e.alert && prev[at].count === e.count;
      if (same) return prev;
      /* المسجَّلُ يبقى في موضعه ولو تغيّر عنوانُه — وإلّا قفز إلى الآخر */
      const copy = [...prev];
      copy[at] = e;
      return copy;
    });
  }, []);

  const unregister = useCallback((id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
    setActive((cur) => (cur === id ? null : cur));
  }, []);

  const gridded = items.length >= 3;
  const close = useCallback(() => setActive(null), []);

  /* الهروبُ يُغلق — ونافذةٌ لا تُغلق إلّا بالفأرة تُتعب من يكتب */
  useEffect(() => {
    if (!active) return;
    const k = (ev: KeyboardEvent) => { if (ev.key === "Escape") setActive(null); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [active]);

  /* الصفحةُ لا تتمرّر خلف النافذة — وإلّا ضاع موضعُ الشبكة عند الإغلاق */
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [active]);

  const groups = useMemo(() => {
    const out: string[] = [];
    items.forEach((i) => { if (i.group && !out.includes(i.group)) out.push(i.group); });
    return out;
  }, [items]);

  const ctx = useMemo<Ctx>(
    () => ({ register, unregister, active, close, gridded }),
    [register, unregister, active, close, gridded]
  );

  const card = (i: Entry) => (
    <button key={i.id} type="button" onClick={() => setActive(i.id)} className={`sg-card ${i.alert ? "is-alert" : ""}`}>
      {i.icon && <span className="sg-card-i">{i.icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="sg-card-t">{i.title}</span>
        {i.subtitle && <span className="sg-card-h">{i.subtitle}</span>}
      </span>
      {i.count !== undefined && i.count > 0 && (
        <span className="sg-card-n">{i.count.toLocaleString("ar-EG")}</span>
      )}
    </button>
  );

  const grouped = groups.length >= 2 && items.every((i) => i.group);

  return (
    <SectionTabsCtx.Provider value={ctx}>
      {/*
        الشبكةُ تُرسم قبل المحتوى، والأقسامُ تحتها مخفيّةٌ إلّا المفتوحَ —
        وهو يرسم نفسَه نافذةً. فيبقى ترتيبُ الشجرة ترتيبَ الصفحة.
      */}
      {gridded && (
        <div className="mb-4">
          {grouped
            ? groups.map((g) => (
                <div key={g} className="sg-group">
                  <p className="sg-group-t">{g}</p>
                  <div className="sg">{items.filter((i) => i.group === g).map(card)}</div>
                </div>
              ))
            : <div className="sg">{items.map(card)}</div>}
        </div>
      )}

      {children}
    </SectionTabsCtx.Provider>
  );
}

/** غلافُ النافذة — يستعمله `Section` حين يكون هو المفتوح. */
export function SectionModal({
  title, subtitle, icon, actions, onClose, children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="lm-scrim"
      role="dialog"
      aria-label={typeof title === "string" ? title : "قسم"}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="lm">
        <header className="lm-head">
          {icon && <span className="sg-card-i">{icon}</span>}
          <div className="min-w-0 flex-1">
            <h2 className="lm-title">{title}</h2>
            {subtitle && <p className="lm-sub">{subtitle}</p>}
          </div>
          {actions}
          <button onClick={onClose} className="lm-x" aria-label="إغلاق"><X className="size-4" /></button>
        </header>
        <div className="lm-body">{children}</div>
      </div>
    </div>
  );
}
