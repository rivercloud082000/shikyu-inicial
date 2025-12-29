import { NextResponse } from "next/server";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
} from "docx";

function safeText(v: any) {
  return String(v ?? "").trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const instrumento = body?.instrumento;

    if (!instrumento) {
      return NextResponse.json(
        { success: false, error: "Falta instrumento para exportar." },
        { status: 400 }
      );
    }

    const tituloInstrumento =
      safeText(instrumento?.titulo) || "INSTRUMENTO DE EVALUACIÓN – INICIAL";
    const tipoInstrumento =
      safeText(instrumento?.tipoLabel) ||
      safeText(instrumento?.tipo) ||
      "Instrumento";
    const instruccionesInstrumento = safeText(instrumento?.instrucciones);
    const fecha = safeText(instrumento?.fecha);

    const items = Array.isArray(instrumento?.items) ? instrumento.items : [];

    // ====== Construcción del documento ======
    const header = new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "INSTRUMENTO DE EVALUACIÓN – INICIAL",
          bold: true,
        }),
      ],
      spacing: { after: 250 },
    });

    const meta = [
      new Paragraph({
        children: [
          new TextRun({ text: "Título del instrumento: ", bold: true }),
          new TextRun({ text: tituloInstrumento }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Tipo de instrumento: ", bold: true }),
          new TextRun({ text: tipoInstrumento }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Instrucciones: ", bold: true }),
          new TextRun({ text: instruccionesInstrumento || "-" }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Fecha: ", bold: true }),
          new TextRun({ text: fecha || "-" }),
        ],
        spacing: { after: 250 },
      }),
    ];

    const tituloItems = new Paragraph({
      children: [new TextRun({ text: "Ítems / indicadores (observables):", bold: true })],
      spacing: { after: 150 },
    });

    // Tabla
    const table = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 8, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: "N°", bold: true })] })],
            }),
            new TableCell({
              width: { size: 46, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Indicador (acción observable)", bold: true })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 46, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Evidencia / cómo se recogerá", bold: true })],
                }),
              ],
            }),
          ],
        }),

        ...items.map((it: any, idx: number) => {
          const indicador = safeText(it?.indicador) || "-";
          const evidencia = safeText(it?.evidencia) || "-";
          return new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph(String(idx + 1))],
              }),
              new TableCell({
                children: [new Paragraph(indicador)],
              }),
              new TableCell({
                children: [new Paragraph(evidencia)],
              }),
            ],
          });
        }),
      ],
    });

    const firma = new Paragraph({
      spacing: { before: 300 },
      children: [
        new TextRun({ text: "Firma del docente: " }),
        new TextRun({ text: "____________________________" }),
      ],
    });

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [header, ...meta, tituloItems, table, firma],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const uint8 = new Uint8Array(buffer);

    return new Response(uint8, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="Instrumento_Inicial.docx"',
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        success: false,
        error: e?.message ?? "Error exportando instrumento.",
      },
      { status: 500 }
    );
  }
}
