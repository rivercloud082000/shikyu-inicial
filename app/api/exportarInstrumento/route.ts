import { NextResponse } from "next/server";
import {
  AlignmentType,
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

export const runtime = "nodejs";

/** =======================
 *  Tipos (SIN any)
 *  ======================= */
type InstrumentType =
  | "Guía de observación"
  | "Lista de cotejo"
  | "Escala de valoración"
  | "Rúbrica analítica"
  | "Registro anecdótico"
  | "Diario de campo"
  | "Lista de verificación"
  | "Ficha de seguimiento"
  | string;

type ChecklistItem = {
  indicador: string;
  evidencia?: string;
};

type RubricCriterion = {
  criterio: string;
  inicio: string;
  proceso: string;
  logro: string;
  destacado: string;
};

type DiarioCampoBlock = {
  fecha: string;
  situacion: string;
  observacion: string;
  interpretacion: string;
  acuerdos: string;
};

type InstrumentoBase = {
  titulo?: string;
  tipo?: InstrumentType;
  tipoLabel?: InstrumentType;
  instrucciones?: string;
  fecha?: string;
  // el generador puede mandar una de estas estructuras:
  items?: ChecklistItem[];
  criterios?: RubricCriterion[];
  bloques?: DiarioCampoBlock[];
};

type RequestBody = {
  instrumento?: InstrumentoBase;
};

function safeText(value: unknown): string {
  return String(value ?? "").trim();
}

function isChecklistItemArray(v: unknown): v is ChecklistItem[] {
  return (
    Array.isArray(v) &&
    v.every(
      (x) =>
        typeof x === "object" &&
        x !== null &&
        typeof (x as Record<string, unknown>).indicador === "string"
    )
  );
}

function isRubricArray(v: unknown): v is RubricCriterion[] {
  return (
    Array.isArray(v) &&
    v.every((x) => {
      if (typeof x !== "object" || x === null) return false;
      const o = x as Record<string, unknown>;
      return (
        typeof o.criterio === "string" &&
        typeof o.inicio === "string" &&
        typeof o.proceso === "string" &&
        typeof o.logro === "string" &&
        typeof o.destacado === "string"
      );
    })
  );
}

function isDiarioCampoArray(v: unknown): v is DiarioCampoBlock[] {
  return (
    Array.isArray(v) &&
    v.every((x) => {
      if (typeof x !== "object" || x === null) return false;
      const o = x as Record<string, unknown>;
      return (
        typeof o.fecha === "string" &&
        typeof o.situacion === "string" &&
        typeof o.observacion === "string" &&
        typeof o.interpretacion === "string" &&
        typeof o.acuerdos === "string"
      );
    })
  );
}

/** =======================
 *  Helpers DOCX
 *  ======================= */
function titleCenter(text: string) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 250 },
    children: [new TextRun({ text, bold: true })],
  });
}

function metaLine(label: string, value: string, after = 0) {
  return new Paragraph({
    spacing: { after },
    children: [new TextRun({ text: `${label}: `, bold: true }), new TextRun(value || "-")],
  });
}

function sectionHeading(text: string) {
  return new Paragraph({
    spacing: { before: 200, after: 150 },
    children: [new TextRun({ text, bold: true })],
  });
}

function cell(text: string, bold = false) {
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text, bold })] })],
  });
}

function firma() {
  return new Paragraph({
    spacing: { before: 300 },
    children: [
      new TextRun({ text: "Firma del docente: " }),
      new TextRun({ text: "____________________________" }),
    ],
  });
}

/** =======================
 *  Plantillas por tipo
 *  ======================= */

