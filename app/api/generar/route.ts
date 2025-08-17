import { NextRequest, NextResponse } from "next/server";
import { jsonrepair } from "jsonrepair";
import { buildUserPrompt, SYSTEM } from "@/lib/ai/prompts";
import { generateSessionJSON } from "@/lib/ai/providers";

// 🔍 Función para inferir el ciclo según nivel y grado
// ✅ MINEDU: Primaria (III, IV, V) / Secundaria (VI, VII)
function normalizeNivel(nivel: string = ""): "primaria" | "secundaria" | "" {
  const n = (nivel || "").toLowerCase().trim();
  if (n.startsWith("pri")) return "primaria";
  if (n.startsWith("sec")) return "secundaria";
  return "";
}

function parseGrado(grado: string = ""): number {
  const m = (grado || "").toLowerCase().match(/\d+/);
  return m ? parseInt(m[0], 10) : NaN; // "3", "3°", "3ero" -> 3
}

function inferirCiclo(nivel: string = "", grado: string = ""): string {
  const n = normalizeNivel(nivel);
  const g = parseGrado(grado);
  if (!n || !Number.isFinite(g)) return "";

  if (n === "primaria") {
    if (g <= 2) return "III";
    if (g <= 4) return "IV";
    return "V"; // 5°–6°
  }

  if (n === "secundaria") {
    if (g <= 2) return "VI";
    return "VII"; // 3°–5°
  }

  return "";
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

    // ---------------------------
    // ✅ Server = verdad (CICLO)
    // ---------------------------
    const datos = body.datos ?? {};
    const nivel = String(datos.nivel ?? "");
    const grado = String(datos.grado ?? "");
    const ciclo = inferirCiclo(nivel, grado); // ← cálculo oficial

    // Forzamos que el backend mande el ciclo correcto
    const datosServer = { ...datos, nivel, grado, ciclo };

    const tituloSesion = datosServer.tituloSesion ?? "Sesión sin título";
    const contextoPersonalizado = body.contextoSecuencia ?? "";
    const capacidadesManuales = convertirAArray(datosServer.capacidades ?? []);

    // ✏️ Construye el prompt usando SIEMPRE datosServer
    const prompt = buildUserPrompt({
      datos: datosServer, // ← acá ya va el ciclo correcto
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

    // 🧹 Limpieza del texto (UNA sola vez)
    let cleaned = String(raw)
      .replace(/\\u[\da-f]{0,3}[^a-f0-9]/gi, "")
      .replace(/[“”‘’]/g, '"')
      .replace(/\u0000/g, "")
      .trim();

    // 🧪 Parse robusto del JSON
    let data: any = null;

    const tryParse = (txt: string) => {
      try {
        return JSON.parse(txt);
      } catch {
        return null;
      }
    };

    // 1) Intento directo
    data = tryParse(cleaned);

    // 2) Si falla, intenta extraer el primer objeto balanceado { ... }
    if (!data) {
      const extractBalancedJson = (s: string) => {
        let depth = 0,
          start = -1,
          inStr = false,
          esc = false;
        for (let i = 0; i < s.length; i++) {
          const ch = s[i];
          if (inStr) {
            if (esc) {
              esc = false;
              continue;
            }
            if (ch === "\\") {
              esc = true;
              continue;
            }
            if (ch === '"') inStr = false;
            continue;
          }
          if (ch === '"') {
            inStr = true;
            continue;
          }
          if (ch === "{") {
            if (depth === 0) start = i;
            depth++;
          } else if (ch === "}") {
            depth--;
            if (depth === 0 && start !== -1) return s.slice(start, i + 1);
          }
        }
        return null;
      };

      const balanced = extractBalancedJson(cleaned);
      if (balanced) data = tryParse(balanced);
    }

    // 3) Si aún falla, intenta reparar
    if (!data) {
      try {
        const repaired = jsonrepair(cleaned);
        data = tryParse(repaired);
      } catch {
        // noop
      }
    }

    // 4) Si también falla, responde error con muestra
    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error: "La IA no devolvió JSON válido",
          sample: cleaned.slice(0, 800),
        },
        { status: 502 }
      );
    }

    // --------------------------------------------
    // 🎯 Refuerzo post-IA: forzar ciclo correcto
    // --------------------------------------------
    data.datos = data.datos || {};
    // conserva nivel/grado de la IA si los trajo, si no usa los del server
    data.datos.nivel = String(data.datos.nivel ?? nivel ?? "");
    data.datos.grado = String(data.datos.grado ?? grado ?? "");
    data.datos.ciclo = inferirCiclo(data.datos.nivel, data.datos.grado);

    // ➕ Unifica capacidades generadas y manuales
    if (Array.isArray(data.datos?.capacidades)) {
      data.datos.capacidades = [
        ...new Set([...data.datos.capacidades, ...capacidadesManuales]),
      ];
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
