// app/api/generar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { jsonrepair } from "jsonrepair";
import { generateSessionJSON } from "@/lib/ai/providers";
import { ENFOQUES_DETALLE } from "@/lib/inicial/enfoques";


// Exclusivo de INICIAL
import { inicialReqSchema } from "@/lib/inicial/schema";
import { buildUserPromptInicial, SYSTEM_INICIAL } from "@/lib/inicial/prompts-inicial";
import { getCompetenciaYCapacidades } from "@/lib/competencias-capacidades";


// (Opcional) escribir out-session.json para scripts/make-markers.js
import fs from "node:fs";
import path from "node:path";

// (opcional) fuerza runtime Node si alguna vez lo llevas a serverless
export const runtime = "nodejs";
export const dynamic = "force-dynamic";



/* --------------------------- Utils --------------------------- */
function withTimeout<T>(p: Promise<T>, ms = 240_000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("Timeout generating session")), ms);
    p.then((v) => {
      clearTimeout(t);
      resolve(v);
    }).catch((e) => {
      clearTimeout(t);
      reject(e);
    });
  });
}

function toStr(v: unknown, sep = "\n• "): string {
  if (v == null) return "";
  if (Array.isArray(v)) {
    const flat = v
      .map((x) => (Array.isArray(x) ? x.join(sep) : String(x)))
      .map((s) => s.trim())
      .filter(Boolean);
    return flat.length ? "• " + flat.join(sep) : "";
  }
  return String(v ?? "").trim();
}