// A) Lista (cotejo / verificación / guía / ficha / registro / escala)
function buildChecklistDoc(params: {
  titulo: string;
  tipo: string;
  instrucciones: string;
  fecha: string;
  items: ChecklistItem[];
  mode: "cotejo" | "verificacion" | "guia" | "ficha" | "registro" | "escala";
}) {
  const { titulo, tipo, instrucciones, fecha, items, mode } = params;

  const rows: TableRow[] = [];

  // Header según modo
  if (mode === "cotejo" || mode === "verificacion") {
    rows.push(
      new TableRow({
        children: [
          cell("N°", true),
          cell("Indicador", true),
          cell("Sí", true),
          cell("No", true),
          cell("Observaciones", true),
        ],
      })
    );

    items.forEach((it, idx) => {
      rows.push(
        new TableRow({
          children: [
            cell(String(idx + 1)),
            cell(safeText(it.indicador) || "-"),
            cell(""),
            cell(""),
            cell(""),
          ],
        })
      );
    });
  } else if (mode === "escala") {
    rows.push(
      new TableRow({
        children: [
          cell("N°", true),
          cell("Indicador", true),
          cell("Siempre", true),
          cell("A veces", true),
          cell("Nunca", true),
          cell("Observaciones", true),
        ],
      })
    );

    items.forEach((it, idx) => {
      rows.push(
        new TableRow({
          children: [
            cell(String(idx + 1)),
            cell(safeText(it.indicador) || "-"),
            cell(""),
            cell(""),
            cell(""),
            cell(""),
          ],
        })
      );
    });
  } else if (mode === "registro") {
    rows.push(
      new TableRow({
        children: [
          cell("N°", true),
          cell("Hecho / Situación", true),
          cell("Descripción breve", true),
          cell("Interpretación", true),
          cell("Acción / Acuerdo", true),
        ],
      })
    );

    items.forEach((it, idx) => {
      // usamos indicador como "hecho" y evidencia como "descripción"
      rows.push(
        new TableRow({
          children: [
            cell(String(idx + 1)),
            cell(safeText(it.indicador) || "-"),
            cell(safeText(it.evidencia) || "-"),
            cell(""),
            cell(""),
          ],
        })
      );
    });
  } else {
    // guía / ficha (tabla simple: indicador + evidencia + observaciones)
    rows.push(
      new TableRow({
        children: [
          cell("N°", true),
          cell("Indicador (acción observable)", true),
          cell("Evidencia / cómo se recogerá", true),
          cell("Observaciones", true),
        ],
      })
    );

    items.forEach((it, idx) => {
      rows.push(
        new TableRow({
          children: [
            cell(String(idx + 1)),
            cell(safeText(it.indicador) || "-"),
            cell(safeText(it.evidencia) || "-"),
            cell(""),
          ],
        })
      );
    });
  }

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
  });

  return new Document({
    sections: [
      {
        children: [
          titleCenter("INSTRUMENTO DE EVALUACIÓN – INICIAL"),
          metaLine("Título del instrumento", titulo),
          metaLine("Tipo de instrumento", tipo),
          metaLine("Instrucciones", instrucciones || "-"),
          metaLine("Fecha", fecha || "-", 200),
          sectionHeading("Registro / Ítems:"),
          table,
          firma(),
        ],
      },
    ],
  });
}

// B) Rúbrica analítica
function buildRubricDoc(params: {
  titulo: string;
  tipo: string;
  instrucciones: string;
  fecha: string;
  criterios: RubricCriterion[];
}) {
  const { titulo, tipo, instrucciones, fecha, criterios } = params;

  const rows: TableRow[] = [
    new TableRow({
      children: [
        cell("Criterio", true),
        cell("Inicio", true),
        cell("Proceso", true),
        cell("Logro", true),
        cell("Destacado", true),
      ],
    }),
  ];

  criterios.forEach((c) => {
    rows.push(
      new TableRow({
        children: [
          cell(safeText(c.criterio) || "-"),
          cell(safeText(c.inicio) || "-"),
          cell(safeText(c.proceso) || "-"),
          cell(safeText(c.logro) || "-"),
          cell(safeText(c.destacado) || "-"),
        ],
      })
    );
  });

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
  });

  return new Document({
    sections: [
      {
        children: [
          titleCenter("INSTRUMENTO DE EVALUACIÓN – INICIAL"),
          metaLine("Título del instrumento", titulo),
          metaLine("Tipo de instrumento", tipo),
          metaLine("Instrucciones", instrucciones || "-"),
          metaLine("Fecha", fecha || "-", 200),
          sectionHeading("Rúbrica (niveles de logro):"),
          table,
          firma(),
        ],
      },
    ],
  });
}

// C) Diario de campo
function buildDiarioCampoDoc(params: {
  titulo: string;
  tipo: string;
  instrucciones: string;
  fecha: string;
  bloques: DiarioCampoBlock[];
}) {
  const { titulo, tipo, instrucciones, fecha, bloques } = params;

  // Cabecera de tabla
  const rows: TableRow[] = [
    new TableRow({
      children: [
        cell("Fecha", true),
        cell("Situación", true),
        cell("Observación", true),
        cell("Interpretación", true),
        cell("Acuerdos", true),
      ],
    }),
  ];

  bloques.forEach((b) => {
    rows.push(
      new TableRow({
        children: [
          cell(safeText(b.fecha) || "-"),
          cell(safeText(b.situacion) || "-"),
          cell(safeText(b.observacion) || "-"),
          cell(safeText(b.interpretacion) || "-"),
          cell(safeText(b.acuerdos) || "-"),
        ],
      })
    );
  });

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
  });

  return new Document({
    sections: [
      {
        children: [
          titleCenter("INSTRUMENTO DE EVALUACIÓN – INICIAL"),
          metaLine("Título del instrumento", titulo),
          metaLine("Tipo de instrumento", tipo),
          metaLine("Instrucciones", instrucciones || "-"),
          metaLine("Fecha", fecha || "-", 200),
          sectionHeading("Diario de campo:"),
          table,
          firma(),
        ],
      },
    ],
  });
}

