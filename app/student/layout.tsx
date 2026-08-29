import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/shell";
import { studentNav } from "@/lib/dashboard-data";
import { getSession } from "@/lib/session";
import { getPublicDB, loadDB, sessionUser } from "@/lib/db";
import { findSkin, findLayout, findMobile, mobileClass, skinCss } from "@/lib/skins";
import { SkinOrnament } from "@/components/brand/skin-ornaments";
import { findDesign } from "@/lib/designs";
import { findTile, tileClass, tileColorVars, tileArtVars, tileArtClass } from "@/lib/tile-styles";
import { findToolbar, toolbarClass, stickClass } from "@/lib/toolbar-styles";
import { findMotion, motionClass, motionVars } from "@/lib/motion-styles";
import { ActivityTracker } from "@/components/student/activity-tracker";
import { findSideNav, sideNavClass, findDock, dockClass, navColorVars, DEFAULT_ICON_SET } from "@/lib/nav-styles";
import { findIconFrame, iconFrameClass, iconFrameVars } from "@/lib/icon-frames";
import { findIconMotion, iconMotionClass } from "@/lib/icon-motion";
import { findIconCover, iconCoverClass } from "@/lib/icon-covers";
import { designVars } from "@/lib/designs";

export const dynamic = "force-dynamic";
export const metadata = { title: "بوابة الطالب", robots: { index: false } };

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "student") redirect("/login?next=/student");

  /* الجلسة رمز موقّع لا يُبطله حذف الحساب من اللوحة، فنتحقّق من الحساب
     نفسه عند كل تحميل: المحذوف أو الموقوف يُعاد إلى صفحة الدخول فوراً. */
  await loadDB();
  if (!sessionUser(session)) redirect("/login?gone=1");

  const pub = getPublicDB();
  const me = pub.users.find((u) => u.id === session.uid);

  /* المظهر يُحقن كمتغيّرات CSS على غلاف واحد: ثيم واحد فقط يصل
     المتصفّح بدل عشرين كتلة أنماط لا يُعرض منها إلا واحدة. */
  const skin = findSkin(pub.content?.studentSkin);
  const layout = findLayout(pub.content?.studentLayout);
  const mobile = findMobile(pub.content?.studentMobile);
  const design = findDesign(pub.content?.studentDesign);
  const side = findSideNav(pub.content?.sideNav);
  const dock = findDock(pub.content?.dockStyle);
  const icons = pub.content?.navIcons ?? DEFAULT_ICON_SET;
  const tile = findTile(pub.content?.tileStyle);
  const tileArt = pub.content?.tileArt;
  const bar = findToolbar(pub.content?.toolbarStyle);

  return (
    <>
      {/* نسختا الثيم — الفاتحة أساساً والداكنة عند اختيار الزائر الداكن.
          كتلة واحدة للثيم المختار فقط، فلا تُحمَّل عشرون كتلة لا تُعرض. */}
      <style dangerouslySetInnerHTML={{ __html: skinCss(skin) }} />

    {/* مراسل النشاط — بوابة الطالب وحدها، فنشاط المشرف ليس تقريراً */}
    <ActivityTracker />
    <div
      className={`student-skin relative min-h-full ${mobileClass(mobile)} ${sideNavClass(side)} ${dockClass(dock)} ic-${icons} ${iconFrameClass(findIconFrame(pub.content?.iconFrame))} dsg ${iconCoverClass(findIconCover(pub.content?.iconCover))} ${iconMotionClass(findIconMotion(pub.content?.iconMotion))} ${tileClass(tile)} ${tileArtClass(tileArt)} ${toolbarClass(bar)} ${stickClass(pub.content?.toolbarStick)} ${motionClass(findMotion(pub.content?.motionStyle))} ${pub.content?.toolbarHidden ? "tools-hidden" : ""}`}
      style={{ ...navColorVars(pub.content?.navColors), ...tileColorVars(pub.content?.tileColors), ...tileArtVars(tileArt), ...motionVars(findMotion(pub.content?.motionStyle)), ...iconFrameVars(pub.content?.iconFrameColors), ...designVars(pub.content?.designColors) }}
      data-skin={skin.id}
      data-layout={layout.id}
      data-card={skin.card}
      data-mobile={mobile.id}
      data-design={design.id}
      data-sidenav={side.id}
      data-dock={dock.id}
      data-tile={tile.id}
      data-toolbar={bar.id}
    >
      <SkinOrnament id={skin.ornament} />
      <DashboardShell
        nav={studentNav}
        role="student"
        user={{ name: session.name, sub: me?.grade ?? "طالب", avatar: session.name.charAt(0) }}
      >
        {children}
      </DashboardShell>
    </div>
    </>
  );
}
