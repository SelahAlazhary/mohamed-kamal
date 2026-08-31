/**
 * صفحةٌ غيرُ موجودةٍ داخل اللوحة.
 * ------------------------------------------------------------------
 * لوحُ الأربعمئةِ وأربعةٍ العامُّ يُخرج المشرفَ من سياقه: يقول «عد إلى
 * الرئيسية» ويقصد صفحةَ الطلّاب. ومن ضلّ في اللوحة يريد اللوحةَ لا
 * الموقع. فهذا الملفُّ يبقيه حيث هو ويدلّه على أقرب المقاصد.
 */

import Link from "next/link";
import { Compass, LayoutDashboard, BookOpen, Users } from "lucide-react";

const GO = [
  { href: "/admin", label: "اللوحة", icon: LayoutDashboard },
  { href: "/admin/subjects", label: "المواد", icon: BookOpen },
  { href: "/admin/students", label: "الطلاب", icon: Users },
];

export default function AdminNotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4 py-10">
      <div className="glass w-full max-w-lg rounded-3xl border border-border p-7 text-center shadow-bento">
        <span className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
          <Compass className="size-7" />
        </span>

        <h1 className="font-display mb-2 text-xl font-extrabold">لا صفحةَ هنا</h1>
        <p className="mb-6 text-[13px] leading-relaxed text-muted-foreground">
          الرابطُ الذي فُتح لا يقابله شيءٌ في اللوحة — لعلّه قديمٌ أو فيه خطأٌ
          في الكتابة. وهذه أقربُ المقاصد:
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {GO.map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-border px-4 py-2.5 text-[13px] font-bold transition hover:border-primary/50 hover:text-primary"
            >
              <g.icon className="size-4" />
              {g.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
