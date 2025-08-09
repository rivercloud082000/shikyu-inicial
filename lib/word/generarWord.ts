import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

// Función que transforma arrays en listas con viñetas o texto plano
const transformarArraysAListas = (json: any): any => {
  const fila = json.filas?.[0] || {}; // Extraemos la primera fila de datos

  // Campos que deben ser transformados a listas con viñetas
  const camposComoLista = [
    "capacidades",
    "recursosDidacticos",
    "criteriosEvaluacion",
    "instrumento",
  ];

  // Creamos una nueva fila a partir de los datos existentes
  const nuevaFila = { ...fila };

  // Reemplazamos los campos que deben ser listas
  for (const campo of camposComoLista) {
    const valor = fila[campo];
    if (Array.isArray(valor) && valor.length > 0) {
      // Convertimos los arrays a una lista con viñetas
      nuevaFila[campo] = valor.map((item: string) => `• ${item}`).join("\n");
    } else if (typeof valor === "string" && valor.trim()) {
      // Si el valor es una cadena, lo convertimos a formato de viñeta
      nuevaFila[campo] = `• ${valor}`;
    } else {
      // Si no hay valores, asignamos "• No especificado"
      nuevaFila[campo] = "• No especificado";
    }
  }

  return { ...json.datos, ...nuevaFila }; // Retornamos los datos combinados y transformados
};

// Función para limpiar los caracteres especiales y asegurar que los saltos de línea sean correctos
const sanitizeData = (input: any): any => {
  if (Array.isArray(input)) return input.map(sanitizeData);
  if (typeof input === "object" && input !== null) {
    const sanitized: Record<string, any> = {};
    for (const key in input) {
      sanitized[key] = sanitizeData(input[key]);
    }
    return sanitized;
  }
  if (typeof input === "string") {
    return input
      .replace(/{/g, "«")  // Reemplaza las llaves para evitar conflictos
      .replace(/}/g, "»")  // Reemplaza las llaves para evitar conflictos
      .trim();
  }
  return input;
};

// Función principal para generar el documento Word desde la plantilla
export function generarWordDesdePlantilla(json: any): Buffer {
  // Ruta a la plantilla DOCX
  const plantillaPath = path.join(process.cwd(), "public", "plantilla-sesion.docx");

  // Verificamos si la plantilla existe
  if (!fs.existsSync(plantillaPath)) {
    throw new Error(`⚠️ Plantilla no encontrada en: ${plantillaPath}`);
  }

  try {
    // Leemos la plantilla en formato binario
    const content = fs.readFileSync(plantillaPath, "binary");
    const zip = new PizZip(content); // Comprimimos la plantilla en formato ZIP
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

    // Transformamos y sanitizamos los datos antes de pasarlos a la plantilla
    const datosCombinados = transformarArraysAListas(json);
    const data = sanitizeData(datosCombinados); // Limpieza de datos

    console.log("📝 Datos a renderizar:", JSON.stringify(data, null, 2)); // Log para depuración

    // Rendeizamos el documento con los datos
    doc.render(data);

    // Generamos y devolvemos el archivo Word
    return doc.getZip().generate({ type: "nodebuffer" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("🛑 ERROR AL GENERAR WORD:");
      console.error(error.message);  // Mostrar error principal
      throw new Error("❌ Error generando el documento. Verifica la plantilla y los datos.");
    }
    throw new Error("❌ Error desconocido durante el proceso de generación.");
  }
}
