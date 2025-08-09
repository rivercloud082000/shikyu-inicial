// Registra los paths de TypeScript primero
import 'tsconfig-paths/register';

// Luego las demás importaciones
import { generarWordDesdePlantilla } from '@/lib/word/generarWord';
import fs from "fs";
import path from "path";

const testData = {
  datos: {
    nivel: "SECUNDARIA",
    ciclo: "VI",
    grado: "4to",
    bimestre: "III",
    unidad: "IV",
    fecha: "30/07/2025",
    docente: "Adrian Perez",
    area: "MATEMÁTICA",
    competencia: "Resuelve problemas de cantidad",
    capacidades: ["Traducir cantidades", "Comunicar comprensión"]
  },
  filas: [
    {
      tituloSesion: "Introducción a ecuaciones",
      propositoAprendizaje: "Comprender conceptos básicos",
      desempenosPrecisados: "Identificar variables",
      secuenciaDidactica: "1. Teoría\n2. Ejemplos\n3. Práctica",
      recursosDidacticos: ["Pizarra", "Proyector"],
      criteriosEvaluacion: ["Participación", "Ejercicios resueltos"],
      instrumento: ["Rúbrica"],
      evidenciaAprendizaje: "5 ejercicios resueltos"
    }
  ]
};

async function runTest() {
  try {
    console.log("Iniciando prueba...");
    const buffer = generarWordDesdePlantilla(testData);
    const outputPath = path.join(process.cwd(), "prueba-final.docx");
    fs.writeFileSync(outputPath, buffer);
    
    console.log("✅ Documento generado exitosamente!");
    console.log("Ubicación:", outputPath);
    
    // Verificar contenido
    const fileExists = fs.existsSync(outputPath);
    const fileSize = fs.statSync(outputPath).size;
    
    console.log("Archivo existe:", fileExists);
    console.log("Tamaño del archivo:", fileSize, "bytes");
    
  } catch (error) {
    console.error("❌ Error generando documento:", error);
  }
}

runTest();