import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { DashboardShell } from "@/components/dashboard/shell";
import { SectionNav } from "@/components/dashboard/section-nav";
import { adminNav } from "@/lib/dashboard-data";
import { getSession } from "@/lib/session";
import { loadDB, getDB } from "@/lib/db";
import { can, isOwner, permForPath } from "@/lib/perms";
import { findToolbar, toolbarClass, stickClass } from "@/lib/toolbar-styles";
import { findIconFrame, iconFrameClass, iconFrameVars } from "@/lib/icon-frames";
import { findIconMotion, iconMotionClass } from "@/lib/icon-motion";
import { findIconCover, iconCoverClass } from "@/lib/icon-covers";

export const dynamic = "force-dynamic";
export const metadata = { title: "لوحة الإدارة", robots: { index: false } };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login?next=/admin");

  await loadDB();
  const me = getDB().users.find((u) => u.id === session.uid);
  if (!me || me.role !== "admin" || !me.active) redirect("/login?next=/admin");

  // القائمة تعرض ما يملكه هذا المشرف فقط
  const nav = adminNav.filter((item) => {
    const perm = permForPath(item.href);
    return perm === null || can(me, perm);
  });

  /**
   * حماية الصفحة نفسها: إخفاء الرابط لا يكفي — من يكتب المسار يدوياً
   * يُعاد إلى «نظرة عامة». المسار يصل من الوسيط في ترويسة x-pathname.
   */
  const path = (await headers()).get("x-pathname") ?? "";
  const needed = path ? permForPath(path) : null;
  if (needed && !can(me, needed)) redirect("/admin?denied=1");

  /*
    شريط الأدوات: لوحة الإدارة كانت الشاشةَ الوحيدة التي لا تحمل أصنافه،
    فمن يختار التصميم من هنا لا يرى شريطَه هو يتغيّر أبداً.
  */
  const bar = findToolbar(getDB().content.toolbarStyle);

  return (
    // admin-skin: هوية بصرية خاصة بلوحة الإدارة (تصميم فقط — لا يمسّ الموقع أو بوابة الطالب)
    <div style={iconFrameVars(getDB().content.iconFrameColors)} className={`admin-skin ${iconFrameClass(findIconFrame(getDB().content.iconFrame))} ${iconCoverClass(findIconCover(getDB().content.iconCover))} ${iconMotionClass(findIconMotion(getDB().content.iconMotion))} ${toolbarClass(bar)} ${stickClass(getDB().content.toolbarStick)} ${getDB().content.toolbarHidden ? "tools-hidden" : ""}`} data-toolbar={bar.id}>
      <DashboardShell
        nav={nav}
        role="admin"
        user={{
          name: session.name,
          sub: isOwner(me) ? "مالكة المنصّة" : "مشرف",
          avatar: session.name.charAt(0),
        }}
      >
        {children}
        {/* شريطُ أقسام الصفحة — يمسحها بنفسه فلا يُوصَل بكلّ شاشة */}
        <SectionNav />
      </DashboardShell>
    </div>
  );
}
