"use client";

/**
 * تبويبُ الأقسام — قسمٌ واحدٌ في الشاشة.
 * ------------------------------------------------------------------
 * ثلاثةُ مطالبَ بدت متعارضةً وهي ليست كذلك:
 *
 *   ــ **لا قوائمَ تُطوى**: الطيُّ يُخفي، ومن لا يعرف أين الحقلُ يفتح
 *     الألواحَ واحداً واحداً ليبحث فيها.
 *   ــ **أقسامٌ في بطاقات**: لكلّ مهمّةٍ بطاقتُها بعنوانها ووصفها.
 *   ــ **ولا شاشاتٍ طويلة**: والأقسامُ المفتوحةُ كلُّها تُطيل الشاشةَ أكثرَ
 *     ممّا كانت.
 *
 * والجامعُ بينها **التبويب**: البطاقاتُ كما هي، ويُعرض منها واحدةٌ فقط.
 * فلا طيَّ يُخفي، ولا تمريرَ يطول، والشاشةُ في كلّ حالٍ بقدر مهمّةٍ واحدة.
 *
 * **والتسجيلُ من البطاقة لا من الصفحة.** كلُّ `Section` تُعرّف نفسَها عند
 * التركيب، فيُبنى الشريطُ من الموجود فعلاً — وصفحةٌ تُضاف غداً تُبوَّب بلا
 * سطرٍ يُكتب لها، وقسمٌ يظهر بشرطٍ يدخل الشريطَ ويخرج منه معه.
 *
 * **ولا تبويبَ لقسمٍ أو قسمين**: ما يُرى كلُّه في شاشةٍ لا يحتاج تبويباً،
 * والشريطُ فوقه زحامٌ لا تنظيم.
 *
 * **والترتيبُ ترتيبُ التركيب** — وهو ترتيبُ الصفحة نفسِه، فيقرأ الشريطُ
 * كما تُقرأ الشاشة.
 */

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  type ReactNode,
} from "react";
import { LayoutList } from "lucide-react";

type Entry = { id: string; title: string; group?: string };

type Ctx = {
  register: (id: string, title: string, group?: string) => void;
  unregister: (id: string) => void;
  active: string | null;
  /** يُبوَّب فعلاً؟ — دون ثلاثة أقسامٍ تُعرض كلُّها. */
  tabbed: boolean;
};

const SectionTabsCtx = createContext<Ctx | null>(null);

export function useSectionTab(id: string, title: string, group?: string) {
  const ctx = useContext(SectionTabsCtx);
  const reg = ctx?.register;
  const unreg = ctx?.unregister;
  /*
    الترتيبُ ترتيبُ التسجيل، والتسجيلُ في أثرٍ — وآثارُ الإخوة تعمل بترتيب
    الشجرة. فيأتي التسجيلُ بترتيب الصفحة نفسِه بلا عدّادٍ يُدار.

    وكان هنا عدّادٌ عامٌّ يُصفَّر في أثرٍ عند تبديل الصفحة، وهو خطأ: أثرُ
    الأب يعمل **بعد** آثار الأبناء، فيُصفَّر السجلُّ بعد أن سجّلوا فيه
    فتختفي أقسامُ الصفحة الجديدة. والتنظيفُ يقع وحدَه: أقسامُ الصفحة
    القديمة تُلغي تسجيلَها عند تفكيكها.
  */
  useEffect(() => {
    if (!reg || !unreg) return;
    reg(id, title, group);
    return () => unreg(id);
  }, [reg, unreg, id, title, group]);

  if (!ctx) return { hidden: false };
  return { hidden: ctx.tabbed && ctx.active !== id };
}

