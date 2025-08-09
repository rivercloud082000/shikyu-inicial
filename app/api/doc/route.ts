// app/api/doc/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { Packer, Document, Paragraph, TextRun } from "docx";

// Tipado suave del body para evitar errores si faltan campos
type DocPayload = {
  data: {
    area?: string;
    nivel?: string;
    grado?: string;
    fecha?: string;
    tituloSesion?: string;
    propositoAprendizaje?: string;
    desempenosPrecisados?: string;
    secuenciaDidactica?: string;
    recursosDidacticos?: string[];
    criteriosEvaluacion?: string[];
    instrumento?: string[];
    evidenciaAprendizaje?: string;
    referencias?: { fuente?: string; pagina?: string }[];
  };
};

// 🔧 Convierte un Buffer de Node a un Uint8Array seguro para BodyInit (sin SharedArrayBuffer)
function toUint8(b: Buffer): Uint8Array {
  const out = new Uint8Array(b.length);
  out.set(b); // copia los bytes; evita tocar b.buffer (que tipa como ArrayBufferLike)
  return out;
}

export async function POST(req: NextRequest) {
  try {
    const { data } = (await req.json()) as DocPayload;

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "Sesión de Aprendizaje", bold: true, size: 32 }),
              ],
              alignment: "center",
            }),
            new Paragraph(""),

            new Paragraph(`Área: ${data?.area ?? ""}`),
            new Paragraph(`Nivel: ${data?.nivel ?? ""}`),
            new Paragraph(`Grado: ${data?.grado ?? ""}`),
            new Paragraph(`Fecha: ${data?.fecha ?? ""}`),
            new Paragraph(`Título: ${data?.tituloSesion ?? ""}`),

            new Paragraph(`Propósito del aprendizaje: ${data?.propositoAprendizaje ?? ""}`),
            new Paragraph(`Desempeños: ${data?.desempenosPrecisados ?? ""}`),
            new Paragraph(`Secuencia Didáctica: ${data?.secuenciaDidactica ?? ""}`),

            new Paragraph(`Recursos Didácticos:`),
            ...(data?.recursosDidacticos ?? []).map((r) => new Paragraph(`• ${r}`)),

            new Paragraph(`Criterios de Evaluación:`),
            ...(data?.criteriosEvaluacion ?? []).map((c) => new Paragraph(`• ${c}`)),

            new Paragraph(`Instrumento:`),
            ...(data?.instrumento ?? []).map((i) => new Paragraph(`• ${i}`)),

            new Paragraph(`Evidencia de aprendizaje: ${data?.evidenciaAprendizaje ?? ""}`),

            new Paragraph("Referencias:"),
            ...(data?.referencias ?? []).map(
              (ref) =>
                new Paragraph(`• ${ref?.fuente ?? ""}${ref?.pagina ? ` - ${ref.pagina}` : ""}`)
            ),
          ],
        },
      ],
    });

    // 1) Genera el DOCX como Buffer
    const buffer = await Packer.toBuffer(doc);

    // 2) ⚠️ En lugar de usar buffer.buffer.slice(...), creamos un Uint8Array dedicado
    const body = toUint8(buffer);

    // 3) Respuesta de descarga
    return new NextResponse(body, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="sesion-aprendizaje.docx"',
        "Cache-Control": "no-store",
        // Opcional: "Content-Length": String(body.byteLength),
      },
      status: 200,
    });
  } catch (err: any) {
    console.error("doc route error:", err);
    return NextResponse.json(
      { success: false, error: err?.message ?? "Error generando DOCX" },
      { status: 500 }
    );
  }
}
