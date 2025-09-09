// scripts/make-markers.js
const fs = require("fs");
const path = require("path");

const inPath = path.resolve(process.cwd(), "out-session.json");
const outPath = path.resolve(process.cwd(), "markers.json");

// Helpers de formato
const bullet = (s) => `• ${s}`;
const bullets = (arr) =>
  Array.isArray(arr) && arr.length ? arr.map(bullet).join("\n") : "";
const lines = (arr) =>
  Array.isArray(arr) && arr.length ? arr.join("\n") : "";

function formatMoment(m) {
  if (!m) return "";
  const out = [];
  if (Array.isArray(m.estrategias)) for (const e of m.estrategias) out.push(bullet(e));
  if (Array.isArray(m.actividades)) {
    for (const act of m.actividades) {
      if (act.titulo) out.push(`${act.titulo}`);
      if (Array.isArray(act.pasos)) for (const p of act.pasos) out.push(`  ${bullet(p)}`);
    }
  }
  return out.join("\n");
}

function parseJsonLoose(txt) {
  const trimmed = (txt || "").trim();
  if (!trimmed) throw new Error("Archivo vacío: out-session.json");
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No se encontró un objeto JSON en out-session.json");
  }
  const slice = trimmed.slice(start, end + 1);
  return JSON.parse(slice);
}

(function main() {
  if (!fs.existsSync(inPath)) {
    console.error("❌ No encuentro out-session.json. Primero llama a /api/generar.");
    process.exit(1);
  }
  let rawText = fs.readFileSync(inPath, "utf8");
  let raw;
  try {
    raw = parseJsonLoose(rawText);
  } catch (e) {
    console.error("❌ No pude parsear JSON. Detalle:", e.message);
    process.exit(1);
  }

  if (!raw?.success || !raw?.data) {
    console.error("❌ Respuesta inválida en out-session.json:", raw);
    process.exit(1);
  }

  const doc = raw.data;
  const d = doc?.datos || {};
  const f = (doc?.filas && doc.filas[0]) || {};

  const markers = {
    // Encabezado
    tituloSesion: f.tituloSesion || "SESIÓN DE APRENDIZAJE",
    grado: d.grado || "",
    bimestre: d.bimestre || "",
    area: d.area || "Matemáticas",
    experiencia: d.experiencia || "",
    docente: d.docente || "",
    fecha: d.fecha || "",
    sesionN: d.numeroSesion != null ? String(d.numeroSesion) : "",

    // Tabla II
    competencia: d.competencia || "",
    capacidades: bullets(d.capacidades),
    desempenos: f.desempenosPrecisados || "",
    evidenciaAprendizaje: bullets(f.evidenciaAprendizaje),
    criteriosEvaluacion: bullets(f.criteriosEvaluacion),
    instrumento: f.instrumento || "Evaluación cualitativa-Cuantitativa",

    // Enfoques / Valor / Acciones
    enfoquesTransversales: d.ciclo || "",
    valor: d.valor || "",
    acciones: bullets(f.accionesObservables),

    // Momentos y Materiales
    inicio: formatMoment(f?.momentos?.inicio),
    inicioM: lines(f?.momentos?.inicio?.materiales),

    desarrollo: formatMoment(f?.momentos?.desarrollo),
    desarrolloM: lines(f?.momentos?.desarrollo?.materiales),

    cierre: formatMoment(f?.momentos?.cierre),
    cierreM: lines(f?.momentos?.cierre?.materiales),
  };

  fs.writeFileSync(outPath, JSON.stringify(markers, null, 2), "utf8");
  console.log("✅ Marcadores generados →", outPath);
})();
