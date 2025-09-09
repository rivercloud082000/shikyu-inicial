import type { SesionAprendizaje, Momento } from "./types";

const bullet = (s: string) => `• ${s}`;
const bullets = (arr?: string[]) =>
  Array.isArray(arr) && arr.length ? arr.map(bullet).join("\n") : "";
const lines = (arr?: string[]) =>
  Array.isArray(arr) && arr.length ? arr.join("\n") : "";

function formatMoment(m?: Momento): string {
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

export function buildMarkersFromSesion(doc: SesionAprendizaje) {
  const d = doc?.datos;
  const f = doc?.filas?.[0];
  return {
    // Encabezado
    tituloSesion: f?.tituloSesion ?? "SESIÓN DE APRENDIZAJE",
    grado: d?.grado ?? "",
    bimestre: d?.bimestre ?? "",
    area: d?.area ?? "Matemáticas",
    experiencia: d?.experiencia ?? "",
    docente: d?.docente ?? "",
    fecha: d?.fecha ?? "",
    sesionN: d?.numeroSesion != null ? String(d.numeroSesion) : "",
    // Tabla II
    competencia: d?.competencia ?? "",
    capacidades: bullets(d?.capacidades),
    desempenos: f?.desempenosPrecisados ?? "",
    evidenciaAprendizaje: bullets(f?.evidenciaAprendizaje),
    criteriosEvaluacion: bullets(f?.criteriosEvaluacion),
    instrumento: f?.instrumento ?? "Evaluación cualitativa-Cuantitativa",
    // Enfoques / Valor / Acciones
    enfoquesTransversales: d?.ciclo ?? "",
    valor: d?.valor ?? "",
    acciones: bullets(f?.accionesObservables),
    // Momentos
    inicio: formatMoment(f?.momentos?.inicio),
    inicioM: lines(f?.momentos?.inicio?.materiales),
    desarrollo: formatMoment(f?.momentos?.desarrollo),
    desarrolloM: lines(f?.momentos?.desarrollo?.materiales),
    cierre: formatMoment(f?.momentos?.cierre),
    cierreM: lines(f?.momentos?.cierre?.materiales),
  };
}