export function SectionTabs({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Entry[]>([]);
  const [active, setActive] = useState<string | null>(null);

  const register = useCallback((id: string, title: string, group?: string) => {
    setItems((prev) => {
      const at = prev.findIndex((x) => x.id === id);
      /* المسجَّلُ يبقى في موضعه ولو تغيّر عنوانُه — وإلّا قفز إلى الآخر */
      if (at >= 0) {
        if (prev[at].title === title && prev[at].group === group) return prev;
        const copy = [...prev];
        copy[at] = { id, title, group };
        return copy;
      }
      return [...prev, { id, title, group }];
    });
  }, []);

  const unregister = useCallback((id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const tabbed = items.length >= 3;

  /*
    مجموعاتٌ فوق الأقسام — لِما زاد على ثمانية.
    شاشةُ التخصيص سبعةَ عشرَ قسماً؛ وشريطٌ فيه سبعَ عشرةَ شارةً يُمرَّر
    عرضاً ليس تبسيطاً، بل هو القائمةُ الطويلةُ نفسُها في ثوبٍ آخر.
    فتُجمع في خمسٍ أو ستّ، ويُعرض من الثانية إلا ما كان في المفتوحة —
    فيبقى المرئيُّ في كلّ لحظةٍ قدرَ ما تُمسكه العين.

    ولا مجموعاتٍ إن لم تُعلَن، ولا إن كانت واحدةً: طبقةٌ لا تُقسّم شيئاً
    زحامٌ لا ترتيب.
  */
  const groups = useMemo(() => {
    const out: string[] = [];
    items.forEach((i) => { if (i.group && !out.includes(i.group)) out.push(i.group); });
    return out;
  }, [items]);
  const grouped = tabbed && groups.length >= 2 && items.every((i) => i.group);

  const [group, setGroup] = useState<string | null>(null);
  useEffect(() => {
    if (!grouped) { setGroup(null); return; }
    setGroup((cur) => (cur && groups.includes(cur) ? cur : groups[0] ?? null));
  }, [grouped, groups]);

  /* ما يُعرض في صفّ الأقسام: أقسامُ المجموعة المفتوحة، أو الكلُّ بلا مجموعات */
  const shown = grouped ? items.filter((i) => i.group === group) : items;

  /* الافتراضُ أوّلُ قسم — ويُصحَّح إن حُذف القسمُ المعروض. */
  useEffect(() => {
    if (!tabbed) { setActive(null); return; }
    setActive((cur) => (cur && shown.some((x) => x.id === cur) ? cur : shown[0]?.id ?? null));
  }, [shown, tabbed]);

  const ctx = useMemo<Ctx>(() => ({ register, unregister, active, tabbed }), [register, unregister, active, tabbed]);

  return (
    <SectionTabsCtx.Provider value={ctx}>
      {/*
        الشريطُ في الواجهة لا عائماً في الأسفل.
        العائمُ يُغطّي آخرَ الشاشة ويُنازع أزرارَ الحفظ مكانَها، ويُقرأ
        شريطَ أدواتٍ لا فهرسَ أقسام. وموضعُه الطبيعيُّ أعلى المحتوى:
        يُقرأ أوّلَ ما تُفتح الشاشةُ فيُعرف ما فيها قبل النزول.

        و`sticky` لا `fixed`: يبقى في مجرى الصفحة فلا يُغطّي شيئاً، ويلصق
        بأعلاها عند التمرير فيبقى في المتناول. و`top` بقدر ترويسة اللوحة
        الملتصقة، وإلّا اختفى تحتها.
      */}
      {tabbed && (
        <nav
          aria-label="أقسام الصفحة"
          className="sticky top-[4.5rem] z-[60] -mx-4 mb-4 space-y-2 px-4 sm:-mx-6 sm:px-6"
        >
          {grouped && (
            <div className="flex max-w-full items-center gap-1.5 overflow-x-auto">
              {groups.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGroup(g)}
                  className={`font-kufi shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[11px] font-extrabold transition ${
                    group === g
                      ? "bg-[hsl(var(--primary))] text-white"
                      : "border border-border bg-card/80 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          )}
          <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-[1.25rem] border border-border/70 bg-white/95 p-1.5 shadow-[0_1px_2px_rgba(16,24,40,.05),0_8px_24px_-12px_rgba(16,24,40,.2)] backdrop-blur-xl dark:bg-card/95">
            <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-[hsl(var(--gold)/0.22)] text-primary">
              <LayoutList className="size-4" />
            </span>
            {shown.map((i, n) => (
              <button
                key={i.id}
                type="button"
                onClick={() => setActive(i.id)}
                aria-current={active === i.id ? "true" : undefined}
                className={`font-kufi flex shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl px-3.5 py-2 text-[11.5px] font-bold transition ${
                  active === i.id
                    ? "btn-glow text-white shadow-[0_4px_12px_-4px_hsl(var(--primary)/.5)]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {/* الرقمُ يقول «الثالثُ من ستّة» — موضعٌ لا زخرفة */}
                <span
                  className={`grid size-4 place-items-center rounded-full text-[9px] font-extrabold [font-variant-numeric:tabular-nums] ${
                    active === i.id ? "bg-white/25" : "bg-muted-foreground/15"
                  }`}
                >
                  {(n + 1).toLocaleString("ar-EG")}
                </span>
                {i.title}
              </button>
            ))}
          </div>
        </nav>
      )}

      {children}
    </SectionTabsCtx.Provider>
  );
}
