// ===== SOLO INICIAL =====
export type Nivel = "Inicial";

// Usa SIEMPRE la definición del schema (evita duplicar tipos)
export type { InicialRequest } from "./schema";

// --------- Tipos de SALIDA (lo que puede devolver la IA) ---------

export interface MomentoActividad {
  titulo?: string;
  pasos?: string[]; // bullets
}

export interface Momento {
  tiempoMin?: number;
  estrategias?: string[];            // arrays
  actividades?: MomentoActividad[];  // arrays
  materiales?: string[];             // arrays
}

// Datos informativos producidos por la IA (flexibles)
export interface DatosInformativos {
  nivel?: Nivel;                     // el server puede fijarlo a "Inicial"
  valor?: string;
  ciclo?: string;

  grado?: "3 años" | "4 años" | "5 años";
  bimestre?: string;
  experiencia?: string;
  fecha?: string;
  numeroSesion?: number;
  docente?: string;

  area?: string;                     // libre
  competencia?: string;
  capacidades?: string[];            // arrays
  enfoquesTransversales?: string[];  // arrays
  acciones?: string[];               // arrays
}

export interface FilaSecuencia {
  area?: string;
  tituloSesion?: string;

  propositoAprendizaje?: string;

  // la IA a veces manda 'desempenos' (array) o 'desempenosPrecisados' (string/array)
  desempenos?: string[];
  desempenosPrecisados?: string | string[];

  momentos?: {
    inicio?: Momento;
    desarrollo?: Momento;
    cierre?: Momento;
  };

  recursosDidacticos?: string[];

  criteriosEvaluacion?: string[];     // arrays
  instrumento?: string | string[];    // string o array
  evidenciaAprendizaje?: string[];    // arrays

  enfoquesTransversalesDetallados?: string[];
  accionesObservables?: string[];
}

export interface SesionAprendizaje {
  datos?: DatosInformativos;
  filas?: FilaSecuencia[];            // normalmente 1
  referencias?: { fuente: string; pagina?: string }[];
  bloqueos?: string[];
  versionPlantilla?: "original" | "shikyoued";
}
