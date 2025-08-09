"use client";

import { useState, useEffect } from "react";
import { COMPETENCIAS_CAPACIDADES } from "../../lib/competencias-capacidades";

export default function AppPage() {
  const [formulario, setFormulario] = useState({
    tituloSesion: "",
    unidad: "",
    grado: "",
    nivel: "",
    bimestre: "",
    fecha: "",
    docente: "",
    area: "",
    competencia: "",
    capacidades: [] as string[],
    provider: "cohere",
  });

  const [competenciasDisponibles, setCompetenciasDisponibles] = useState<string[]>([]);
  const [capacidadesDisponibles, setCapacidadesDisponibles] = useState<string[]>([]);
  const [jsonGenerado, setJsonGenerado] = useState<any>(null);
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (formulario.area) {
      const comps = Object.keys(COMPETENCIAS_CAPACIDADES[formulario.area] || {});
      setCompetenciasDisponibles(comps);
      setFormulario((prev) => ({ ...prev, competencia: comps[0] || "", capacidades: [] }));
    }
  }, [formulario.area]);

  useEffect(() => {
    if (formulario.area && formulario.competencia) {
      const caps = COMPETENCIAS_CAPACIDADES[formulario.area]?.[formulario.competencia] || [];
      setCapacidadesDisponibles(caps);
    }
  }, [formulario.competencia]);

  const fetchWithTimeout = async (url: string, options: any, timeout = 60000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setJsonGenerado(null);

    try {
      const res = await fetchWithTimeout("/api/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datos: formulario, provider: formulario.provider }),
      }, 60000);

      const rawText = await res.text();

      if (!rawText.trim()) throw new Error("Respuesta vacía del servidor");
      if (rawText.length > 10_000_000) throw new Error("Respuesta demasiado grande");

      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            data = JSON.parse(match[0]);
          } catch {
            throw new Error("Error al parsear JSON parcial");
          }
        } else {
          throw new Error("La respuesta no contiene JSON válido");
        }
      }

      if (!data.success && !data.data) {
        throw new Error(data.error || "Error inesperado del servidor");
      }

      setJsonGenerado(data.data || data.resultado);
    } catch (err: any) {
      setError("Error crítico: " + err.message);
      console.error("❌ Error crítico en handleSubmit:", err);
    }
  };

  const descargarWord = async () => {
    if (!jsonGenerado) return;
    setDescargando(true);

    try {
      const res = await fetch("/api/exportarWord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonGenerado),
      });

      if (!res.ok) throw new Error("Error al generar el Word");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sesion.docx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al descargar Word", err);
    } finally {
      setDescargando(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center p-6"
      style={{ backgroundImage: "url('/giffy5.gif')" }}
    >
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-md p-6 rounded">
        <h1 className="text-2xl font-bold mb-4">Generador de Sesiones de Aprendizaje</h1>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 shadow rounded">
          <input className="border p-2 w-full" placeholder="Título de la sesión" required
            value={formulario.tituloSesion}
            onChange={(e) => setFormulario({ ...formulario, tituloSesion: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <input className="border p-2" placeholder="Unidad (ej: Unidad 1)" required
              value={formulario.unidad}
              onChange={(e) => setFormulario({ ...formulario, unidad: e.target.value })}
            />
            <input className="border p-2" placeholder="Grado (ej: 5to)" required
              value={formulario.grado}
              onChange={(e) => setFormulario({ ...formulario, grado: e.target.value })}
            />
            <select className="border p-2" required
              value={formulario.nivel}
              onChange={(e) => setFormulario({ ...formulario, nivel: e.target.value })}
            >
              <option value="">Selecciona un nivel</option>
              <option value="Inicial">Inicial</option>
              <option value="Primaria">Primaria</option>
              <option value="Secundaria">Secundaria</option>
            </select>
            <input className="border p-2" placeholder="Bimestre (ej: I)" required
              value={formulario.bimestre}
              onChange={(e) => setFormulario({ ...formulario, bimestre: e.target.value })}
            />
            <input className="border p-2" placeholder="Fecha (ej: 07/08/2025)" required
              value={formulario.fecha}
              onChange={(e) => setFormulario({ ...formulario, fecha: e.target.value })}
            />
            <input className="border p-2" placeholder="Docente (ej: José Valverde)" required
              value={formulario.docente}
              onChange={(e) => setFormulario({ ...formulario, docente: e.target.value })}
            />
          </div>

          <select className="border p-2 w-full" required
            value={formulario.area}
            onChange={(e) => setFormulario({ ...formulario, area: e.target.value })}
          >
            <option value="">Selecciona un área</option>
            {Object.keys(COMPETENCIAS_CAPACIDADES).map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <select className="border p-2 w-full" required
            value={formulario.competencia}
            onChange={(e) => setFormulario({ ...formulario, competencia: e.target.value })}
          >
            <option value="">Selecciona una competencia</option>
            {competenciasDisponibles.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <div>
            <label className="font-semibold">Capacidades (opcional):</label>
            <div className="grid grid-cols-1 md:grid-cols-2">
              {capacidadesDisponibles.map((cap) => (
                <label key={cap} className="text-sm">
                  <input
                    type="checkbox"
                    checked={formulario.capacidades.includes(cap)}
                    onChange={(e) => {
                      setFormulario((prev) => ({
                        ...prev,
                        capacidades: e.target.checked
                          ? [...prev.capacidades, cap]
                          : prev.capacidades.filter((c) => c !== cap),
                      }));
                    }}
                  />{" "}
                  {cap}
                </label>
              ))}
            </div>
          </div>

          <select className="border p-2 w-full"
            value={formulario.provider}
            onChange={(e) => setFormulario({ ...formulario, provider: e.target.value })}
          >
            <option value="cohere">Cohere</option>
            <option value="ollama-mistral">Mistral</option>
          </select>

          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" type="submit">
            Generar sesión
          </button>
        </form>

        {error && <p className="text-red-600 mt-4">{error}</p>}

        {jsonGenerado && (
          <div className="mt-6 bg-gray-100 p-4 rounded shadow space-y-2">
            <h3 className="text-lg font-bold">JSON generado</h3>
            <pre className="text-xs overflow-auto max-h-96 bg-white p-2 border">
              {JSON.stringify(jsonGenerado, null, 2)}
            </pre>

            <p className="text-sm text-gray-600">Nivel inferido: {jsonGenerado.datos?.nivel}</p>
            <p className="text-sm text-gray-600">Ciclo inferido: {jsonGenerado.datos?.ciclo}</p>

            <button
              onClick={descargarWord}
              disabled={descargando}
              className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {descargando ? "Descargando..." : "Descargar Word"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
