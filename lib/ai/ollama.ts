export async function generateSessionPlan(data: any) {
  const res = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistral",
      prompt: `
Eres un docente experto en educación secundaria. Con base en los siguientes datos:

Nivel: ${data.nivel}
Grado: ${data.grado}
Unidad: ${data.unidad}
Sesión: ${data.sesion}
Fecha: ${data.fecha}
Docente: ${data.docente}
Área: ${data.area}
Competencia: ${data.competencia}
Capacidades: ${data.capacidades}

Genera una sesión de aprendizaje en formato JSON con:

- Título
- Propósito
- Secuencia didáctica (INICIO, DESARROLLO, CIERRE)
- Actividades por momento
- Recursos
- Instrumentos de evaluación

El resultado debe ser un objeto JSON válido. No devuelvas nada más.
`,
      stream: false,
    }),
  });

  const json = await res.json();
  return json;
}
