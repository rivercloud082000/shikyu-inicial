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
                new Paragraph(
                  `• ${ref?.fuente ?? ""}${ref?.pagina ? ` - ${ref.pagina}` : ""}`
                )
            ),
          ],
        },
      ],
    });

    // 1) Genera el .docx como Buffer de Node
    const buffer = await Packer.toBuffer(doc);

    // 2) Crea un Blob (BodyInit aceptado en Next 15 / Vercel)
    const MIME =
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const blob = new Blob([buffer], { type: MIME });

    // 3) Devuelve Response (no NextResponse) para evitar conflictos de tipos
    return new Response(blob, {
      headers: {
        "Content-Type": MIME,
        "Content-Disposition": 'attachment; filename="sesion-aprendizaje.docx"',
        "Cache-Control": "no-store",
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

// (Opcional) Ping rápido para verificar ruta en producción
export async function GET() {
  return NextResponse.json({ ok: true, route: "/api/doc", runtime }, { status: 200 });
}
