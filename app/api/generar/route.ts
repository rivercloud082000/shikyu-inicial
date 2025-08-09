import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { buildUserPrompt, SYSTEM } from "@/lib/ai/prompts";
import { generateSessionJSON } from "@/lib/ai/providers";
import type { Session } from "next-auth";

// Recomendado para Vercel
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// 🔒 Rate limit simple (memoria): 5 solicitudes por minuto por usuario
const windowMs = 60_000; // 1 minuto
const maxPerWindow = 5;  // 5 req/min por usuario
const buckets = new Map<string, { count: number; reset: number }>();

function rateLimit(key: string) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (bucket.count < maxPerWindow) {
    bucket.count++;
    return true;
  }
  return false;
}

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
      .map((s) => s.trim().replace(/^[-•▪]\s*/, ""))
      .filter(Boolean);
  }
  return [];
}

/** ---------- 🔧 Parches de saneo para la salida de la IA ---------- **/

// 1) Recorta fences/ruido y devuelve el mayor bloque { ... }
function extractLargestJsonBlock(s: string): string {
  s = s.replace(/```json|```/g, "").trim();
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first >= 0 && last > first) return s.slice(first, last + 1);
  return s;
}

// 2) Escapa saltos de línea CRUDOS *dentro de strings* → \n -> \\n (JSON válido)
function escapeRawNewlinesInStrings(input: string): string {
  let out = "";
  let inStr = false;
  let esc = false;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (!inStr) {
      if (c === '"') { inStr = true; out += c; }
      else out += c;
    } else {
      if (esc) { out += c; esc = false; continue; }
      if (c === "\\") { out += c; esc = true; continue; }
      if (c === '"') { inStr = false; out += c; continue; }
      if (c === "\n" || c === "\r") { out += "\\n"; continue; }
      out += c;
    }
  }
  return out;
}

// 3) Quita comas colgantes antes de ] o }
function stripTrailingCommas(s: string): string {
  return s.replace(/,\s*([}\]])/g, "$1");
}

// 4) Cierra ] si "secuenciaDidactica" queda abierta antes de los campos hermanos,
//    sin duplicar cierres cuando ya está cerrada.
function fixMissingBracketInSecuencia(s: string): string {
  const fields = [
    "recursosDidacticos",
    "criteriosEvaluacion",
    "instrumento",
    "evidenciaAprendizaje",
    "referencias",
  ];

  // Coincide desde "secuenciaDidactica":[ ...  hasta justo antes del siguiente campo hermano.
  const re = new RegExp(
    `("secuenciaDidactica"\\s*:\\s*\\[[\\s\\S]*?)(?="(?:${fields.join("|")})"\\s*:)`
  );

  return s.replace(re, (_match, part: string) => {
    let out = part.replace(/,\s*$/, "").trimEnd(); // limpia coma colgante al final del bloque

    // si NO termina con ']' lo cerramos
    if (!/\]\s*$/.test(out)) out += "]";

    // si NO termina con coma (preparamos para el siguiente campo hermano), la añadimos
    if (!/,\s*$/.test(out)) out += ", ";

    return out;
  });
}

// 4.b) Curita por si llega a haber un "]] , " accidental antes de un campo hermano.
function fixDoubleCloseBeforeSibling(s: string): string {
  const sib = /(recursosDidacticos|criteriosEvaluacion|instrumento|evidenciaAprendizaje|referencias)"/;
  return s.replace(/\]\s*\],\s*(?="(?:recursosDidacticos|criteriosEvaluacion|instrumento|evidenciaAprendizaje|referencias)"\s*:)/g, "], ");
}

export async function POST(req: NextRequest) {
  try {
    // 🔐 Verifica sesión del usuario (v4)
    const session: Session | null = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Usuario no autenticado" }, { status: 401 });
    }

    // ⏱️ Rate limit por usuario (email). Fallback al IP si no hay email.
    const emailKey = (session.user.email || "").toLowerCase();
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const key = emailKey || `ip:${ip}`;
    if (!rateLimit(key)) {
      return NextResponse.json(
        { success: false, error: "Demasiadas solicitudes. Intenta en un minuto." },
        { status: 429 }
      );
    }

    // 📥 Procesa el body
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "JSON inválido" },
        { status: 400 }
      );
    }

    const provider = (body.provider ?? "ollama-mistral") as "ollama-mistral" | "cohere";
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

    console.log("🧠 RAW OUTPUT:\n", raw);

    // 🧹 Limpieza del texto (manteniendo tu lógica original)
    let cleaned = raw
      .replace(/\\u[\da-f]{0,3}[^a-f0-9]/gi, "")
      .replace(/[“”‘’]/g, '"')
      .replace(/\u0000/g, "")
      .trim();

    // ✅ Parches previos a parseo (orden importa)
    cleaned = fixMissingBracketInSecuencia(cleaned);
    cleaned = fixDoubleCloseBeforeSibling(cleaned);
    cleaned = extractLargestJsonBlock(cleaned);
    cleaned = escapeRawNewlinesInStrings(cleaned);
    cleaned = stripTrailingCommas(cleaned);

    // 🧪 Intenta parsear el JSON generado
    let data: any = null;
    try {
      data = JSON.parse(cleaned);
    } catch (_e) {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const once = stripTrailingCommas(escapeRawNewlinesInStrings(jsonMatch[0]));
          data = JSON.parse(once);
        } catch (err) {
          console.error("✖ parse fail:", err, "\n---CLEANED---\n", cleaned);
          return NextResponse.json(
            { success: false, error: "JSON corregido inválido" },
            { status: 422 }
          );
        }
      } else {
        return NextResponse.json(
          { success: false, error: "La IA no devolvió JSON válido" },
          { status: 422 }
        );
      }
    }

    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { success: false, error: "JSON nulo o inválido" },
        { status: 422 }
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
      fila.secuenciaDidactica = convertirAArray(fila.secuenciaDidactica);
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