/** =======================
 *  Selección por tipo
 *  ======================= */
function normalizeTipo(rawTipo: string): string {
  return rawTipo.toLowerCase().trim();
}

function pickMode(tipo: string):
  | "cotejo"
  | "verificacion"
  | "guia"
  | "ficha"
  | "registro"
  | "escala"
  | "rubrica"
  | "diario" {
  const t = normalizeTipo(tipo);

  if (t.includes("rúbrica") || t.includes("rubrica")) return "rubrica";
  if (t.includes("diario")) return "diario";
  if (t.includes("escala")) return "escala";
  if (t.includes("registro")) return "registro";
  if (t.includes("verificación") || t.includes("verificacion")) return "verificacion";
  if (t.includes("cotejo")) return "cotejo";
  if (t.includes("ficha")) return "ficha";
  // guía por defecto
  return "guia";
}

/** =======================
 *  Route
 *  ======================= */
export async function POST(req: Request) {
  try {
    const body: RequestBody = (await req.json()) as RequestBody;
    const instrumento = body.instrumento;

    if (!instrumento) {
      return NextResponse.json(
        { success: false, error: "Falta instrumento para exportar." },
        { status: 400 }
      );
    }

    const titulo =
      safeText(instrumento.titulo) || "INSTRUMENTO DE EVALUACIÓN – INICIAL";
    const tipo =
      safeText(instrumento.tipoLabel) || safeText(instrumento.tipo) || "Instrumento";
    const instrucciones = safeText(instrumento.instrucciones);
    const fecha = safeText(instrumento.fecha) || "-";

    const mode = pickMode(tipo);

    let doc: Document;

    if (mode === "rubrica") {
      const criterios = isRubricArray(instrumento.criterios)
        ? instrumento.criterios
        : [];

      // fallback si el generador solo mandó "items"
      const fallbackCriterios: RubricCriterion[] = isChecklistItemArray(instrumento.items)
        ? instrumento.items.slice(0, 6).map((it) => ({
            criterio: safeText(it.indicador) || "Criterio",
            inicio: "Requiere apoyo constante.",
            proceso: "Avanza con apoyo ocasional.",
            logro: "Lo realiza de forma autónoma.",
            destacado: "Lo realiza con seguridad y explica a otros.",
          }))
        : [];

      doc = buildRubricDoc({
        titulo,
        tipo,
        instrucciones,
        fecha,
        criterios: criterios.length ? criterios : fallbackCriterios,
      });
    } else if (mode === "diario") {
      const bloques = isDiarioCampoArray(instrumento.bloques)
        ? instrumento.bloques
        : [];

      // fallback si el generador mandó items
      const fallbackBloques: DiarioCampoBlock[] = isChecklistItemArray(instrumento.items)
        ? instrumento.items.slice(0, 6).map((it) => ({
            fecha,
            situacion: safeText(it.indicador) || "Situación observada",
            observacion: safeText(it.evidencia) || "Observación",
            interpretacion: "Interpretación del docente.",
            acuerdos: "Acuerdo / acción de mejora.",
          }))
        : [];

      doc = buildDiarioCampoDoc({
        titulo,
        tipo,
        instrucciones,
        fecha,
        bloques: bloques.length ? bloques : fallbackBloques,
      });
    } else {
      const items: ChecklistItem[] = isChecklistItemArray(instrumento.items)
        ? instrumento.items
        : [];

      doc = buildChecklistDoc({
        titulo,
        tipo,
        instrucciones,
        fecha,
        items,
        mode,
      });
    }

    const buffer = await Packer.toBuffer(doc);
    const uint8 = new Uint8Array(buffer);

    // Nombre del archivo según tipo
    const fileTipo = normalizeTipo(tipo)
      .replace(/\s+/g, "_")
      .replace(/[^\w\-]/g, "");
    const filename = `Instrumento_${fileTipo || "Inicial"}.docx`;

    return new Response(uint8, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error exportando instrumento.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
