// app/api/exportarWord/route.ts
export const runtime = "nodejs";           // ✅ necesario para usar fs/docxtemplater
export const dynamic = "force-dynamic";    // ✅ sin caché

import { NextRequest, NextResponse } from "next/server";
import { generarWordDesdePlantilla } from "@/lib/word/generarWord";

// Convierte Buffer (Node) -> ArrayBuffer (Web API)
function bufferToArrayBuffer(buf: Buffer): ArrayBuffer {
  return ArrayBuffer.prototype.slice.call(buf.buffer, buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

// Sanea un nombre de archivo
function sanitizeFilename(s: string): string {
  return s.replace(/[^\w\-]+/g, "_").slice(0, 80) || "Sesion_Inicial";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: "JSON inválido" }, { status: 400 });
    }

    // Acepta { markers: {...} } o markers planos o { datos, filas }
    const payload = body.markers ?? body;

    // Tu generador devuelve Buffer
    const buf = generarWordDesdePlantilla(payload);

    // Convertimos a ArrayBuffer para satisfacer BodyInit (y Vercel)
    const ab = bufferToArrayBuffer(buf);

    // Nombre de archivo basado en el título si existe
    const base =
      (payload?.markers?.tituloSesion ??
        payload?.tituloSesion ??
        payload?.datos?.tituloSesion ??
        payload?.datos?.tema ??
        "Sesion_Inicial").toString();

    const filename = `${sanitizeFilename(base)}.docx`;

    return new NextResponse(ab, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    console.error("❌ exportarWord:", e?.message || e);
    return NextResponse.json(
      { success: false, error: e?.message ?? "Error interno" },
      { status: 500 }
    );
  }
}
