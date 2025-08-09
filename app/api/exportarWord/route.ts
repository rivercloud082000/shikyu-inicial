// app/api/exportarWord/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import PizZip from "pizzip";              // <-- minúsculas (fix casing)
import Docxtemplater from "docxtemplater";

function transformarAPlano(json: any): Record<string, string> {
  const fila = json.filas?.[0] || {};
  const datos = json.datos || {};

  const listar = (arr: any): string => {
    if (!Array.isArray(arr)) return "";
    return arr.map((item: string) => `• ${item}`).join("\n");
  };

  return {
    tituloSesion: fila.tituloSesion || "",
    nivel: datos.nivel || "",
    ciclo: datos.ciclo || "",
    grado: datos.grado || "",
    bimestre: datos.bimestre || "",
    unidad: datos.unidad || "",
    fecha: datos.fecha || "",
    docente: datos.docente || "",
    area: fila.area || datos.area || "",
    competencia: datos.competencia || "",
    capacidades: listar(datos.capacidades),
    propositoAprendizaje: fila.propositoAprendizaje || "",
    desempenosPrecisados: fila.desempenosPrecisados || "",
    secuenciaDidactica: listar(fila.secuenciaDidactica),
    recursosDidacticos: listar(fila.recursosDidacticos),
    criteriosEvaluacion: listar(fila.criteriosEvaluacion),
    instrumento: listar(fila.instrumento),
    evidenciaAprendizaje: listar(fila.evidenciaAprendizaje),
  };
}

// Buffer (Node) -> ArrayBuffer (DOM) seguro
function bufferToArrayBuffer(buf: Buffer): ArrayBuffer {
  const ab = new ArrayBuffer(buf.length);
  new Uint8Array(ab).set(buf);
  return ab;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const dataPlano = transformarAPlano(body);

  // Leer la plantilla desde /public
  const templatePath = path.resolve("public", "plantilla-sesion.docx");
  const template = fs.readFileSync(templatePath, "binary");

  const zip = new PizZip(template);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.setData(dataPlano);

  try {
    doc.render();
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Error al renderizar DOCX", detalle: error },
      { status: 500 }
    );
  }

  // Generar DOCX como Buffer y convertir a ArrayBuffer
  const buffer: Buffer = doc.getZip().generate({ type: "nodebuffer" });
  const arrayBuffer = bufferToArrayBuffer(buffer);

  const MIME =
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  // Responder con Response(ArrayBuffer) — BodyInit válido en Next 15
  return new Response(arrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": MIME,
      "Content-Disposition": "attachment; filename=sesion-generada.docx",
      "Cache-Control": "no-store",
      // "Content-Length": String(arrayBuffer.byteLength), // opcional
    },
  });
}