function convertirAArray(input: unknown): string[] {
  if (Array.isArray(input)) return input.map((s) => String(s).trim()).filter(Boolean);
  if (typeof input === "string")
    return input
      .split(/[\n,;\u2022\u25AA\u00B7\u25CF|]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  return [];
}


// === HARD FILTER de Valor (profundo y agresivo) ===
function _normNoAccents(s: string) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function _stemValor(raw: string): string {
  const v = _normNoAccents(raw || "");
  if (!v) return "";
  const suf = [
    "alidad","idad","mente","ciones","cion","sion","anza",
    "encias","encia","abilidad","bilidad","able","ables",
    "ario","aria","ismo","ista","eza","oso","osa","itud","al","es"
  ];
  let w = v;
  for (const sfx of suf) { if (w.endsWith(sfx)) { w = w.slice(0, -sfx.length); break; } }
  if (w.includes("puntual")) w = "puntual";
  if (w.includes("respons")) w = "respons";
  if (w.includes("respet"))  w = "respet";
  return w.length >= 3 ? w : v;
}

/** Borra la palabra del valor y sus derivados; también frases tipo “importancia de ser puntual”. */
function _purgeValorFromLine(line: string, valor: string): string {
  const stem = _stemValor(valor);
  if (!stem) return line;
  // palabra del valor con sufijos
  const rxWord = new RegExp(`\\b${stem}[a-záéíóúüñ]*\\b`, "gi");
  // frases típicas molestas
  const rxPhrase = new RegExp(`\\b(importancia\\s+de\\s+ser\\s+)?${stem}[a-záéíóúüñ]*\\b`, "gi");

  let t = String(line || "");
  t = t.replace(rxPhrase, "");
  t = t.replace(rxWord, "");
  // casos frecuentes tipo “siguiendo instrucciones puntuales”
  t = t.replace(/\bsiguiendo\s+instrucciones\s+[a-záéíóúüñ]*\b/gi, "siguiendo instrucciones");
  // colapsa espacios y limpia
  return t.replace(/\s{2,}/g, " ").trim();
}

/** Aplica la purga a cualquier string/array/objeto (deep). */
function purgeValorDeep<T = any>(obj: T, valor: string): T {
  const visit = (x: any): any => {
    if (typeof x === "string") {
      const arr = convertirAArray(x).map(l => _purgeValorFromLine(l, valor)).filter(Boolean);
      return toStr(arr); // vuelve a bullets bonitos
    }
    if (Array.isArray(x)) return x.map(visit);
    if (x && typeof x === "object") {
      const y: any = {};
      for (const k in x) y[k] = visit(x[k]);
      return y;
    }
    return x;
  };
  return visit(obj);
}

/** Asegura mínimo de bullets por sección; si se vacía tras la purga, rellena. */
function ensureMinBullets(txt: string, min: number, fallbacks: string[]): string {
  let arr = convertirAArray(txt);
  while (arr.length < min) {
    arr.push(fallbacks[arr.length] ?? "Actividad del tema.");
  }
  return toStr(arr);
}


// --- Helpers para filtrar el VALOR y reescribir evidencias ---
function normStr(s: string): string {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
function dropValorFromText(txt?: string, valor?: string, bulleted = true): string {
  if (!txt || !valor) return txt ?? "";
  const v = normStr(valor);
  if (!v) return txt;

  // raíces heurísticas para “puntualidad” y similares
  const roots = new Set<string>([v]);
  if (v.endsWith("idad")) roots.add(v.slice(0, -4)); // puntualidad -> puntual
  if (v.endsWith("dad")) roots.add(v.slice(0, -3));
  if (v.includes("puntual")) roots.add("puntual");
  if (v.includes("respeto")) roots.add("respet");
  if (v.includes("respons")) roots.add("respons");

  const arr = convertirAArray(txt);
  const kept = arr.filter((line) => {
    const n = normStr(line);
    for (const r of roots) if (r && n.includes(r)) return false;
    return true;
  });

  if (!kept.length) return "";
  // si queremos bullets, formateamos como lista; si no, texto plano con saltos de línea
  return bulleted ? ("• " + kept.join("\n• ")) : kept.join("\n");
}


// ===== SUPER-SCRUB DEL VALOR (para que NO se cuele en ningún campo) =====
function stemValor(raw: string): string {
  const v = normStr(raw || "");           // ya sin tildes y en minúsculas
  if (!v) return "";
  // recorta sufijos comunes en español
  const suf = [
    "alidad","idad","mente","ciones","cion","sion","anza",
    "encias","encia","abilidad","bilidad","able","ables",
    "ario","aria","ismo","ista","eza","oso","osa","itud","al","es"
  ];
  let w = v;
  for (const sfx of suf) {
    if (w.endsWith(sfx)) { w = w.slice(0, -sfx.length); break; }
  }
  // casos muy típicos
  if (w.includes("puntual")) w = "puntual";       // captura puntual/puntuales/puntualmente/puntualidad
  if (w.includes("respons")) w = "respons";
  if (w.includes("respet"))  w = "respet";
  return w.length >= 3 ? w : v; // fallback si quedó muy corto
}

function scrubValorInText(txt?: string, valor?: string): string {
  if (!txt) return "";
  const stem = stemValor(valor || "");
  if (!stem) return txt;

  // regex que detecta la raíz + cualquier sufijo (letras y acentos)
  const rxWord = new RegExp(`\\b${stem}[a-záéíóúüñ]*\\b`, "gi");

  // dividimos en líneas/bullets, eliminamos líneas que contengan el valor
  const lines = convertirAArray(txt);
  const kept = lines.filter(l => !rxWord.test(normStr(l)));

  // por si quedara la palabra sola en una línea y no queremos perder la línea completa
  const cleaned = kept.map(l => l.replace(rxWord, "").replace(/\s{2,}/g, " ").trim()).filter(Boolean);

  return toStr(cleaned);
}

function scrubValorEverywhere(markers: any, valor?: string) {
  const campos = [
    "inicio","desarrollo","cierre",
    "desempenos","evidenciaAprendizaje","criteriosEvaluacion",
    "capacidades","acciones","competencia","tituloSesion"
  ];
  for (const k of campos) {
    if (k in markers) markers[k] = scrubValorInText(markers[k], valor);
  }
  return markers;
}
function rewriteEvidencias(txt?: string): string {
  const arr = convertirAArray(txt);
  const out = arr.map((s) => {
    let t = s.trim();
    t = t.replace(/^Participaci[oó]n en\b/i, "Participa en");
    t = t.replace(/^Dibujo( libre)?\b/i, "Realiza un dibujo");
    t = t.replace(/^Hoja de trabajo:?\s*/i, "Completa una hoja de trabajo: ");
    t = t.replace(/^Producto:\s*/i, "Elabora ");
    return t;
  });
  return toStr(out);
}


// --- Fix acentos/ñ y bullets mojibake que a veces llegan mal de consola/JSON ---
function fixMojibake(s: string): string {
  if (!s) return s;
  return String(s)
    // viñetas y símbolos mal decodificados (UTF-8 → CP1252)
    .replace(/â¢/g, "•") // bullet
    .replace(/â€¢/g, "•")
    .replace(/â/g, "–") // en dash
    .replace(/â/g, "—") // em dash
    .replace(/â|â/g, '"') // comillas tipográficas
    .replace(/â/g, "'")     // apóstrofo
    .replace(/â¦/g, "…")     // elipsis
    // signos varios y residuos "Â"
    .replace(/Â¿/g, "¿")
    .replace(/Â¡/g, "¡")
    .replace(/Â°/g, "°")
    .replace(/Â/g, "")
    // vocales/ñ/ü mal decodificadas
    .replace(/Ã¡/g, "á").replace(/Ã©/g, "é")
    .replace(/Ã­/g, "í").replace(/Ã³/g, "ó")
    .replace(/Ãº/g, "ú").replace(/Ã±/g, "ñ")
    .replace(/Ã‘/g, "Ñ").replace(/Ã¼/g, "ü")
    .replace(/Ãœ/g, "Ü")
    // símbolos privados de fuentes (PUA)
    .replace(/[\uF000-\uF8FF]/g, "");
}


function deepCleanStrings<T>(obj: T): T {
  if (typeof obj === "string") return fixMojibake(obj) as unknown as T;
  if (Array.isArray(obj)) return obj.map(deepCleanStrings) as unknown as T;
  if (obj && typeof obj === "object") {
    const out: any = {};
    for (const k in obj as any) out[k] = deepCleanStrings((obj as any)[k]);
    return out;
  }
  return obj;
}

// --- Detectores de instrumentos en evidencias ---
const INSTRUMENT_PATTERNS = [
  /lista\s+de\s+cotejo/i,
  /observaci(?:ó|o)n\s+directa/i,
  /preguntas?\s+orales?/i,
  /rúbri?ca/i,
  /registro\s+anec(?:d|t)ótico/i,
  /escala\s+de\s+valoraci(?:ó|o)n/i
];

/* ==== PASO 1: helpers para eliminar menciones del VALOR en momentos ==== */

// Quitar acentos para comparar sin tildes
const stripAccents = (s: string) =>
  (s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Variantes de cada valor (prefijos/derivaciones comunes)
const VALOR_STEMS: Record<string, string[]> = {
  "Puntualidad": ["puntualidad", "puntual", "puntuales", "puntualmente"],
  "Responsabilidad": ["responsabilidad", "responsable", "responsables", "responsablemente"],
  "Respeto": ["respeto", "respet", "respetar", "respetuos"],
  "Solidaridad": ["solidaridad", "solidari"],
  "Honestidad": ["honestidad", "honest"],
  "Justicia": ["justicia", "justo", "justa", "justos", "justas"],
  "Empatía": ["empatia", "empatic"],
  "Autonomía": ["autonomia", "autonom"],
  "Perseverancia": ["perseverancia", "persever"],
  "Cooperación": ["cooperacion", "cooperar", "cooperativ"],
  "Tolerancia": ["tolerancia", "tolerante", "tolerantes"],
};

// Construye una RegExp con todas las variantes del valor elegido
function buildValorRegex(valor: string): RegExp | null {
  const v = (valor ?? "").trim();
  if (!v) return null;
  const key =
    Object.keys(VALOR_STEMS).find(k => k.toLowerCase().startsWith(v.toLowerCase())) || v;
  const stems = VALOR_STEMS[key] ?? [v];
  const alts = stems.map(s => stripAccents(s.toLowerCase())).join("|");
  return alts ? new RegExp(`\\b(?:${alts})\\b`, "i") : null;
}

/**
 * Elimina líneas que mencionen el VALOR. Si quedan menos de "minLines",
 * rellena con líneas genéricas centradas en el TEMA (saludo lúdico flexible).
 *
 * - text: bullets en string (nuestro formato)
 * - valor: el valor del payload ("Puntualidad", etc.)
 * - tema: tema de la sesión (para fallback)
 * - minLines: mínimo de líneas que queremos asegurar
 * - fallbackLines: líneas por defecto si nos quedamos cortos
 */
function removeValorLines(
  text: string | undefined,
  valor: string,
  tema: string,
  minLines: number,
  fallbackLines: string[]
): string {
  const rx = buildValorRegex(valor);
  const lines = convertirAArray(text);
  const filtered = rx ? lines.filter(l => !rx.test(stripAccents(l.toLowerCase()))) : lines;

  const filled = filtered.slice();
  while (filled.length < minLines) {
    const next =
      fallbackLines[filled.length] ??
      `Actividad sobre ${tema}.`;
    filled.push(next);
  }
  return toStr(filled);
}


function extractBalancedJson(s: string) {
  let depth = 0, start = -1, inStr = false, esc = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      if (esc) { esc = false; continue; }
      if (ch === "\\") { esc = true; continue; }
      if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') { inStr = true; continue; }
    if (ch === "{") { if (depth === 0) start = i; depth++; }
    else if (ch === "}") { depth--; if (depth === 0 && start !== -1) return s.slice(start, i + 1); }
  }
  return null;
}

function tryJSON<T = any>(txt: string): T | null {
  try { return JSON.parse(txt) as T; } catch { return null; }
}

// Normaliza “grado” para que el schema lo acepte (3/4/5 años)
function normalizeGrado(input: unknown): "3 años" | "4 años" | "5 años" | undefined {
  if (input == null) return undefined;
  let s = String(input)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes (años -> anos)
    .trim();
  if (s.startsWith("3")) return "3 años";
  if (s.startsWith("4")) return "4 años";
  if (s.startsWith("5")) return "5 años";
  return undefined;
}

// ====== PASO 3: Helpers de refuerzo de estructura ======
function arr<T = any>(v: any): T[] { return Array.isArray(v) ? v : (v == null ? [] : [v]); }
function ensureMin<T>(a: T[], n: number, fill: () => T) {
  while (a.length < n) a.push(fill());
  return a;
}
function ensureTexto(s: any, def = ""): string { return (s == null ? def : String(s)).trim(); }

function filtraMateriales(mats: any): string[] {
  const a = Array.isArray(mats) ? mats : (typeof mats === "string" ? [mats] : []);
  return a
    .map(s => String(s).trim())
    .filter(Boolean)
    .filter(s => {
      const low = s.toLowerCase();
      // ❌ tech pesada de aula
      if (/(proyector|tele(visor|visión)|tv|computador|computadora|pc|laptop|proyección|video\b)/i.test(low)) return false;
      return true; // ✅ parlantes/altavoz sí
    });
}

function temaBasico(tema: string) {
  const t = (tema || "el tema").trim();
  return t.charAt(0).toLowerCase() + t.slice(1);
}

function buildEvidenciasAprendizaje(tema: string): string[] {
  const t = temaBasico(tema);
  return [
    `Realiza un dibujo sobre ${t}.`,
    `Participa activamente en la actividad principal (juego o dramatización) relacionada con ${t}.`,
    `Explica con palabras o gestos lo que aprendió sobre ${t}.`,
  ];
}

function buildAccionesObservables(tema: string): string[] {
  const t = temaBasico(tema);
  return [
    `Identifica elementos clave de ${t}.`,
    `Sigue consignas simples durante las actividades.`,
    `Comunica con palabras o gestos sus ideas sobre ${t}.`,
    `Comparte su trabajo y escucha a sus compañeros.`,
  ];
}


/** Fuerza Inicio con 3 líneas, Desarrollo con 3 actividades (≥3 pasos c/u) y Cierre con socialización+refuerzo+ canción */
function enforceEstructuraInicial(f: any, tema: string) {
  f.momentos ||= {};

  // INICIO (3 líneas fijas)
  const inicio = (f.momentos.inicio ||= {});
  const iEstr = arr<string>(inicio.estrategias);
  if (iEstr.length < 3) {
    inicio.estrategias = [
      "Saludo lúdico: saludo en círculo con movimiento y rima corta.",
      "Motivación: mostrar imagen u objeto relacionado con el tema.",
      "Saberes/Exploración previa: preguntas simples sobre experiencias previas."
    ];
  }
  inicio.materiales = ensureMin(arr<string>(inicio.materiales), 2, () => "Tarjetas/Láminas");

  // DESARROLLO (exactamente 3 actividades con ≥3 pasos)
  const des = (f.momentos.desarrollo ||= {});
  des.actividades = arr<any>(des.actividades);
  ensureMin<any>(des.actividades, 3, () => ({ titulo: "", pasos: [] }));
  des.actividades = des.actividades.slice(0, 3).map((a: any, idx: number) => {
    a ||= {};
    a.titulo = ensureTexto(a.titulo, `Actividad ${idx + 1}: ${tema}`);
    a.pasos = ensureMin(arr<string>(a.pasos).map((s) => ensureTexto(s)).filter(Boolean), 3, () => "Seguir indicaciones simples de la docente.");
    return a;
  });
  des.materiales = ensureMin(arr<string>(des.materiales), 2, () => "Papel bond/Crayolas");

  // CIERRE (3 líneas: socialización, refuerzo, canción)
  const cie = (f.momentos.cierre ||= {});
  const cEstr = arr<string>(cie.estrategias);
  const cierreBase = [
    "Socialización: compartir qué fue lo que más les gustó o aprendieron.",
    "Refuerzo de lo aprendido: recordar en voz alta la idea principal del tema.",
    "Canción de despedida: rondita corta relacionada al tema."
  ];
  cie.estrategias = cEstr.length >= 3 ? cEstr.slice(0, 3) : cierreBase;
  cie.materiales = ensureMin(arr<string>(cie.materiales), 1, () => "Parlantes/Altavoz");

  // Filtrado final de materiales
  ["inicio", "desarrollo", "cierre"].forEach((m) => {
    const mats = f?.momentos?.[m]?.materiales;
    f.momentos[m].materiales = filtraMateriales(mats);
  });
}


/* --------------------------- Handler SOLO INICIAL --------------------------- */
export async function POST(req: NextRequest) {
  try {
    // 1) Body
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: "JSON inválido" }, { status: 400 });
    }

    // 2) Provider
    const rawProvider =
      body?.provider === "cohere" || body?.provider === "ollama-mistral"
        ? body.provider
        : "cohere";
    const provider: "cohere" | "ollama-mistral" = rawProvider;

    // 3) Normalizamos grado y quitamos provider antes de validar
    const { provider: _ignore, ...candidate } = body ?? {};
    const bodyForSchema = {
      ...candidate,
      grado: normalizeGrado(candidate.grado) ?? candidate.grado,
    };

    // 4) Validación con el esquema de Inicial (payload PLANO)
    const parsed = inicialReqSchema.safeParse(bodyForSchema);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Payload inválido", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const payload = parsed.data as typeof parsed.data & { area: string; competencia?: string };

    // 5) Forzar área/competencia/capacidades según tu tabla oficial
    const { areaKey, compKey, capacidades } = getCompetenciaYCapacidades(
  payload.area,
  payload.competencia,
  {
    capacidades: Array.isArray((payload as any).capacidades)
      ? (payload as any).capacidades
      : (typeof (payload as any).capacidades === "string"
          ? (payload as any).capacidades.split(/[\n,;]+/).map((s: string) => s.trim()).filter(Boolean)
          : []),
    tema: (payload as any).tema
  }
);

    if (!areaKey || !compKey || capacidades.length === 0) {
      return NextResponse.json(
        { success: false, error: "Área/competencia no válidas según MINEDU" },
        { status: 400 }
      );
    }

    // 6) Reglas duras para el prompt
    const hardRules = `
REGLAS ESTRICTAS (NO INCUMPLIR):
- Área: "${areaKey}" (invariable)
- Competencia: "${compKey}" (exacta, no inventar otra)
- Capacidad(es) permitidas (usar solo de esta lista, no agregar otras):
${capacidades.map((c) => `• ${c}`).join("\n")}
- Si el usuario no selecciona capacidad, elige SOLO de esa lista.
- No cambies nombres. No mezcles competencias de otras áreas.
`.trim();

    // 7) Prompts de INICIAL (inyectamos reglas en system y competencia canónica al prompt)
    const system = (SYSTEM_INICIAL + "\n" + hardRules).trim();

    // Si tu builder soporta pasar competencia, hazlo; si no, igual la reforzamos en el prompt
    let prompt = buildUserPromptInicial(payload, compKey);

    prompt += `

[CAPACIDADES PERMITIDAS – USAR SOLO ESTAS]
${capacidades.map((c) => `- ${c}`).join("\n")}
`.trim();

    // 8) Llamada a la IA con timeout
    const raw = await withTimeout(
      generateSessionJSON({ provider, system, prompt, temperature: 0.2 }),
      240_000
    );

    // 9) Limpieza / parse robusto
    const rawStr = typeof raw === "string" ? raw : JSON.stringify(raw);
    const cleaned = rawStr
      .replace(/\\u[\da-f]{0,3}[^a-f0-9]/gi, "")
      .replace(/[“”‘’]/g, '"')
      .replace(/\u0000/g, "")
      .trim();

    let data: any = tryJSON(cleaned);
    if (!data) {
      const bal = extractBalancedJson(cleaned);
      if (bal) data = tryJSON(bal);
    }
    if (!data) {
      try { data = tryJSON(jsonrepair(cleaned)); } catch { /* noop */ }
    }
    if (!data) {
      return NextResponse.json(
        { success: false, error: "La IA no devolvió JSON válido", sample: cleaned.slice(0, 800) },
        { status: 502 }
      );
    }

    // 10) Blindaje final: área/competencia fijas y capacidades filtradas
    data.area = areaKey;
    data.competencia = compKey;
    if (Array.isArray(data.capacidades)) {
      data.capacidades = data.capacidades.filter((c: string) =>
        capacidades.some((allow) => norm(allow) === norm(c))
      );
    }
    if (!Array.isArray(data.capacidades) || data.capacidades.length === 0) {
      data.capacidades = capacidades.slice(0, 2);
    }

    // === Definir d y f para el resto de tu pipeline (evita "Cannot find name 'f'")
    const d: Record<string, any> = data?.datos ?? {};
    const f: Record<string, any> = (data?.filas?.[0] ?? data?.fila ?? {}) as Record<string, any>;

    // ====== Refuerzo de estructura (usa tus helpers ya definidos) ======
    const temaSesion = (payload as any).tema ?? f?.tituloSesion ?? "Actividad";
    enforceEstructuraInicial(f, temaSesion);

    // --- util local por si no lo tienes arriba; si ya lo tienes, puedes borrar esta const local
    const formatActividades = (acts?: Array<{ titulo?: string; pasos?: string[] }>): string => {
      if (!Array.isArray(acts) || !acts.length) return "";
      const out: string[] = [];
      acts.forEach((a, i) => {
        const titulo = (a?.titulo ?? `Actividad ${i + 1}`).trim();
        out.push(`${titulo}`);
        if (Array.isArray(a?.pasos)) {
          a!.pasos!.forEach(p => {
            const s = String(p ?? "").trim();
            if (s) out.push(`  • ${s}`);
          });
        }
      });
      return out.join("\n");
    };

    // ===== Construcción de markers (idéntica a tu flujo, con d/f ya definidos) =====
    let markers: any = {
      // Encabezado
      tituloSesion: String(f.tituloSesion ?? d.tituloSesion ?? "SESIÓN DE APRENDIZAJE"),
      grado: String(d.grado ?? payload.grado ?? ""),
      bimestre: String(d.bimestre ?? payload.bimestre ?? ""),
      area: String(d.area ?? payload.area ?? ""),
      experiencia: String(d.experiencia ?? payload.experiencia ?? ""),
      docente: String(d.docente ?? payload.docente ?? ""),
      fecha: String(d.fecha ?? payload.fecha ?? ""),
      sesionN: String(d.numeroSesion ?? d.sesionN ?? (payload as any).numeroSesion ?? ""),

      // Tabla II (Propósito/Evaluación)
      competencia: String(compKey),
      capacidades: toStr(Array.isArray(data.capacidades) ? data.capacidades : (d.capacidades ?? f.capacidades)),
      desempenos: toStr(f.desempenos ?? f.desempenosPrecisados ?? d.desempenos),
      evidenciaAprendizaje: toStr(f.evidenciaAprendizaje ?? d.evidenciaAprendizaje),
      criteriosEvaluacion: toStr(f.criteriosEvaluacion ?? d.criteriosEvaluacion),
      instrumento: toStr(f.instrumento ?? d.instrumento ?? "Evaluación cualitativa-Cuantitativa"),

      // Enfoques / Valor / Acciones
      enfoquesTransversales: toStr(d.enfoquesTransversales ?? f.enfoquesTransversales ?? (payload as any).enfoquesTransversales),
      valor: String(d.valor ?? f.valor ?? (payload as any).valor ?? ""),
      acciones: toStr(d.acciones ?? f.acciones ?? f.accionesObservables ?? (payload as any).accionesObservables),

      // Momentos + Materiales
      inicio: (() => {
        const estr = toStr(f?.momentos?.inicio?.estrategias);
        const acts = formatActividades(f?.momentos?.inicio?.actividades);
        return [estr, acts].filter(Boolean).join("\n");
      })(),
      inicioM: toStr(f?.momentos?.inicio?.materiales ?? []),

      desarrollo: (() => {
        const estr = toStr(f?.momentos?.desarrollo?.estrategias);
        const acts = formatActividades(f?.momentos?.desarrollo?.actividades);
        return [estr, acts].filter(Boolean).join("\n");
      })(),
      desarrolloM: toStr(f?.momentos?.desarrollo?.materiales ?? []),

      cierre: (() => {
        const estr = toStr(f?.momentos?.cierre?.estrategias);
        const acts = formatActividades(f?.momentos?.cierre?.actividades);
        return [estr, acts].filter(Boolean).join("\n");
      })(),
      cierreM: toStr(f?.momentos?.cierre?.materiales ?? []),
    };

    /* ===== Correcciones finales ===== */

    // 1) Evidencias ≠ Instrumentos: saca instrumentos de evidencias
    {
      const evArr = convertirAArray(markers.evidenciaAprendizaje);
      const instFromEv: string[] = [];
      const evClean = evArr.filter((x) => {
        if (INSTRUMENT_PATTERNS.some((r) => r.test(x))) { instFromEv.push(x); return false; }
        return true;
      });

      const instArr = convertirAArray(markers.instrumento).concat(instFromEv);
      const evFinal = evClean.length ? evClean : [
        "Producto: hoja de trabajo/dibujo terminado relacionado con el tema",
        "Participación observable en la dramatización o actividad principal"
      ];

      markers.evidenciaAprendizaje = toStr(evFinal);
      markers.instrumento = toStr(instArr.length ? instArr : ["Lista de cotejo", "Observación directa"]);
    }

    // 2) El VALOR no debe aparecer en ningún texto (solo en su casilla {valor})
    {
      const valorStr = String((payload as any).valor ?? "").trim();
      const drop = (s?: string) => dropValorFromText(s, valorStr);

      markers.inicio = drop(markers.inicio);
      markers.desarrollo = drop(markers.desarrollo);
      markers.cierre = drop(markers.cierre);
      markers.desempenos = drop(markers.desempenos);
      markers.evidenciaAprendizaje = drop(markers.evidenciaAprendizaje);
      markers.criteriosEvaluacion = drop(markers.criteriosEvaluacion);
      markers.competencia = dropValorFromText(markers.competencia, valorStr, /* bulleted */ false);


      // Reescritura de evidencias a frases centradas en el estudiante
      markers.evidenciaAprendizaje = rewriteEvidencias(markers.evidenciaAprendizaje);
    }

    // 3) Enfoques con detalle (Nombre: definición breve)
    {
      const enfNombres = convertirAArray(
        (d as any).enfoquesTransversales ??
        (f as any).enfoquesTransversales ??
        (payload as any).enfoquesTransversales ?? []
      );

      const enfDetallados = enfNombres.map((name) => {
        const key = Object.keys(ENFOQUES_DETALLE).find(k => k.toLowerCase().startsWith(name.toLowerCase()));
        return key ? `${key}: ${ENFOQUES_DETALLE[key]}` : name;
      });

      if (enfDetallados.length) {
        markers.enfoquesTransversales = toStr(enfDetallados);
      }
    }

    // 4) Limpieza de acentos/ñ/bullets en TODOS los campos de markers
    markers = deepCleanStrings(markers);

    // 5) Fallbacks
    {
      const temaFallback = String((payload as any).tema ?? f?.tituloSesion ?? "el tema");
      const areaLower = String(d.area ?? payload.area ?? "").toLowerCase();
      const isEmpty = (s?: string) => !s || !String(s).trim();

      if (isEmpty(markers.competencia)) {
        if (areaLower.includes("ingl")) {
          markers.competencia = "Se comunica oralmente en inglés como lengua extranjera.";
        } else if (areaLower.includes("comunica")) {
          markers.competencia = "Se comunica oralmente en su lengua materna.";
        } else if (areaLower.includes("personal")) {
          markers.competencia = "Construye su identidad y convive y participa democráticamente.";
        } else if (areaLower.includes("ciencia")) {
          markers.competencia = "Indaga mediante acciones para construir sus conocimientos.";
        } else if (areaLower.includes("psicom")) {
          markers.competencia = "Se desenvuelve de manera autónoma a través de su motricidad.";
        } else {
          markers.competencia = "Explora, experimenta y describe su entorno a través del juego.";
        }
      }

      if (isEmpty(markers.capacidades)) {
        markers.capacidades = toStr([
          `Escucha y sigue consignas simples relacionadas con “${temaFallback}”.`,
          `Expresa ideas o gestos sobre “${temaFallback}”.`
        ]);
      }

      if (isEmpty(markers.desempenos)) {
        markers.desempenos = toStr([
          `Participa activamente en actividades sobre “${temaFallback}”.`,
          `Demuestra comprensión mediante acciones u oralidad simple.`
        ]);
      }

      if (isEmpty(markers.criteriosEvaluacion)) {
        markers.criteriosEvaluacion = toStr([
          `Participa y sigue consignas durante las actividades.`,
          `Muestra comprensión de “${temaFallback}” con acciones/gestos o palabras.`,
          `Trabaja con autonomía progresiva y respeta turnos.`,
          `Comunica su producción o idea final de forma simple.`
        ]);
      }

      if (isEmpty(markers.instrumento)) {
        markers.instrumento = toStr(["Lista de cotejo", "Observación directa"]);
      }

      if (isEmpty(markers.inicio)) {
        markers.inicio = toStr([
          "Saludo lúdico.",
          "Motivación: objeto o imagen del tema.",
          "Saberes previos: preguntas simples."
        ]);
      }
      if (isEmpty(markers.inicioM)) {
        markers.inicioM = toStr(["tarjetas/láminas", "pizarra y plumones"]);
      }
      if (isEmpty(markers.desarrollo)) {
        markers.desarrollo = toStr([
          "Actividad 1 con pasos claros.",
          "Actividad 2 con pasos claros.",
          "Actividad 3 con pasos claros."
        ]);
      }
      if (isEmpty(markers.desarrolloM)) {
        markers.desarrolloM = toStr(["papel bond", "crayolas"]);
      }
      if (isEmpty(markers.cierre)) {
        markers.cierre = toStr([
          "Socialización del aprendizaje.",
          "Refuerzo de la idea principal.",
          "Canción de cierre."
        ]);
      }
      if (isEmpty(markers.cierreM)) {
        markers.cierreM = toStr(["parlantes/altavoz"]);
      }
    }

    // ===== Purga FINAL del VALOR, manteniendo encabezados sin bullets =====
    {
      const valorFinal = String((payload as any).valor ?? d?.valor ?? f?.valor ?? "").trim();
      const PLAIN_FIELDS = new Set([
        "tituloSesion", "grado", "bimestre", "area", "experiencia", "docente", "fecha", "sesionN", "competencia"
      ]);

      for (const k of Object.keys(markers)) {
        if (k === "valor") continue;
        const v = (markers as any)[k];
        if (typeof v !== "string") continue;
        const isPlain = PLAIN_FIELDS.has(k);
        (markers as any)[k] = dropValorFromText(v, valorFinal, !isPlain);
      }

      markers = deepCleanStrings(markers);
    }

    // 10) (Opcional) Guardado local de out-session.json
    try {
      const outPath = path.resolve(process.cwd(), "out-session.json");
      const toWrite = JSON.stringify({ success: true, data, markers }, null, 2);
      fs.writeFileSync(outPath, ""); // limpiar
      fs.writeFileSync(outPath, toWrite, "utf8");
    } catch {
      // ignorar si no hay FS persistente
    }

    // 11) Respuesta
    return NextResponse.json({ success: true, data, markers }, { status: 200 });

  } catch (error: any) {
    console.error("❌ Error en /api/generar (inicial):", error);
    return NextResponse.json(
      { success: false, error: error?.message ?? "Error desconocido" },
      { status: 500 }
    );
  }
}
function norm(s?: string) {
  return (s ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}
