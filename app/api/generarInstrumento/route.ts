import { NextResponse } from "next/server";
import { z } from "zod";

const InputSchema = z.object({
  tipo: z.string().min(2),
  tema: z.string().min(2),
  fecha: z.string().optional().default("-"),
  capacidades: z.array(z.string()).optional().default([]),
});

function unique(arr: string[]) {
  return Array.from(new Set(arr));
}

function buildIndicadores(tema: string, capacidades: string[], n = 6) {
  const t = tema.trim();
  const caps = capacidades.map((c) => c.trim()).filter(Boolean);

  const base = [
    `Reconoce ${t} en objetos de su entorno`,
    `Explora ${t} con material concreto`,
    `Representa ${t} con trazos o dibujos`,
    `Describe características de ${t} con sus palabras`,
    `Clasifica objetos relacionados con ${t}`,
    `Participa respetando acuerdos en actividades sobre ${t}`,
    `Comunica lo que observa sobre ${t}`,
  ];

  const capPlus = caps.slice(0, 3).map((c) => `Aplica la capacidad: ${c} en actividades sobre ${t}`);

  const pool = unique([...base, ...capPlus]);
  return pool.slice(0, n);
}

/** Construye TABLAS como texto (con tabs y saltos) */
function tsvTable(headers: string[], rows: string[][]) {
  const h = headers.join("\t");
  const r = rows.map((row) => row.join("\t"));
  return [h, ...r].join("\n");
}

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const { tipo, tema, fecha, capacidades } = InputSchema.parse(raw);

    const indicadores = buildIndicadores(tema, capacidades, 6);

    const base = {
      tituloInstrumento: `${tipo} – ${tema}`,
      tipoInstrumento: tipo,
      instruccionesInstrumento: `Complete según lo observado en las actividades del tema: “${tema}”.`,
      fecha,
    };

    // Según instrumento, generamos estructura distinta
    let tabla = "";
    let bloques = "";
    let cuerpo = "";

    switch (tipo) {
      case "Guía de observación":
        tabla = tsvTable(
          ["N°", "Indicador (acción observable)", "Evidencia", "Observaciones"],
          indicadores.map((ind, i) => [
            String(i + 1),
            ind,
            "________________",
            "________________",
          ])
        );
        break;

      case "Lista de cotejo":
        tabla = tsvTable(
          ["N°", "Indicador", "Sí", "No", "Observaciones"],
          indicadores.map((ind, i) => [
            String(i + 1),
            ind,
            "( )",
            "( )",
            "________________",
          ])
        );
        break;

      case "Escala de valoración":
        tabla = tsvTable(
          ["N°", "Indicador", "Siempre", "A veces", "Nunca", "Observaciones"],
          indicadores.map((ind, i) => [
            String(i + 1),
            ind,
            "( )",
            "( )",
            "( )",
            "________________",
          ])
        );
        break;

      case "Rúbrica analítica":
        tabla = tsvTable(
          ["Criterio", "Inicio", "Proceso", "Logro", "Destacado"],
          indicadores.map((crit) => [
            crit,
            "Lo intenta con ayuda",
            "Avanza con apoyo ocasional",
            "Lo realiza de manera autónoma",
            "Lo realiza y explica con seguridad",
          ])
        );
        break;

      case "Registro anecdótico":
        bloques = Array.from({ length: 3 }).map(() =>
          [
            "Fecha: ____________________",
            "Situación / contexto: ______________________________________________",
            "Observación (hechos): ______________________________________________",
            "Interpretación: _________________________________________________",
            "Acuerdos / acciones: ____________________________________________",
            "------------------------------------------------------------",
          ].join("\n")
        ).join("\n");
        break;

      case "Diario de campo":
        tabla = tsvTable(
          ["Fecha", "Actividad / situación", "Observación", "Interpretación", "Acuerdos"],
          Array.from({ length: 5 }).map(() => [
            "____/____/____",
            "________________",
            "________________",
            "________________",
            "________________",
          ])
        );
        break;

      case "Lista de verificación":
        tabla = tsvTable(
          ["N°", "Ítem a verificar", "Cumple", "En proceso", "No cumple", "Observaciones"],
          indicadores.map((ind, i) => [
            String(i + 1),
            ind,
            "( )",
            "( )",
            "( )",
            "________________",
          ])
        );
        break;

      case "Ficha de seguimiento":
        cuerpo = [
          `Tema / foco: ${tema}`,
          `Estudiante: ____________________________________________`,
          "",
          "Indicadores a seguir:",
          ...indicadores.map((x, i) => `  ${i + 1}. ${x}`),
          "",
          "Acuerdos (familia/aula): __________________________________________",
          "",
          "Registro de seguimiento (fecha - avance):",
          "  ____/____/____  -> ______________________________________________",
          "  ____/____/____  -> ______________________________________________",
          "  ____/____/____  -> ______________________________________________",
        ].join("\n");
        break;

      default:
        // fallback
        tabla = tsvTable(
          ["N°", "Indicador", "Evidencia"],
          indicadores.map((ind, i) => [
            String(i + 1),
            ind,
            "________________",
          ])
        );
        break;
    }

    return NextResponse.json({
      success: true,
      instrumento: { ...base, indicadores, tabla, bloques, cuerpo },
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message ?? "Error generando instrumento" },
      { status: 400 }
    );
  }
}
