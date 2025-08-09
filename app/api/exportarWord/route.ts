import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import PizZip from "pizzip";
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
    const e = error as any;
    return NextResponse.json({ error: e.message, detalle: e }, { status: 500 });
  }

  const buffer = doc.getZip().generate({ type: "nodebuffer" });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": "attachment; filename=sesion-generada.docx",
    },
  });
}
