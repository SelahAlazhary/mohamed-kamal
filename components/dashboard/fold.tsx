"use client";

/**
 * `Fold` — بطاقةُ قسمٍ تُطوى.
 * ------------------------------------------------------------------
 * صفحاتُ الإدارة كانت أعمدةً طويلةً من البطاقات: صفحةُ المظهر وحدَها
 * أكثرُ من ألفَي سطرٍ في تبويبٍ واحدٍ عشرةُ أقسام. ومن أراد قسماً واحداً
 * مرّ على تسعةٍ قبله، ومن نزل إلى آخرها نسي أوّلها.
 *
 * وهي `Collapse` نفسُه بثوب البطاقة — لا مكوّنٌ ثانٍ يفعل الشيءَ نفسَه
 * بطريقةٍ أخرى، فيختلف السلوكُ بين قسمٍ وقسم.
 *
 * **والافتراضُ مطويّ.** وهذا هو المقصود: الصفحةُ تُفتح فتُرى عناوينُها
 * كلُّها في شاشةٍ واحدة، فيُختار منها. ولو فُتحت كلُّها لعادت الصفحةُ
 * كما كانت وزادها العناوينُ طولاً.
 *
 * **ويُستثنى ما يُعمل به دائماً**: يُعطى `defaultOpen` صراحةً — كالقسم
 * الأوّل في تبويبه، أو ما ينتظر قراراً.
 *
 * والمفتوحُ يُحفظ بمفتاحه: من فتح قسماً وعاد إليه غداً وجده مفتوحاً،
 * فلا يُعيد الفتحَ في كلّ زيارة.
 */

import type { ReactNode } from "react";
import { Collapse } from "@/components/dashboard/collapse";

export function Fold({
  title,
  subtitle,
  icon,
  count,
  tone,
  actions,
  defaultOpen = false,
  storageKey,
  children,
  className = "",
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  count?: number;
  tone?: "alert" | "calm";
  actions?: ReactNode;
  defaultOpen?: boolean;
  /** يُحفظ المفتوحُ بين الزيارات — يُشتقّ من العنوان حين لا يُعطى. */
  storageKey?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Collapse
      title={title}
      subtitle={subtitle}
      icon={icon}
      count={count}
      tone={tone}
      actions={actions}
      defaultOpen={defaultOpen}
      storageKey={storageKey ?? (typeof title === "string" ? `fold.${title}` : undefined)}
      className={className}
    >
      {children}
    </Collapse>
  );
}
