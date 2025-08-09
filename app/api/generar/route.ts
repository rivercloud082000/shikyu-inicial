import { NextRequest, NextResponse } from "next/server";

import { buildUserPrompt, SYSTEM } from "@/lib/ai/prompts";
import { generateSessionJSON } from "@/lib/ai/providers";

// 🔍 Función para inferir el ciclo según nivel y grado
function inferirCiclo(nivel: string = "", grado: string = ""): string {
  const g = grado.toLowerCase();
  const n = nivel.toLowerCase();

  if (n === "inicial") {
    if (g.includes("3") || g.includes("4")) return "I";
    if (g.includes("5")) return "II";
    return "I";
  }

  if (n === "primaria") {
    if (g.includes("1") || g.includes("2")) return "I";
    if (g.includes("3") || g.includes("4")) return "II";
    return "III";
  }

  if (n === "secundaria") {
    if (g.includes("1") || g.includes("2")) return "IV";
    return "V";
  }

  return "-";
}

// 🔄 Convierte strings o arrays en array limpio
function convertirAArray(input: string | string[]): string[] {
  if (Array.isArray(input)) return input;
  if (typeof input === "string") {
    return input
      .split(/[\n,;\u2022\u25AA\u00B7\u25CF|]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export async function POST(req: NextRequest) {
  try {
    // ⛔️ SIN AUTENTICACIÓN: eliminamos getServerSession y el 401

    // 📥 Procesa el body
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "JSON inválido" },
        { status: 400 }
      );
    }

    const provider = (body.provider ?? "ollama-mistral") as
      | "ollama-mistral"
      | "cohere";
    const datos = body.datos ?? {};
    const tituloSesion = datos.tituloSesion ?? "Sesión sin título";
    const contextoPersonalizado = body.contextoSecuencia ?? "";

    const capacidadesManuales = convertirAArray(datos.capacidades ?? []);

    // ✏️ Construye el prompt
    const prompt = buildUserPrompt({
      datos,
      tituloSesion,
      contextoPersonalizado,
      capacidadesSeleccionadas: capacidadesManuales,
    });

    // 🤖 Llama a la IA
    const raw = await generateSessionJSON({
      provider,
      system: SYSTEM,
      prompt,
      temperature: 0.2,
    });

    // 🧹 Limpieza del texto
    let cleaned = String(raw)
      .replace(/\\u[\da-f]{0,3}[^a-f0-9]/gi, "")
      .replace(/[“”‘’]/g, '"')
      .replace(/\u0000/g, "")
      .trim();

    // 🧪 Intenta parsear el JSON generado
    let data: any = null;
    try {
      data = JSON.parse(cleaned);
    } catch {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          data = JSON.parse(jsonMatch[0]);
        } catch {
          return NextResponse.json(
            { success: false, error: "JSON corregido inválido", raw: jsonMatch[0] },
            { status: 502 }
          );
        }
      } else {
        return NextResponse.json(
          { success: false, error: "La IA no devolvió JSON válido", raw },
          { status: 502 }
        );
      }
    }

    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { success: false, error: "JSON nulo o inválido", raw },
        { status: 502 }
      );
    }

    // 🎯 Completa datos faltantes (como ciclo inferido)
    if (!data.datos?.ciclo || (typeof data.datos.ciclo === "string" && data.datos.ciclo.trim() === "-")) {
      data.datos = data.datos || {};
      data.datos.ciclo = inferirCiclo(data.datos.nivel, data.datos.grado);
    }

    // ➕ Unifica capacidades generadas y manuales
    if (Array.isArray(data.datos?.capacidades)) {
      data.datos.capacidades = [...new Set([...data.datos.capacidades, ...capacidadesManuales])];
    } else {
      data.datos.capacidades = capacidadesManuales;
    }

    // 🧱 Asegura que los campos de la fila estén limpios
    const fila = data.filas?.[0];
    if (fila) {
      fila.recursosDidacticos = convertirAArray(fila.recursosDidacticos);
      fila.instrumento = convertirAArray(fila.instrumento);
      fila.criteriosEvaluacion = convertirAArray(fila.criteriosEvaluacion);
      fila.evidenciaAprendizaje = convertirAArray(fila.evidenciaAprendizaje);
      data.datos.capacidades = convertirAArray(data.datos.capacidades);

      if (!fila.tituloSesion && tituloSesion) {
        fila.tituloSesion = tituloSesion;
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("❌ Error en /api/generar:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error desconocido" },
      { status: 500 }
    );
  }
}
