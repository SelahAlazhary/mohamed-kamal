"use client";

/**
 * شريطُ الأقسام العائم.
 * ------------------------------------------------------------------
 * الشاشاتُ صارت أقساماً ظاهرةً في بطاقات — وهذا يحلّ التداخل ويُبقي
 * الطول: شاشةُ المظهر أحدَ عشرَ قسماً، وشاشةُ التخصيص سبعةَ عشر. ومن
 * أراد السابعَ مرّ على ستّةٍ قبله، ومن نزل إلى آخرها لم يعرف كم بقي.
 *
 * فهذا شريطٌ يطفو فوق الشاشة يحمل أسماءَ أقسامها: يُقرأ منه ما فيها
 * بنظرة، ويُقفَز إلى أيّها بضغطة، ويُضاء الذي أنت فيه وأنت تُمرّر.
 *
 * **ولا يُوصَل بيدٍ في كلّ صفحة.** يمسح الصفحةَ بحثاً عن `[data-section]`
 * فيجد كلَّ قسمٍ فيها مهما كان مصدرُه — فصفحةٌ تُضاف غداً تناله بلا سطرٍ
 * واحدٍ يُكتب لها. ولو مُرِّرت الأقسامُ خاصّيةً لوجب تعديلُ كلّ صفحة.
 *
 * **ولا يظهر إلّا حيث يفيد**: أقلُّ من ثلاثة أقسامٍ تُرى كلُّها بلا شريط،
 * وشريطٌ فوقها زحامٌ لا تنظيم.
 *
 * **والقفزُ يترك مكاناً للترويسة**: الترويسةُ ملتصقةٌ بأعلى الشاشة، و
 * `scrollIntoView` يضع القسمَ تحتها فيُخفي عنوانَه — فيُطرح ارتفاعُها.
 */

import { useEffect, useState } from "react";
import { LayoutList } from "lucide-react";

type Item = { id: string; title: string };

/** ارتفاعُ الترويسة الملتصقة — يُطرح من موضع القفز. */
const BAR = 96;

export function SectionNav() {
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    /*
      المسحُ يتكرّر مع تغيّر الصفحة.
      لوحةُ الإدارة تتنقّل بلا إعادة تحميل، والقراءةُ مرّةً واحدةً تُبقي
      أقسامَ الصفحة السابقة. و`MutationObserver` يلتقط كلَّ تبديل.
    */
    let raf = 0;
    const scan = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const nodes = [...document.querySelectorAll<HTMLElement>("[data-section]")];
        nodes.forEach((n, i) => { if (!n.id) n.id = `sec-${i + 1}`; });
        setItems(nodes.map((n) => ({ id: n.id, title: n.dataset.section || "" })));
      });
    };
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { mo.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    if (items.length < 3) return;
    /*
      المضيءُ هو أعلى قسمٍ ظاهرٍ لا أوّلُ ما يعبر الحدّ.
      و`rootMargin` العلويُّ يزيح خطَّ القياس تحت الترويسة، فلا يُضاء قسمٌ
      مختفٍ خلفَها.
    */
    const seen = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.isIntersecting));
        const first = items.find((i) => seen.get(i.id));
        if (first) setActive(first.id);
      },
      { rootMargin: `-${BAR}px 0px -55% 0px`, threshold: 0 }
    );
    items.forEach((i) => {
      const el = document.getElementById(i.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [items]);

  if (items.length < 3) return null;

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - BAR;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <nav
      aria-label="أقسام الصفحة"
      className="sec-nav pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex justify-center px-4 lg:pr-[18.5rem]"
    >
      <div className="glass pointer-events-auto flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-border bg-white/90 p-1.5 shadow-[0_2px_6px_rgba(16,24,40,.08),0_16px_40px_-16px_rgba(16,24,40,.35)] backdrop-blur-xl dark:bg-card/90">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/12 text-primary">
          <LayoutList className="size-4" />
        </span>
        {items.map((i) => (
          <button
            key={i.id}
            type="button"
            onClick={() => go(i.id)}
            className={`font-kufi shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
              active === i.id
                ? "btn-glow text-white"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {i.title}
          </button>
        ))}
      </div>
    </nav>
  );
}
