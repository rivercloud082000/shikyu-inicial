// Listado de valores (select único)
export const VALORES = [
  "Respeto",
  "Responsabilidad",
  "Honestidad",
  "Solidaridad",
  "Justicia",
  "Empatía",
  "Autonomía",
  "Perseverancia",
  "Cooperación",
  "Tolerancia",
] as const;

// Enfoques (nombres)
export const ENFOQUES_TRANSVERSALES = [
  "Enfoque de derechos",
  "Enfoque inclusivo o de atención a la diversidad",
  "Enfoque intercultural",
  "Enfoque de igualdad de género",
  "Enfoque ambiental",
  "Enfoque de orientación al bien común",
  "Enfoque de búsqueda de la excelencia",
] as const;

// Enfoques con mini-concepto
export const ENFOQUES_TRANSVERSALES_DETALLE = [
  {
    nombre: "Enfoque de derechos",
    descripcion:
      "Reconocer y ejercer derechos y deberes; convivencia democrática y respeto a la dignidad.",
  },
  {
    nombre: "Enfoque inclusivo o de atención a la diversidad",
    descripcion:
      "Garantiza participación y aprendizaje de todos con adaptaciones culturales, lingüísticas, físicas o cognitivas.",
  },
  {
    nombre: "Enfoque intercultural",
    descripcion:
      "Valora la diversidad cultural (saberes, lenguas, tradiciones) para fortalecer la identidad.",
  },
  {
    nombre: "Enfoque de igualdad de género",
    descripcion:
      "Elimina estereotipos de género; niñas y niños participan en roles diversos sin distinción.",
  },
  {
    nombre: "Enfoque ambiental",
    descripcion:
      "Promueve conciencia ecológica y prácticas sostenibles (reciclaje, huerto, cuidado del entorno).",
  },
  {
    nombre: "Enfoque de orientación al bien común",
    descripcion:
      "Fomenta solidaridad, empatía y responsabilidad colectiva; trabajo en equipo y cuidado de espacios.",
  },
  {
    nombre: "Enfoque de búsqueda de la excelencia",
    descripcion:
      "Motiva el esfuerzo, la mejora continua y la valoración del progreso.",
  },
] as const;
