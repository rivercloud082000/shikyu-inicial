import { NextRequest, NextResponse } from "next/server";
import { Packer, Document, Paragraph, TextRun } from "docx";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const { data } = await req.json();

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun({ text: "Sesión de Aprendizaje", bold: true, size: 32 })],
            alignment: "center",
          }),
          new Paragraph(""),
          new Paragraph(`Área: ${data.area}`),
          new Paragraph(`Nivel: ${data.nivel}`),
          new Paragraph(`Grado: ${data.grado}`),
          new Paragraph(`Fecha: ${data.fecha}`),
          new Paragraph(`Título: ${data.tituloSesion}`),
          new Paragraph(`Propósito del aprendizaje: ${data.propositoAprendizaje}`),
          new Paragraph(`Desempeños: ${data.desempenosPrecisados}`),
          new Paragraph(`Secuencia Didáctica: ${data.secuenciaDidactica}`),
          new Paragraph(`Recursos Didácticos:`),
          ...data.recursosDidacticos.map((r: string) => new Paragraph(`• ${r}`)),
          new Paragraph(`Criterios de Evaluación:`),
          ...data.criteriosEvaluacion.map((c: string) => new Paragraph(`• ${c}`)),
          new Paragraph(`Instrumento:`),
          ...data.instrumento.map((i: string) => new Paragraph(`• ${i}`)),
          new Paragraph(`Evidencia de aprendizaje: ${data.evidenciaAprendizaje}`),
          new Paragraph("Referencias:"),
          ...data.referencias.map((ref: any) => new Paragraph(`• ${ref.fuente} - ${ref.pagina}`)),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": 'attachment; filename="sesion-aprendizaje.docx"',
    },
  });
}
