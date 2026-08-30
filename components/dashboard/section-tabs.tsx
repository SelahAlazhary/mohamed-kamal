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

type Entry = { id: string; title: string };

type Ctx = {
  register: (id: string, title: string) => void;
  unregister: (id: string) => void;
  active: string | null;
  /** يُبوَّب فعلاً؟ — دون ثلاثة أقسامٍ تُعرض كلُّها. */
  tabbed: boolean;
};

const SectionTabsCtx = createContext<Ctx | null>(null);

export function useSectionTab(id: string, title: string) {
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
    reg(id, title);
    return () => unreg(id);
  }, [reg, unreg, id, title]);

  if (!ctx) return { hidden: false };
  return { hidden: ctx.tabbed && ctx.active !== id };
}

export function SectionTabs({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Entry[]>([]);
  const [active, setActive] = useState<string | null>(null);

  const register = useCallback((id: string, title: string) => {
    setItems((prev) => {
      const at = prev.findIndex((x) => x.id === id);
      /* المسجَّلُ يبقى في موضعه ولو تغيّر عنوانُه — وإلّا قفز إلى الآخر */
      if (at >= 0) {
        if (prev[at].title === title) return prev;
        const copy = [...prev];
        copy[at] = { id, title };
        return copy;
      }
      return [...prev, { id, title }];
    });
  }, []);

  const unregister = useCallback((id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const tabbed = items.length >= 3;

  /* الافتراضُ أوّلُ قسم — ويُصحَّح إن حُذف القسمُ المعروض. */
  useEffect(() => {
    if (!tabbed) { setActive(null); return; }
    setActive((cur) => (cur && items.some((x) => x.id === cur) ? cur : items[0]?.id ?? null));
  }, [items, tabbed]);

  const ctx = useMemo<Ctx>(() => ({ register, unregister, active, tabbed }), [register, unregister, active, tabbed]);

  return (
    <SectionTabsCtx.Provider value={ctx}>
      {children}

      {tabbed && (
        <nav
          aria-label="أقسام الصفحة"
          className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex justify-center px-4 lg:pr-[18.5rem]"
        >
          <div className="pointer-events-auto flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-border bg-white/95 p-1.5 shadow-[0_2px_6px_rgba(16,24,40,.08),0_16px_40px_-16px_rgba(16,24,40,.35)] backdrop-blur-xl dark:bg-card/95">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/12 text-primary">
              <LayoutList className="size-4" />
            </span>
            {items.map((i, n) => (
              <button
                key={i.id}
                type="button"
                onClick={() => {
                  setActive(i.id);
                  /* القفزُ إلى أعلى الشاشة: القسمُ الجديد يبدأ من أوّله
                     لا من موضع التمرير الذي تركه سابقُه. */
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                aria-current={active === i.id ? "true" : undefined}
                className={`font-kufi flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                  active === i.id
                    ? "btn-glow text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className={`text-[9px] ${active === i.id ? "opacity-80" : "opacity-60"}`}>
                  {(n + 1).toLocaleString("ar-EG")}
                </span>
                {i.title}
              </button>
            ))}
          </div>
        </nav>
      )}
    </SectionTabsCtx.Provider>
  );
}
