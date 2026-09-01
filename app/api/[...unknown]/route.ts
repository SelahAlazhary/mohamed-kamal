import { NextResponse } from "next/server";

/**
 * ملتقطُ مسارات API المجهولة.
 * ------------------------------------------------------------------
 * **العلّة:** طلبٌ إلى مسار API لا وجودَ له — `/api/students/delete` مثلاً
 * — كان يُردّ بصفحة SPA كاملةٍ برمز 200. وثلاثةُ أضرار:
 *
 *   ١) **يُوهم أنّ العمليّة نجحت**: مهاجمٌ (أو أنا في فحص الاختراق) يرى
 *      «200» فيظنّ أنّ الحذفَ أو التعديلَ وقع، وهو لم يقع.
 *   ٢) **يُسرّب بنيةَ صفحة الموقع** إلى من يمسح المساراتِ آليّاً — صفحةٌ
 *      كاملةٌ حيث يُنتظر خطأٌ صغير.
 *   ٣) **يُلبس المراقبة**: 200 على مسارٍ لا يُفترض أن يُصاب لا يُميَّز عن
 *      200 على مسارٍ صحيح.
 *
 * **والملتقطُ لا يخطف المساراتِ الحقيقيّة**: مقطعُ Next الأخصُّ يسبق
 * العامَّ دائماً، فكلُّ مسارٍ مُعرَّفٍ يُصاب قبل هذا، ولا يصل هذا إلّا
 * ما لا مسارَ له.
 *
 * والردُّ JSON صريحٌ برمز 404 — لا صفحةَ ولا تفصيل: «غير موجود» وكفى.
 */

const notFound = () =>
  NextResponse.json({ error: "غير موجود" }, { status: 404 });

export const GET = notFound;
export const POST = notFound;
export const PUT = notFound;
export const PATCH = notFound;
export const DELETE = notFound;
export const HEAD = notFound;
export const OPTIONS = notFound;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
