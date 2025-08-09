export type Nivel = "Inicial" | "Primaria" | "Secundaria";

export interface DatosInformativos {
  nivel: Nivel;
  ciclo?: string;
  grado?: string;
  bimestre?: string;
  unidad?: string;
  fecha?: string;
  docente?: string;
  area: string;
  competencia: string;
  capacidades: string[];
}

export interface FilaSecuencia {
  area: string;
  tituloSesion: string;
  propositoAprendizaje: string;
  desempenosPrecisados: string;
  secuenciaDidactica: string;
  recursosDidacticos: string[];
  criteriosEvaluacion: string[];
  instrumento: string[];
  evidenciaAprendizaje: string;
}

export interface SesionAprendizaje {
  datos: DatosInformativos;
  filas: FilaSecuencia[];
  referencias?: { fuente: string; pagina?: string }[];
  bloqueos?: string[];
  versionPlantilla: "original" | "shikyoued";
}
