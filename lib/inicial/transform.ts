// lib/inicial/transform.ts
import type {
  InicialRequest,
  SesionAprendizaje,
  Momento,
} from "./types";
import {
  enfoquesConDescripcion,
  enfoquesComoTexto,
} from "./helpers";

function ensureMoment(m?: Partial<Momento>): Momento {
  return {
    tiempoMin: m?.tiempoMin ?? undefined,
    estrategias: Array.isArray(m?.estrategias) ? m!.estrategias! : [],
    actividades: Array.isArray(m?.actividades) ? m!.actividades! : [],
    materiales: Array.isArray(m?.materiales) ? m!.materiales! : [],
  };
}

function asStringArray(x: any, fallback: string[] = []): string[] {
  if (Array.isArray(x)) return x.filter(Boolean).map(String);
  if (typeof x === "string") {
    return x
      .split(/[\n,;\u2022\u25AA\u00B7\u25CF|]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return fallback;
}

export function mapInicialToFinal(
  req: InicialRequest,
  raw: any
): SesionAprendizaje {
  // 1) Construir propósito desde acciones (si el modelo no lo trae).
  const acciones = req.accionesObservables ?? [];
  const proposito =
    acciones.length
      ? `Desarrollar la capacidad para ${acciones.join(
          "; "
        )} en relación con el tema, promoviendo actitudes positivas y técnicas adecuadas al nivel.`
      : raw?.secuencia?.proposito ?? "";

  // 2) Enfoques: texto para marcador ({enfoquesTransversales}) + detallados
  const cicloTexto = enfoquesComoTexto(req.enfoquesTransversales || []);
  const enfoquesDet = enfoquesConDescripcion(req.enfoquesTransversales || []);

  // 3) Momentos: tomar del modelo si existe, si no defaults
  const rMom = raw?.secuencia?.momentos ?? {};
  const inicio = ensureMoment(rMom?.inicio);
  const desarrollo = ensureMoment(rMom?.desarrollo);
  const cierre = ensureMoment(rMom?.cierre);

  // 4) Tablas/criterios/evidencias (con defaults razonables)
  const competencia =
    raw?.tablas?.competencia ??
    "Utiliza conceptos matemáticos para interpretar la información.";
  const capacidades =
    asStringArray(raw?.tablas?.capacidades, [
      "Identifica atributos de los objetos (color).",
      "Establece relaciones de semejanza y diferencia.",
    ]);

  const criterios = asStringArray(raw?.secuencia?.criteriosEvaluacion, [
    "Reconoce el color trabajado en objetos del entorno.",
    "Clasifica correctamente por color según consignas.",
    "Participa activamente en actividades grupales e individuales.",
    "Sigue instrucciones simples de 1–2 pasos con apoyo visual.",
  ]);

  const evidencias = asStringArray(raw?.secuencia?.evidenciaAprendizaje, [
    "Socialización oral sobre lo realizado.",
    "Ejecución de fichas de aplicación.",
    "Cuestionario breve (PVA) acorde al nivel.",
  ]);

  // 5) Armar el documento final (tu schema: SesionAprendizaje)
  const doc: SesionAprendizaje = {
    datos: {
      nivel: "Inicial",
      valor: req.valor,               // marcador {valor}
      ciclo: cicloTexto,              // marcador {enfoquesTransversales}
      grado: req.grado,
      bimestre: req.bimestre,
      experiencia: req.experiencia,   // reemplaza "unidad"
      fecha: req.fecha,
      docente: req.docente,
      area: "Matemáticas",            // si tienes el área en UI, cámbialo por ese valor
      competencia,
      capacidades,

      numeroSesion: req.numeroSesion, // ← para {sesionN}
    },
    filas: [
      {
        area: "Matemáticas",
        tituloSesion: raw?.titulo ?? "SESIÓN DE APRENDIZAJE",
        propositoAprendizaje: proposito,
        desempenosPrecisados: raw?.secuencia?.desempeno ?? "",
        momentos: {
          inicio,
          desarrollo,
          cierre,
        },
        criteriosEvaluacion: criterios,
        instrumento:
          raw?.secuencia?.instrumento ?? "Evaluación cualitativa-Cuantitativa",
        evidenciaAprendizaje: evidencias,
        enfoquesTransversalesDetallados: enfoquesDet,
        accionesObservables: acciones,
      },
    ],
    referencias: raw?.referencias ?? [],
    bloqueos: raw?.bloqueos ?? [],
    versionPlantilla: "shikyoued",
  };

  return doc;
}
