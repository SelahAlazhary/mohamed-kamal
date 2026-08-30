"use client";

/**
 * شريطُ الصفحة — عنوانٌ وإجراءٌ رئيسٌ وفلاتر.
 * ------------------------------------------------------------------
 * كان لكلّ شاشةٍ ترويستُها: عنوانٌ في `PageHeader`، وزرُّ الإضافة تارةً
 * بجانبه وتارةً في وسط الصفحة، والفلاترُ في بطاقةٍ مستقلّةٍ تأكل ثُلثَ
 * الشاشة قبل أن يُرى صفٌّ واحد. فلا يعرف الأستاذُ أين يجد «إضافة» في
 * شاشةٍ لم يفتحها من قبل.
 *
 * **فصار موضعٌ واحدٌ ثابت**: العنوانُ يميناً، والإجراءُ الرئيسُ يساراً في
 * كلّ شاشة، والفلاترُ سطراً تحته لا بطاقةً حوله.
 *
 * **ويلتصق عند التمرير.** الجدولُ يطول، والزرُّ في أعلى الصفحة يعني أنّ
 * من وصل إلى آخر الصفوف يصعد ليضيف. والالتصاقُ يُبقيه في المتناول.
 *
 * **والفلاترُ تُطوى إن كثرت**: أكثرُ الزيارات لا تُصفّي شيئاً، وشريطٌ
 * مفتوحٌ دائماً بستّة حقولٍ يزاحم المحتوى. فيُعرض البحثُ ويُطوى الباقي
 * خلف زرٍّ يحمل عددَ الفلاتر المفعَّلة — فلا يُنسى أنّ الصفحةَ مصفّاة.
 */

import { useState, type ReactNode } from "react";
import { SlidersHorizontal, Search, X } from "lucide-react";

export function PageBar({
  title, subtitle, action, search, filters, activeFilters = 0, onClearFilters,
}: {
  title: string;
  subtitle?: ReactNode;
  /** الإجراءُ الرئيسُ — زرٌّ واحدٌ لا ثلاثة: ما يُفعل هنا أكثرَ من غيره. */
  action?: ReactNode;
  search?: { value: string; onChange: (v: string) => void; placeholder?: string };
  /** حقولُ التصفية — تُطوى خلف زرٍّ ولا تُعرض دائماً. */
  filters?: ReactNode;
  activeFilters?: number;
  onClearFilters?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="ad-bar">
      <div className="ad-bar-row">
        <div className="min-w-0 flex-1">
          <h1 className="ad-bar-title">{title}</h1>
          {subtitle && <p className="ad-bar-sub">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {(search || filters) && (
        <div className="ad-bar-tools">
          {search && (
            <div className="ad-bar-search">
              <Search className="ad-bar-search-i" />
              <input
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
                placeholder={search.placeholder ?? "ابحث…"}
                className="ad-bar-input"
              />
              {search.value && (
                <button type="button" onClick={() => search.onChange("")} aria-label="مسح البحث" className="ad-bar-clear">
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          )}

          {filters && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className={`ad-bar-filter ${activeFilters > 0 ? "is-on" : ""}`}
            >
              <SlidersHorizontal className="size-3.5" />
              تصفية
              {activeFilters > 0 && <span className="ad-bar-count">{activeFilters.toLocaleString("ar-EG")}</span>}
            </button>
          )}

          {activeFilters > 0 && onClearFilters && (
            <button type="button" onClick={onClearFilters} className="ad-bar-reset">
              مسح التصفية
            </button>
          )}
        </div>
      )}

      {filters && open && <div className="ad-bar-panel">{filters}</div>}
    </div>
  );
}

/**
 * شارةُ حالة — لونٌ ورمزٌ معاً لا لونٌ وحدَه.
 * من لا يميّز الألوانَ يقرأ النصَّ والنقطةَ؛ ومن يميّزها يعرف الحالَ من
 * طرف العين بلا قراءة.
 */
export function Badge({
  tone = "neutral", children,
}: {
  tone?: "ok" | "wait" | "bad" | "info" | "neutral";
  children: ReactNode;
}) {
  return (
    <span className={`ad-badge-s ad-t-${tone}`}>
      <span className="ad-badge-dot" />
      {children}
    </span>
  );
}
