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
      "Planifica y lleva a cabo acciones para encontrar la solución a problemas de cantidad",
      "identifica situaciones cotidianas que involucran cantidades y transformarlas en expresiones matemáticas sencillas",
      "Expresa sus comprensiones y estrategias matemáticas de diversas maneras"
    ],
    
    "Resuelve problemas de forma, movimiento y localización": [
      "Modela objetos con formas geométricas y sus transformaciones",
      "Comunica su comprensión sobre las formas y relaciones geométricas",
      "Usa estrategias y procedimientos para orientarse en el espacio",
      
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
    ]
  },
  "Psicomotriz": {
    "Se desenvuelve de manera autónoma a través de su motricidad": [
      "Comprende su cuerpo",
      "Se expresa corporalmente"
    ],
    "Asume una vida saludable": [
      "Practica hábitos básicos de higiene personal de manera autónoma y placentera",
      "Incorpora alimentos saludables en su dieta diaria y reconoce la importancia de la hidratación"
    ],
    "Interactúa a través de sus habilidades sociomotrices": [
      "Se relaciona utilizando sus habilidades sociomotrices",
      "Realiza movimientos corporales variados y disfruta de la actividad física como parte de su bienestar"
    ]
  },
  "Inglés": {
    "Se comunica oralmente en inglés": [
      "Reconoce vocabulario básico relacionado con su entorno inmediato",
      "Reconoce vocabulario relacionado con rutinas diarias y miembros de la familia",
      "Nombra objetos, colores y números en inglés",
      "Responde a preguntas sencillas",
      "Se familiarizan con canciones y rimas tradicionales en inglés",
      "Identifica algunos símbolos culturales básicos (banderas, personajes de cuentos populares)",
      "participa activamente en interacciones orales sencillas en inglés",
      "Responde a preguntas muy sencillas con una o dos palabras",
      "Nombra más vocabulario relacionado con la familia, la ropa y los alimentos",
    ]
  },
  
  "Personal Social": {
    "Construye su propia identidad": [
      "Se valora asi mismo",
      "Autoregula sus emociones",
       
    ],
    "Convive y participa democráticamente en la búsqueda del bien común": [
      "Interactúa con todas las personas",
      "Construye normas, asume acuerdos y leyes",
      "Participa en acciones que promueven el bienestar común"
    ],

    "Construye su identidad como persona humana amada por Dios, digna, libre y trascendente.Comprendiendo la doctrina de su propia religión abierto al diálogo con las que son cercanas": [
      "Conoce a Dios y asume su identidad religiosa y espiritual como persona digna, libre y trascendente",
      "Cultiva y valora las manifestaciones religiosas de su entorno argumentando su fe de manera comprensible y respetuosa"


      
    ]
  },
  "Educación para el Trabajo": {
    "Alfabetización Digital Básica": [
      "Explora y manipula objetos tecnológicos simples, descubriendo sus propiedades y funcionalidades básicas",
      "Identifica secuencias simples de acciones para lograr un objetivo con objetos tecnológicos",
      "Construye y ensambla estructuras simples utilizando bloques u otros materiales de construcción con intenciones lógicas"
    ],
    "Creación y Comunicación Digital Sencilla": [
      "Utiliza vocabulario básico relacionado con la tecnología y la construcción en sus exploraciones",
      "Resuelve problemas sencillos que involucran la manipulación de objetos tecnológicos o la construcción"
    ],
    "Pensamiento Computacional y Resolución de Problemas": [
      "Fomento del trabajo en equipo y la comunicación",
      "participa activamente en la planificación y construcción grupal, proponiendo ideas, escuchando a los demás y negociando el uso de materiales",
      " Identifica algunas partes de los objetos tecnológicos simples y relaciona sus acciones con los resultados"
    ]
  },
  "Religión": {
    "Construye su identidad como persona humana, amada por Dios, digna, libre y trascendente, comprendiendo la doctrina de su propia religión, abierto al diálogo con las que son más cercanas": [
      "Descubre con asombro el amor de Dios presente en la creación",
      "Reconoce y expresa sus sentimientos religiosos a través de diversas manifestaciones",
      "Participa con alegría en prácticas religiosas sencillas de su entorno familiar y comunitario"
    ],
    "Asume la experiencia del encuentro personal y comunitario con Dios en su proyecto de vida en coherencia con su creencia religiosa": [
      "Escucha con atención relatos bíblicos sencillos y reconoce personajes importantes",
      "Desarrolla actitudes de respeto, amor y colaboración con los demás",
      "Transforma su entorno desde el  encuentro personal y comunitario con Dios desde la fe que profesa",
      "Explora diferentes símbolos y expresiones religiosas presentes en su cultura"
    ]
  },
  "Arte y Cultura":{
    "APRECIA DE MANERA CRÍTICA MANIFESTACIONES ARTÍSTICOS-CULTURALES.": [
      "Percibe manifestaciones artístico-culturales",
      "Contextualiza las manifestaciones artístico-culturales",
      "Reflexiona creativa y críticamente",
      "Discrimina sonidos fuertes y suaves, agudos y graves"
    ],
    "Música y Dibujo": [
      "Desarrolla el sentido rítmico y la psicomotricidad",
      "Desarrolla  la empatía, la comunicación, la expresión",
      "Desarrolla la creatividad, la imaginación y la coordinación motora"
    ],
    "Crea proyectos desde los lenguajes artísticos":[
      "Explora y experimenta los lenguajes del arte",
      "Aplica procesos creativos",
      "Desarrolla la escucha activa y la comprensión de los elementos básicos de la música"
    ]
  }
};
// Normalizador simple
function norm(s?: string) {
  return (s ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();
}

type Hints = {
  capacidades?: string[]; // capacidades seleccionadas en la UI (opcional)
  tema?: string;          // tema ingresado en la UI (opcional)
};

export function getCompetenciaYCapacidades(
  areaIn: string,
  compIn?: string,
  hints?: Hints
) {
  const areaKey = Object.keys(COMPETENCIAS_CAPACIDADES)
    .find(k => norm(k) === norm(areaIn));
  const areaMap = areaKey ? COMPETENCIAS_CAPACIDADES[areaKey] : undefined;
  if (!areaMap) return { areaKey: undefined as string | undefined, compKey: undefined as string | undefined, capacidades: [] as string[] };

  const compKeys = Object.keys(areaMap);

  // 1) Intento exacto
  if (compIn) {
    const exact = compKeys.find(k => norm(k) === norm(compIn));
    if (exact) return { areaKey, compKey: exact, capacidades: areaMap[exact] };
  }

  // 2) Intento flexible (prefijo/substring)
  if (compIn) {
    const n = norm(compIn);
    const pref = compKeys.find(k => norm(k).startsWith(n));
    if (pref) return { areaKey, compKey: pref, capacidades: areaMap[pref] };
    const sub = compKeys.find(k => norm(k).includes(n));
    if (sub) return { areaKey, compKey: sub, capacidades: areaMap[sub] };
  }

  // 3) Deducción por capacidades (si la UI envía alguna)
  const hintCaps = (hints?.capacidades ?? []).map(norm).filter(Boolean);
  if (hintCaps.length) {
    let best: { key: string; score: number } | null = null;
    for (const k of compKeys) {
      const caps = (areaMap[k] ?? []).map(norm);
      const score = hintCaps.reduce((acc, c) => acc + (caps.some(x => x.includes(c) || c.includes(x)) ? 1 : 0), 0);
      if (!best || score > best.score) best = { key: k, score };
    }
    if (best && best.score > 0) {
      return { areaKey, compKey: best.key, capacidades: areaMap[best.key] };
    }
  }

  // 4) Heurística por tema (ej. "círculo", "figura", "geométric")
  const tema = norm(hints?.tema);
  if (tema) {
    const geom = /círcul|circul|figura|geometric|forma|movim|ubic|localiz/.test(tema);
    if (geom) {
      const geoKey = compKeys.find(k => /forma|movim|localiz|geomet/i.test(k));
      if (geoKey) return { areaKey, compKey: geoKey, capacidades: areaMap[geoKey] };
    }
  }

  // 5) Fallback: la primera competencia del área
  const first = compKeys[0];
  return { areaKey, compKey: first, capacidades: areaMap[first] };
}
export const AREAS = Object.keys(COMPETENCIAS_CAPACIDADES);


