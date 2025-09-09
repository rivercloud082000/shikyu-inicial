import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

/** ---------- Helpers de formateo ---------- */
const bullet = (s: string) => `• ${s}`;
const asArray = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  if (typeof v === "string" && v.trim()) return [v.trim()];
  return [];
};
const bullets = (v?: unknown) => {
  const arr = asArray(v);
  return arr.length ? arr.map(bullet).join("\n") : "";
};
const lines = (v?: unknown) => {
  const arr = asArray(v);
  return arr.length ? arr.join("\n") : "";
};

/** ¿El payload YA es un objeto de markers plano? */
const esMarkers = (o: any) =>
  o && typeof o === "object" && "tituloSesion" in o && "grado" in o && "area" in o;

/** Formatea un bloque “momento” (estrategias + actividades) a texto con viñetas */
function formateaMomento(m?: {
  estrategias?: string[];
  actividades?: { titulo?: string; pasos?: string[] }[];
}): string {
  if (!m) return "";
  const out: string[] = [];
  if (Array.isArray(m.estrategias)) for (const e of m.estrategias) out.push(bullet(e));
  if (Array.isArray(m.actividades)) {
    for (const act of m.actividades) {
      if (act.titulo) out.push(`${act.titulo}`);
      if (Array.isArray(act.pasos)) for (const p of act.pasos) out.push(`  ${bullet(p)}`);
    }
  }
  return out.join("\n");
}

/** Transforma una sesión completa ({datos, filas}) a markers planos para la plantilla DOCX */
const transformarDesdeSesion = (json: any): Record<string, any> => {
  const d = json?.datos || {};
  const f = (json?.filas && json.filas[0]) || {};
  const desempenos = (f as any).desempenos ?? (f as any).desempenosPrecisados;

  return {
    // Encabezado
    tituloSesion: f?.tituloSesion ?? "SESIÓN DE APRENDIZAJE",
    grado: d?.grado ?? "",
    bimestre: d?.bimestre ?? "",
    area: d?.area ?? "",
    experiencia: d?.experiencia ?? "",
    docente: d?.docente ?? "",
    fecha: d?.fecha ?? "",
    sesionN: d?.numeroSesion != null ? String(d.numeroSesion) : "",

    // Tabla II
    competencia: d?.competencia ?? (f as any).competencia ?? "",
    capacidades: bullets(d?.capacidades),
    desempenos: bullets(desempenos),
    evidenciaAprendizaje: bullets((f as any).evidenciaAprendizaje),
    criteriosEvaluacion: bullets((f as any).criteriosEvaluacion),
    instrumento: lines((f as any).instrumento) || "Evaluación cualitativa-Cuantitativa",

    // Enfoques / Valor / Acciones
    enfoquesTransversales: bullets(d?.enfoquesTransversales ?? (f as any).enfoquesTransversales),
    valor: d?.valor ?? (f as any).valor ?? "",
    acciones: bullets((f as any).accionesObservables ?? d?.acciones),

    // Momentos
    inicio: formateaMomento(f?.momentos?.inicio),
    inicioM: lines(f?.momentos?.inicio?.materiales),
    desarrollo: formateaMomento(f?.momentos?.desarrollo),
    desarrolloM: lines(f?.momentos?.desarrollo?.materiales),
    cierre: formateaMomento(f?.momentos?.cierre),
    cierreM: lines(f?.momentos?.cierre?.materiales),
  };
};

/** Arreglo de mojibake / tildes rotas (Ã¡ -> á, etc.) */
function fixMojibake(s: string): string {
  return s
    .replace(/Ã¡/g, "á").replace(/Ã©/g, "é").replace(/Ã­/g, "í").replace(/Ã³/g, "ó").replace(/Ãº/g, "ú")
    .replace(/Ã±/g, "ñ").replace(/Â¿/g, "¿").replace(/Â¡/g, "¡")
    .replace(/â€œ/g, "“").replace(/â€\u009d|â€œ/g, "”")
    .replace(/â€˜/g, "‘").replace(/â€™/g, "’")
    .replace(/â€“/g, "–").replace(/â€”/g, "—").replace(/â€¢/g, "•")
    .replace(/\uFEFF|\u200B/g, "");
}

/** Limpieza básica (no tocamos llaves de Docxtemplater) */
const sanitizeData = (input: any): any => {
  if (Array.isArray(input)) return input.map(sanitizeData);
  if (typeof input === "object" && input !== null) {
    const sanitized: Record<string, any> = {};
    for (const key in input) sanitized[key] = sanitizeData(input[key]);
    return sanitized;
  }
  if (typeof input === "string") {
    return fixMojibake(input).replace(/\r\n/g, "\n").replace(/\u0000/g, "").trim();
  }
  return input;
};

/**
 * Genera un .docx desde la plantilla y el payload.
 * Acepta:
 *  - markers planos (lo que guardaste en markers.json)
 *  - { markers: {...} }
 *  - sesión completa { datos, filas } (la convierte a markers)
 */
export function generarWordDesdePlantilla(json: any): Buffer {
  const plantillaPath =
    process.env.DOCX_TEMPLATE_PATH ||
    path.join(process.cwd(), "public", "plantilla-sesion.docx");

  if (!fs.existsSync(plantillaPath)) {
    throw new Error(`⚠️ Plantilla no encontrada en: ${plantillaPath}`);
  }

  // 1) Elegir los datos finales para la plantilla (markers planos)
  let dataForDoc: Record<string, any>;
  if (json?.markers && esMarkers(json.markers)) dataForDoc = json.markers;
  else if (esMarkers(json)) dataForDoc = json;
  else if (json?.filas || json?.datos) dataForDoc = transformarDesdeSesion(json);
  else throw new Error("Payload inválido: envía {markers:{...}} o {datos, filas}.");

  // 2) Sanitizar
  const data = sanitizeData(dataForDoc);
  console.log("📝 Datos a renderizar (markers):", JSON.stringify(data, null, 2));

  // 3) Render DOCX
  try {
    const content = fs.readFileSync(plantillaPath, "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

    // Docxtemplater recomienda setData+render
    doc.setData(data);
    doc.render();

    return doc.getZip().generate({ type: "nodebuffer" });
  } catch (err: any) {
    // Mensaje legible y útil
    const list =
      err?.properties?.errors?.map((e: any) => e.explanation || `${e.id ?? ""} ${e.tag ?? ""}`) ?? [];
    const details = [err?.message, ...list].filter(Boolean).join(" | ");
    console.error("🛑 ERROR AL GENERAR WORD:", details);
    throw new Error(`Docxtemplater: ${details || "Error desconocido"}`);
  }
}

