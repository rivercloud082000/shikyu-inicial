// Este archivo contiene TODAS las áreas curriculares del MINEDU con sus competencias y capacidades oficiales
// Se puede ampliar para incluir desempeños en el futuro si deseas hacerlo de forma local

export interface AreaData {
  area: string;
  competencias: {
    nombre: string;
    capacidades: string[];
  }[];
}

export const AREA_INFO: AreaData[] = [
  {
    area: "Matemática",
    competencias: [
      {
        nombre: "Resuelve problemas de cantidad",
        capacidades: [
          "Traduce cantidades a expresiones numéricas",
          "Comunica su comprensión sobre los números y las operaciones",
          "Usa estrategias y procedimientos de estimación y cálculo",
          "Argumenta afirmaciones sobre las relaciones numéricas y las operaciones"
        ]
      },
      {
        nombre: "Resuelve problemas de regularidad, equivalencia y cambio",
        capacidades: [
          "Representa relaciones matemáticas con expresiones algebraicas",
          "Opera con expresiones algebraicas",
          "Usa estrategias para resolver ecuaciones e inecuaciones",
          "Argumenta sobre relaciones y cambios"
        ]
      },
      {
        nombre: "Resuelve problemas de forma, movimiento y localización",
        capacidades: [
          "Representa cuerpos y figuras geométricas",
          "Modela objetos con figuras geométricas y cuerpos",
          "Usa sistemas de coordenadas y ubicación espacial",
          "Argumenta sobre relaciones geométricas"
        ]
      },
      {
        nombre: "Resuelve problemas de gestión de datos e incertidumbre",
        capacidades: [
          "Recoge y representa datos",
          "Analiza e interpreta datos estadísticos",
          "Evalúa la representación de datos y la validez de sus conclusiones",
          "Argumenta sobre la toma de decisiones en situaciones de incertidumbre"
        ]
      }
    ]
  },
  {
    area: "Comunicación",
    competencias: [
      {
        nombre: "Lee diversos tipos de textos escritos en su lengua materna",
        capacidades: [
          "Obtiene información del texto",
          "Infiere e interpreta información",
          "Reflexiona y evalúa la forma, el contenido y el contexto"
        ]
      },
      {
        nombre: "Escribe diversos tipos de textos en su lengua materna",
        capacidades: [
          "Organiza y desarrolla ideas coherentemente",
          "Adecuar el texto a la situación comunicativa",
          "Utiliza convenciones del lenguaje escrito",
          "Reflexiona y evalúa la forma, el contenido y el contexto"
        ]
      },
      {
        nombre: "Se comunica oralmente en su lengua materna",
        capacidades: [
          "Adecuar el discurso a la situación comunicativa",
          "Organiza y desarrolla las ideas",
          "Utiliza recursos no verbales y paraverbales"
        ]
      }
    ]
  },
  {
    area: "Ciencia y Tecnología",
    competencias: [
      {
        nombre: "Indaga mediante métodos científicos para construir conocimientos",
        capacidades: []
      },
      {
        nombre: "Explica el mundo físico basándose en conocimientos sobre los seres vivos, materia y energía, biodiversidad, Tierra y universo",
        capacidades: []
      },
      {
        nombre: "Diseña y construye soluciones tecnológicas para resolver problemas de su entorno",
        capacidades: []
      }
    ]
  },
  {
    area: "Personal Social",
    competencias: [
      {
        nombre: "Construye su identidad",
        capacidades: []
      },
      {
        nombre: "Convive y participa democráticamente en la búsqueda del bien común",
        capacidades: []
      },
      {
        nombre: "Gestiona responsablemente los recursos económicos",
        capacidades: []
      }
    ]
  },
  {
    area: "Educación para el Trabajo",
    competencias: [
      {
        nombre: "Desarrollo de aplicaciones y proyectos digitales",
        capacidades: []
      },
      {
        nombre: "Pensamiento computacional y resolución de problemas",
        capacidades: []
      },
      {
        nombre: "Diseño y programación de robots",
        capacidades: []
      }
    ]
  },
  {
    area: "DPCC",
    competencias: [
      {
        nombre: "Construye su identidad como persona humana, libre y autónoma",
        capacidades: []
      },
      {
        nombre: "Asume responsablemente sus deberes y derechos",
        capacidades: []
      }
    ]
  },
  {
    area: "Educación Física",
    competencias: [
      {
        nombre: "Se desenvuelve de manera autónoma a través de su motricidad",
        capacidades: []
      },
      {
        nombre: "Asume una vida saludable",
        capacidades: []
      },
      {
        nombre: "Se desenvuelve de manera autónoma a través de su motricidad",
        capacidades: []
      }
    ]
  },
  {
    area: "Inglés",
    competencias: [
      {
        nombre: "Interpreta textos orales en inglés",
        capacidades: []
      },
      {
        nombre: "Interpreta textos escritos en inglés",
        capacidades: []
      },
      {
        nombre: "Produce textos orales y escritos en inglés",
        capacidades: []
      }
    ]
  }
];
