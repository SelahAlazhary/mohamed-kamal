"use client";

/**
 * حدُّ الخطأ — عطبٌ يُحاصَر في موضعه.
 * ------------------------------------------------------------------
 * خطأٌ واحدٌ في رسم مكوّنٍ يُسقط شجرةَ React كلَّها: يمحو الصفحةَ ويترك
 * «تعذّر تحميل هذه الصفحة» — فلا يُعرف أيُّ قسمٍ عطِب، ولا يُعمل في
 * الأقسام السليمة حتى يُصلَح العاطب. والمشرفُ يعمل في شاشةٍ فيها عشرةُ
 * أقسام؛ عطبُ واحدٍ لا ينبغي أن يمنعه من التسعة.
 *
 * فيُحاصَر العطبُ في القسم الذي وقع فيه: يُرسم مكانَه لوحٌ يقول ما جرى
 * ويعرض إعادةَ المحاولة، ويبقى ما حولَه يعمل.
 *
 * **وحدُّ الخطأ لا يكون إلّا صنفاً**: `componentDidCatch` لا مقابلَ له في
 * الخطّافات إلى اليوم. فهذا الصنفُ الوحيدُ في المشروع، ولذلك سببُه.
 *
 * والرسالةُ تُعرض ولا تُخفى: نصُّ الخطأ لا يفهمه الأستاذُ غالباً، لكنّه
 * الشيءُ الوحيدُ الذي ينفع حين يُبلِّغ عنه. فيُطوى تحت «التفاصيل».
 */

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

type Props = {
  children: ReactNode;
  /** اسمُ الموضع — يظهر في اللوح ويُعين على تحديد العاطب. */
  label?: string;
};

type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    /* السجلُّ يبقى للمطوّر — واللوحُ للأستاذ. */
    console.error(`[قسم${this.props.label ? `: ${this.props.label}` : ""}]`, error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div
        role="alert"
        className="rounded-2xl border border-rose-500/35 bg-rose-500/[0.06] p-5"
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-rose-500/15 text-rose-500">
            <AlertTriangle className="size-4" />
          </span>
          <p className="font-display font-bold text-rose-600">
            تعذّر عرضُ {this.props.label ? `«${this.props.label}»` : "هذا القسم"}
          </p>
        </div>

        <p className="mb-3 text-[12px] leading-relaxed text-muted-foreground">
          بقيّةُ الشاشة تعمل. أعِد المحاولة، فإن تكرّر الخطأُ فأرسل نصَّ
          التفاصيل كما هو — فيه وحدَه ما يدلّ على السبب.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 px-3 py-1.5 text-[12px] font-bold text-rose-600 transition hover:bg-rose-500/10"
          >
            <RotateCcw className="size-3.5" />
            إعادة المحاولة
          </button>
        </div>

        <details className="mt-3">
          <summary className="cursor-pointer text-[11px] font-semibold text-muted-foreground">
            التفاصيل
          </summary>
          <pre
            dir="ltr"
            className="mt-2 max-h-40 overflow-auto rounded-xl bg-foreground/[0.04] p-3 text-left text-[10px] leading-relaxed"
          >
            {error.message}
          </pre>
        </details>
      </div>
    );
  }
}
