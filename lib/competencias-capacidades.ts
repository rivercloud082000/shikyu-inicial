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
// --- Helpers internos ---
function norm(s?: string) {
  return (s ?? "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(s?: string) {
  return norm(s).split(/[^a-z0-9]+/).filter(Boolean);
}

type Hints = {
  capacidades?: string[];
  tema?: string;
};

/**
 * Empareja competencia para CUALQUIER área:
 * - exacto / prefijo / substring
 * - por capacidades (similitud)
 * - por tema (tokens + heurística suave)
 * - si nada, toma la primera del área
 */
export function getCompetenciaYCapacidades(
  areaIn: string,
  compIn?: string,
  hints?: Hints
) {
  const areaKey = Object.keys(COMPETENCIAS_CAPACIDADES).find(k => norm(k) === norm(areaIn));
  const areaMap = areaKey ? COMPETENCIAS_CAPACIDADES[areaKey] : undefined;
  if (!areaMap) return { areaKey: undefined as string | undefined, compKey: undefined as string | undefined, capacidades: [] as string[] };

  const compKeys = Object.keys(areaMap);
  const compInNorm = norm(compIn);
  const temaNorm = norm(hints?.tema);
  const temaToks = new Set(tokens(temaNorm));
  const capsHint = (hints?.capacidades ?? []).map(norm).filter(Boolean);

  // 1) Exacto
  if (compInNorm) {
    const exact = compKeys.find(k => norm(k) === compInNorm);
    if (exact) return { areaKey, compKey: exact, capacidades: areaMap[exact] };
  }
  // 2) Prefijo / Substring
  if (compInNorm) {
    const pref = compKeys.find(k => norm(k).startsWith(compInNorm));
    if (pref) return { areaKey, compKey: pref, capacidades: areaMap[pref] };
    const sub = compKeys.find(k => norm(k).includes(compInNorm));
    if (sub) return { areaKey, compKey: sub, capacidades: areaMap[sub] };
  }

  // 3) Scoring global (capacidades + tema + similitud con compIn)
  let bestKey = "";
  let bestScore = -1;

  for (const k of compKeys) {
    const nk = norm(k);
    let score = 0;

    // similitud con compIn (parcial)
    if (compInNorm) {
      if (nk.includes(compInNorm)) score += 2;
      const overlapComp = tokens(compInNorm).filter(t => nk.includes(t)).length;
      score += overlapComp;
    }

    // similitud por capacidades
    const capsOfK = (areaMap[k] ?? []).map(norm);
    for (const c of capsHint) {
      if (!c) continue;
      if (capsOfK.some(x => x.includes(c) || c.includes(x))) score += 2; // match capacidad → +2
    }

    // similitud por tema (tokens)
    if (temaToks.size) {
      const toksK = new Set(tokens(nk));
      let hits = 0;
      for (const t of temaToks) if (t.length >= 4 && toksK.has(t)) hits++;
      score += hits;
    }

    // Heurística suave por palabras clave del tema (no atada al área)
    if (/(circul|figura|geomet|forma|movim|localiz|ubic)/.test(temaNorm) && /forma|movim|localiz|geomet/.test(nk)) score += 3;
    if (/(leyend|cuento|texto|leer|lectur|escrito)/.test(temaNorm) && /(lee|texto|lectur)/.test(nk)) score += 3;
    if (/(escrib|traza|graf|dictado)/.test(temaNorm) && /(escribe|textos)/.test(nk)) score += 3;
    if (/(oral|habla|expres|escuch)/.test(temaNorm) && /(oral|lengua\s+materna)/.test(nk)) score += 3;
    if (/(indag|experimen|ciencia|tecnolog)/.test(temaNorm) && /(indaga|cient)/.test(nk)) score += 3;
    if (/(motric|psicomotr|movim)/.test(temaNorm) && /(motric|autonoma|sociomotr)/.test(nk)) score += 3;
    if (/(ingles|english)/.test(temaNorm) && /(ingl)/.test(nk)) score += 3;
    if (/(identidad|convive|democra|bien comun|norma)/.test(temaNorm) && /(identidad|convive|democra|bien\s+comun)/.test(nk)) score += 3;
    if (/(relig|dios|biblic)/.test(temaNorm) && /(relig|dios|encuentro)/.test(nk)) score += 3;
    if (/(arte|musica|dibujo|ritmo|crea|proyecto)/.test(temaNorm) && /(aprecia|musica|dibujo|crea|proyectos)/.test(nk)) score += 3;
    if (/(digital|tecnolog|comput|bloques|robot)/.test(temaNorm) && /(alfabet|digital|comput|pensamiento|creacion)/.test(nk)) score += 3;

    if (score > bestScore) { bestScore = score; bestKey = k; }
  }

  if (bestKey) return { areaKey, compKey: bestKey, capacidades: areaMap[bestKey] };

  // 4) Fallback final
  const first = compKeys[0];
  return { areaKey, compKey: first, capacidades: areaMap[first] };
}

export const AREAS = Object.keys(COMPETENCIAS_CAPACIDADES);


