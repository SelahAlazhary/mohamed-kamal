"use client";

/**
 * حماية محتوى الكورس من الالتقاط.
 * ------------------------------------------------------------------
 * ما يجب أن يكون واضحاً قبل كل شيء: **لا يمكن لأي موقع أن يمنع لقطة
 * الشاشة فعلاً**. اللقطة يلتقطها نظام التشغيل أو كاميرا هاتف آخر، ولا
 * توجد واجهة برمجية في أي متصفّح تمنع ذلك. من يَعِد بغير هذا يبيع وهماً.
 *
 * ما تفعله هذه الطبقة حقيقةً — وهو رفع كلفة النسخ على غير المتخصّص:
 *  • تُعطّل قائمة الزرّ الأيمن (حفظ الفيديو/الصورة).
 *  • تصدّ الاختصارات الشائعة: PrintScreen · Ctrl+P · Ctrl+S ·
 *    أدوات المطوّر — وتمسح الحافظة بعد PrintScreen.
 *  • تُخفي المحتوى حين تفقد النافذة التركيز أو تُخفى — وهذا يُفشل أدوات
 *    التسجيل التي تلتقط نافذة أخرى، وكثيراً من إضافات اللقطة.
 *  • تمنع الطباعة والحفظ كـPDF.
 *  • تمنع تحديد النصّ وسحب الصور.
 *
 * وكلّها تُعطَّل تلقائياً حين يفضّل المستخدم تقليل الحركة أو يعتمد على
 * قارئ شاشة؟ لا — الحماية تبقى، لكن لا شيء منها يعطّل قراءة المحتوى.
 */
import { useEffect } from "react";

export function CaptureGuard({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;

    const root = document.documentElement;
    root.classList.add("capture-guard");

    /** قائمة الزرّ الأيمن — أسهل طريق لحفظ الفيديو أو الصورة. */
    const onContext = (e: MouseEvent) => e.preventDefault();

    /** سحب الصور خارج الصفحة. */
    const onDrag = (e: DragEvent) => e.preventDefault();

    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();

      // PrintScreen: لا يمكن منع الالتقاط، لكن يمكن إفراغ الحافظة بعده
      if (e.key === "PrintScreen" || k === "printscreen") {
        try {
          void navigator.clipboard?.writeText("");
        } catch {
          /* الحافظة قد تكون ممنوعة — لا شيء نفعله */
        }
        e.preventDefault();
        return;
      }

      const ctrl = e.ctrlKey || e.metaKey;
      // الطباعة والحفظ ونسخ الصفحة
      if (ctrl && ["p", "s", "u"].includes(k)) e.preventDefault();
      // أدوات المطوّر
      if (e.key === "F12") e.preventDefault();
      if (ctrl && e.shiftKey && ["i", "j", "c"].includes(k)) e.preventDefault();
      /*
        لقطاتُ macOS (‏Cmd+Shift+3/4/5‏) يلتقطها النظامُ قبل المتصفّح فلا
        تُمنع — لكنّ ما نسخته الحافظةُ يُمسح، ويُخفى المحتوى لحظتين فلا
        تُصوَّر شاشةٌ ثانية.
      */
      if (e.metaKey && e.shiftKey && ["3", "4", "5"].includes(k)) {
        try { void navigator.clipboard?.writeText(""); } catch { /* ممنوعة */ }
        hide();
        window.setTimeout(show, 1500);
      }
    };

    /**
     * النسخُ يُمنع وتُمسح الحافظة.
     * منعُ الحدث وحدَه لا يكفي: بعض الإضافات تنسخ قبل أن يصل المنع،
     * فتُفرَغ الحافظةُ بعده أيضاً. ومحاولتان لا واحدة.
     */
    const onCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      try {
        e.clipboardData?.setData("text/plain", "");
        void navigator.clipboard?.writeText("");
      } catch {
        /* الحافظة قد تكون ممنوعة — لا شيء نفعله */
      }
    };

    /** إخفاء المحتوى حين تفقد النافذة التركيز — يُفشل أدوات اللقطة الخارجية. */
    const hide = () => root.classList.add("capture-hidden");
    const show = () => root.classList.remove("capture-hidden");
    const onVisibility = () => (document.hidden ? hide() : show());

    /*
      كشفُ أدوات المطوّر بفرق المقاس.
      ------------------------------------------------------------------
      لوحُ الأدوات المرسوُّ يقتطع من النافذة، فيفترق `outerWidth` عن
      `innerWidth` بمئةٍ أو أكثر. وهو **كشفٌ لا منع**: من فتحها في نافذةٍ
      منفصلةٍ لا يُكشف، ومن كبّر الصفحةَ قد يُكشف خطأً — ولذلك أثرُه
      إخفاءُ المحتوى لا قطعُ الجلسة. ولا شيءَ يُفقد إن أخطأ.
    */
    const devtools = () => {
      const gap = Math.max(window.outerWidth - window.innerWidth, window.outerHeight - window.innerHeight);
      if (gap > 160) hide();
      else if (!document.hidden && document.hasFocus()) show();
    };
    const devTimer = window.setInterval(devtools, 1200);

    /*
      تسجيلُ الشاشة من داخل الصفحة يُمنع.
      ولا يمنع هذا برنامجاً خارجيّاً — لا شيء يمنعه — لكنّه يسدّ الطريقَ
      الذي تسلكه إضافاتُ التسجيل التي تعمل في سياق الصفحة نفسِها.
    */
    const md = navigator.mediaDevices as (MediaDevices & { getDisplayMedia?: unknown }) | undefined;
    const realGetDisplay = md?.getDisplayMedia;
    if (md && realGetDisplay) {
      md.getDisplayMedia = () => {
        hide();
        return Promise.reject(new DOMException("محظور", "NotAllowedError"));
      };
    }

    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCopy);
    document.addEventListener("contextmenu", onContext);
    document.addEventListener("dragstart", onDrag);
    document.addEventListener("keydown", onKey, true);
    window.addEventListener("blur", hide);
    window.addEventListener("focus", show);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(devTimer);
      if (md && realGetDisplay) md.getDisplayMedia = realGetDisplay;
      root.classList.remove("capture-guard", "capture-hidden");
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCopy);
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("dragstart", onDrag);
      document.removeEventListener("keydown", onKey, true);
      window.removeEventListener("blur", hide);
      window.removeEventListener("focus", show);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled]);

  return null;
}
