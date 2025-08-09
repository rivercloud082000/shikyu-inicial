export type CompetenciasCapacidades = {
  [area: string]: {
    [competencia: string]: string[];
  };
};

export const COMPETENCIAS_CAPACIDADES: CompetenciasCapacidades = {
  "Matemática": {
    "Resuelve problemas de cantidad": [
      "Traduce cantidades a expresiones numéricas",
      "Comunica su comprensión sobre los números y las operaciones",
      "Usa estrategias y procedimientos de estimación y cálculo",
      "Argumenta afirmaciones sobre las relaciones numéricas y las operaciones"
    ],
    "Resuelve problemas de regularidad, equivalencia y cambio": [
      "Traduce datos y condiciones a expresiones algebraicas y gráficas",
      "Comunica su comprensión sobre las relaciones algebraicas",
      "Usa estrategias y procedimientos para encontrar equivalencias y reglas generales",
      "Argumenta afirmaciones sobre relaciones de cambio y equivalencia"
    ],
    "Resuelve problemas de forma, movimiento y localización": [
      "Modela objetos con formas geométricas y sus transformaciones",
      "Comunica su comprensión sobre las formas y relaciones geométricas",
      "Usa estrategias y procedimientos para orientarse en el espacio",
      "Argumenta afirmaciones sobre relaciones geométricas"
    ],
    "Resuelve problemas de gestión de datos e incertidumbre": [
      "Representa datos con gráficos y medidas estadísticas",
      "Comunica la comprensión de las estadísticas y probabilidades",
      "Usa estrategias y procedimientos para recopilar datos",
      "Sustenta conclusiones o decisiones en base a información obtenida"
    ]
    },

    "Comunicación": {
    "Se comunica oralmente en su lengua materna": [
      "Obtiene información del texto oral",
      "Infiere e interpreta información del texto oral",
      "Adecua, organiza y desarrolla las ideas de forma coherente y cohesionada",
      "Utiliza recursos no verbales y paraverbales de forma estratégica",
      "Interactúa estratégicamente con distintos interlocutores",
      "Reflexiona y evalúa la forma, el contenido y contexto del texto oral"
    ],
    "Lee diversos tipos de textos escritos": [
      "Obtiene información del texto escrito",
      "Infiere e interpreta información del texto escrito",
      "Reflexiona y evalúa la forma y el contenido del texto escrito"
    ],
    "Escribe diversos tipos de textos": [
      "Adecua el texto a la situación comunicativa",
      "Organiza y desarrolla las ideas de forma coherente y cohesionada",
      "Utiliza convenciones del lenguaje escrito pertinentes",
      "Reflexiona y evalúa la forma, contenido y contexto del texto escrito"
    ]
  },
  "Ciencia y Tecnología": {
    "Indaga mediante métodos científicos para construir sus conocimientos": [
      "Problematiza situaciones para hacer indagación",
      "Diseña estrategias para hacer indagaciones",
      "Genera y registra datos e información",
      "Analiza datos e información",
      "Evalúa y comunica el proceso y resultado de su indagación"
    ],
    "Explica el mundo físico basándose en conocimientos": [
      "Comprende y usa conocimientos sobre los seres vivos, la materia y la energía",
      "Evalúa las implicancias del saber y del quehacer científico"
    ],
    "Diseña y construye soluciones tecnológicas para resolver problemas": [
      "Delimita una alternativa de solución tecnológica",
      "Diseña la alternativa de solución tecnológica",
      "Implementa y valida la alternativa de solución",
      "Evalúa y comunica el funcionamiento de la alternativa de la solución tecnológica"
    ]
  },
  "Educación Física": {
    "Se desenvuelve de manera autónoma a través de su motricidad": [
      "Comprende su cuerpo",
      "Se expresa corporalmente"
    ],
    "Asume una vida saludable": [
      "Comprende las relaciones entre la actividad física, alimentación, postura e higiene corporal y la salud",
      "Incorpora prácticas que mejoran su calidad de vida"
    ],
    "Interactúa a través de sus habilidades sociomotrices": [
      "Se relaciona utilizando sus habilidades sociomotrices",
      "Crea y aplica estrategias y tácticas de juego"
    ]
  },
  "Inglés": {
    "Se comunica oralmente en inglés": [
      "Obtiene información del texto oral en inglés",
      "Infiere e interpreta información del texto oral en inglés",
      "Adecua, organiza y desarrolla el texto en inglés",
      "Utiliza recursos no verbales y paraverbales de forma estratégica",
      "Interactúa estratégicamente en inglés con distintos interlocutores",
      "Reflexiona y evalúa la forma, el contenido y contexto del texto oral en inglés"
    ],
    "Lee diversos tipos de textos en inglés": [
      "Obtiene información del texto escrito en inglés",
      "Infiere e interpreta información del texto en inglés",
      "Reflexiona y evalúa la forma del contenido del texto en inglés"
    ],
    "Escribe en inglés diversos tipos de textos": [
      "Adecua el texto en inglés a la situación comunicativa",
      "Organiza y desarrolla las ideas en inglés de forma coherente y cohesionada",
      "Utiliza convenciones del lenguaje escrito en inglés de forma pertinente",
      "Reflexiona y evalúa la forma, el contenido, el contexto del texto escrito en inglés"
    ]
  },
  "Desarrollo Personal, Ciudadanía y Cívica": {
    "Convive y participa democráticamente en la búsqueda del bien común": [
      "Interactúa con todas las personas",
      "Construye normas y asume acuerdos y leyes",
      "Maneja conflictos de manera constructiva",
      "Delibera sobre asuntos públicos",
      "Participa en acciones que promueven el bienestar común"
    ],
    "Construye su identidad": [
      "Se valora a sí mismo",
      "Autorregula sus emociones",
      "Reflexiona y argumenta éticamente",
      "Vive su sexualidad de manera integral y responsable de acuerdo a su etapa de desarrollo y madurez"
    ]
  },
  "Ciencias Sociales": {
    "Construye interpretaciones históricas": [
      "Interpreta críticamente fuentes diversas",
      "Comprende el tiempo histórico",
      "Elabora explicaciones sobre procesos históricos"
    ],
    "Gestiona responsablemente el espacio y el ambiente": [
      "Comprende las relaciones entre los elementos naturales y sociales",
      "Maneja fuentes de información para comprender el espacio geográfico y el ambiente",
      "Genera acciones para conservar el ambiente local y global"
    ]
  },
  "Educación para el Trabajo": {
    "Desarrollo de aplicaciones y proyectos digitales": [],
    "Pensamiento computacional y resolución de problemas": [],
    "Diseño y programación de robots": []
  },
  "Religión": {
    "Construye su identidad como persona humana, amada por Dios, digna, libre y trascendente, comprendiendo la doctrina de su propia religión, abierto al diálogo con las que son más cercanas": [
      "Conoce a Dios y asume su identidad religiosa y espiritual como persona digna, libre y trascendente",
      "Cultiva y valora las manifestaciones religiosas de su entorno argumentando su fe de manera comprensible y respetuosa"
    ],
    "Asume la experiencia del encuentro personal y comunitario con Dios en su proyecto de vida en coherencia con su creencia religiosa": [
      "Transforma su entorno desde el encuentro personal y comunitario con Dios y desde la fe que profesa",
      "Actúa coherentemente en razón de su fe según los principios de su conciencia moral en situaciones concretas de la vida"
    ]
  }
};
  
export const AREAS = Object.keys(COMPETENCIAS_CAPACIDADES);


