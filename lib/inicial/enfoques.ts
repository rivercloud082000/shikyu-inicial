// lib/inicial/enfoques.ts

/** Diccionario oficial: Nombre -> descripción breve (usado por front y back) */
export const ENFOQUES_DETALLE: Record<string, string> = {
  "Enfoque de derechos":
    "Reconocer y ejercer derechos y deberes; convivencia democrática y respeto a la dignidad.",
  "Enfoque inclusivo o de atención a la diversidad":
    "Garantiza participación y aprendizaje de todos con adaptaciones culturales, lingüísticas, físicas o cognitivas.",
  "Enfoque intercultural":
    "Valora la diversidad cultural (saberes, lenguas, tradiciones) para fortalecer la identidad.",
  "Enfoque de igualdad de género":
    "Elimina estereotipos de género; niñas y niños participan en roles diversos sin distinción.",
  "Enfoque ambiental":
    "Promueve conciencia ecológica y prácticas sostenibles (reciclaje, huerto, cuidado del entorno).",
  "Enfoque de orientación al bien común":
    "Fomenta solidaridad, empatía y responsabilidad colectiva; trabajo en equipo y cuidado de espacios.",
  "Enfoque de búsqueda de la excelencia":
    "Motiva el esfuerzo, la mejora continua y la valoración del progreso.",
};

export type EnfoqueKey = keyof typeof ENFOQUES_DETALLE;

/** Opciones ordenadas para el selector del front */
export const ENFOQUES_OPTIONS: EnfoqueKey[] =
  Object.keys(ENFOQUES_DETALLE) as EnfoqueKey[];

/* ==================== Helpers de normalización/búsqueda ==================== */

const strip = (s: string) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/**
 * Empareja un nombre “libre” (p.ej. "Enfoque inclusivo") con la clave oficial
 * (p.ej. "Enfoque inclusivo o de atención a la diversidad").
 */
export function findEnfoqueKey(input: string): EnfoqueKey | null {
  const q = strip(input);
  if (!q) return null;

  // 1) Coincidencia exacta normalizada
  for (const key of ENFOQUES_OPTIONS) {
    if (strip(key) === q) return key;
  }
  // 2) Prefijo / incluye en cualquiera de los dos sentidos
  for (const key of ENFOQUES_OPTIONS) {
    const k = strip(key);
    if (k.startsWith(q) || q.startsWith(k) || k.includes(q)) return key;
  }
  return null;
}

/** Devuelve "Nombre: descripción" si existe, o el nombre tal cual si no hay match. */
export function detalleDeEnfoque(input: string): string {
  const key = findEnfoqueKey(input);
  return key ? `${key}: ${ENFOQUES_DETALLE[key]}` : input;
}

/** Convierte una lista libre a la lista oficial (sin duplicados, preservando orden de entrada). */
export function mapToOfficialEnfoques(nombres: string[]): EnfoqueKey[] {
  const out: EnfoqueKey[] = [];
  const seen = new Set<string>();
  (nombres || []).forEach((n) => {
    const key = findEnfoqueKey(n);
    if (key && !seen.has(key)) {
      seen.add(key);
      out.push(key);
    }
  });
  return out;
}

/**
 * Mantiene compatibilidad con tu código previo:
 * - ciclo: string con los nombres oficiales separados por coma
 * - detallados: array con "Nombre: descripción" por cada enfoque oficial
 */
export function buildCicloYDetalles(nombres: string[]) {
  const oficiales = mapToOfficialEnfoques(nombres || []);
  const ciclo = oficiales.join(", ");
  const detallados = oficiales.map((k) => `${k}: ${ENFOQUES_DETALLE[k]}`);
  return { ciclo, detallados };
}
