"use client";

import { useEffect, useState } from "react";
import LoadingOverlay from "../../components/LoadingOverlay";
import { COMPETENCIAS_CAPACIDADES } from "../../lib/competencias-capacidades";
// Ajusta la ruta si tu proyecto la tiene distinta:
import { VALORES, ENFOQUES_TRANSVERSALES } from "../../lib/inicial/constants";

type FormState = {
  tituloSesion: string;
  tema: string;           // requerido por el backend
  experiencia: string;    // una sola vez
  grado: string;          // "3 años" | "4 años" | "5 años"
  nivel: string;          // fijo "Inicial"
  bimestre: string;
  fecha: string;
  docente: string;
  numeroSesion: string;   // lo convertimos a number al enviar
  area: string;
  competencia: string;
  capacidades: string[];
  valor: string;                 // select (VALORES)
  enfoquesTransversales: string[]; // checkboxes (min 1)
  provider: string;
};

export default function AppPage() {
  const [formulario, setFormulario] = useState<FormState>({
    tituloSesion: "",
    tema: "",
    experiencia: "",
    grado: "",
    nivel: "Inicial",
    bimestre: "",
    fecha: "",
    docente: "",
    numeroSesion: "",
    area: "",
    competencia: "",
    capacidades: [],
    valor: "",
    enfoquesTransversales: [],
    provider: "cohere",
  });

  const [competenciasDisponibles, setCompetenciasDisponibles] = useState<string[]>([]);
  const [capacidadesDisponibles, setCapacidadesDisponibles] = useState<string[]>([]);

  // respuesta y markers para exportar
  const [serverResp, setServerResp] = useState<any>(null);
  const [markers, setMarkers] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState("");

  // ---- dependencias de Área/Competencia
  useEffect(() => {
    if (formulario.area) {
      const comps = Object.keys(COMPETENCIAS_CAPACIDADES[formulario.area] || {});
      setCompetenciasDisponibles(comps);
      setFormulario((prev) => ({ ...prev, competencia: comps[0] || "", capacidades: [] }));
    } else {
      setCompetenciasDisponibles([]);
      setCapacidadesDisponibles([]);
      setFormulario((prev) => ({ ...prev, competencia: "", capacidades: [] }));
    }
  }, [formulario.area]);

  useEffect(() => {
    if (formulario.area && formulario.competencia) {
      const caps = COMPETENCIAS_CAPACIDADES[formulario.area]?.[formulario.competencia] || [];
      setCapacidadesDisponibles(caps);
    } else {
      setCapacidadesDisponibles([]);
      setFormulario((prev) => ({ ...prev, capacidades: [] }));
    }
  }, [formulario.competencia, formulario.area]);

  // ---- util: timeout para fetch
  const fetchWithTimeout = async (url: string, options: any, timeout = 60000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return res;
    } catch (e) {
      clearTimeout(id);
      throw e;
    }
  };

  // ---- submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setServerResp(null);
    setMarkers(null);

    // Validaciones de front:
    if (!formulario.tema.trim()) {
      setError("El tema es obligatorio.");
      return;
    }
    if (!formulario.grado.trim()) {
      setError("El grado es obligatorio (ej: 3 años).");
      return;
    }
    if (!formulario.area.trim()) {
      setError("Selecciona un área.");
      return;
    }
    if (!formulario.valor.trim()) {
      setError("Selecciona un valor.");
      return;
    }
    if (formulario.enfoquesTransversales.length < 1) {
      setError("Selecciona al menos 1 enfoque transversal.");
      return;
    }

    setLoading(true);
    try {
      // Acciones observables: enviamos 2 genéricas para cumplir el esquema.
      // El backend ya las reemplaza por acciones ligadas al tema/área.
      const accionesObservables = ["Escucha con atención", "Participa con orden"];

      const payload = {
        area: formulario.area,
        grado: formulario.grado, // el backend ya normaliza "3/4/5 años"
        tema: formulario.tema,
        docente: formulario.docente || undefined,
        fecha: formulario.fecha || undefined,
        bimestre: formulario.bimestre || undefined,
        numeroSesion: formulario.numeroSesion ? Number(formulario.numeroSesion) : undefined,
        experiencia: formulario.experiencia || undefined,

        valor: formulario.valor,
        enfoquesTransversales: formulario.enfoquesTransversales,
        accionesObservables, // ← IA luego las sustituye

        provider: formulario.provider,
      };

      const res = await fetchWithTimeout(
        "/api/generar",
        {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify(payload),
        },
        120000
      );

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || "Respuesta no JSON");
      }

      if (!res.ok || !data?.success) {
        const detalles =
          data?.issues?.fieldErrors
            ? JSON.stringify(data.issues.fieldErrors, null, 2)
            : data?.error || "Error del servidor";
        throw new Error(`Payload inválido:\n${detalles}`);
      }

      setServerResp(data);
      setMarkers(data.markers);
    } catch (err: any) {
      setError(err.message || "Error inesperado");
      console.error("❌ handleSubmit:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---- exportar Word
  const descargarWord = async () => {
    if (!markers) return;
    setDescargando(true);
    try {
      const res = await fetch("/api/exportarWord", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ markers }),
      });
      if (!res.ok) throw new Error("Error al generar el Word");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Sesion-Inicial.docx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al descargar Word", err);
    } finally {
      setDescargando(false);
    }
  };

  return (
    <>
      <LoadingOverlay show={loading} />

      <div className="min-h-screen bg-cover bg-center p-6" style={{ backgroundImage: "url('/giffy5.gif')" }}>
        <div className="max-w-5xl mx-auto bg-white/80 backdrop-blur-md p-6 rounded">
          <h1 className="text-2xl font-bold mb-4">Generador de Sesiones de Aprendizaje</h1>

          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 shadow rounded">
            {/* Datos generales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="border p-2"
                placeholder="Título de la sesión (opcional)"
                value={formulario.tituloSesion}
                onChange={(e) => setFormulario({ ...formulario, tituloSesion: e.target.value })}
              />
              <input
                className="border p-2"
                placeholder="Tema (requerido)"
                required
                value={formulario.tema}
                onChange={(e) => setFormulario({ ...formulario, tema: e.target.value })}
              />
              <input
                className="border p-2"
                placeholder="Experiencia (opcional)"
                value={formulario.experiencia}
                onChange={(e) => setFormulario({ ...formulario, experiencia: e.target.value })}
              />
              <input
                className="border p-2"
                placeholder="Grado (ej: 3 años)"
                required
                value={formulario.grado}
                onChange={(e) => setFormulario({ ...formulario, grado: e.target.value })}
              />
              <select
                className="border p-2"
                value={formulario.nivel}
                onChange={(e) => setFormulario({ ...formulario, nivel: e.target.value })}
              >
                <option value="Inicial">Inicial</option>
              </select>
              <input
                className="border p-2"
                placeholder="Bimestre (ej: I bimestre)"
                value={formulario.bimestre}
                onChange={(e) => setFormulario({ ...formulario, bimestre: e.target.value })}
              />
              <input
                className="border p-2"
                placeholder="Fecha (ej: 09/09/2025)"
                value={formulario.fecha}
                onChange={(e) => setFormulario({ ...formulario, fecha: e.target.value })}
              />
              <input
                className="border p-2"
                placeholder="Docente (ej: Haydi Quispe)"
                value={formulario.docente}
                onChange={(e) => setFormulario({ ...formulario, docente: e.target.value })}
              />
              <input
                className="border p-2"
                placeholder="N° de sesión (opcional)"
                value={formulario.numeroSesion}
                onChange={(e) => setFormulario({ ...formulario, numeroSesion: e.target.value })}
              />
            </div>

            {/* Área / Competencia / Capacidades */}
            <select
              className="border p-2 w-full"
              required
              value={formulario.area}
              onChange={(e) => setFormulario({ ...formulario, area: e.target.value })}
            >
              <option value="">Selecciona un área</option>
              {Object.keys(COMPETENCIAS_CAPACIDADES).map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>

            <select
              className="border p-2 w-full"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
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

            {/* Valor (select) */}
            <div>
              <label className="font-semibold">Valor:</label>
              <select
                className="border p-2 w-full"
                required
                value={formulario.valor}
                onChange={(e) => setFormulario({ ...formulario, valor: e.target.value })}
              >
                <option value="">Selecciona un valor</option>
                {VALORES.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            {/* Enfoques transversales (checkboxes) */}
            <div>
              <label className="font-semibold">Enfoques transversales (mínimo 1):</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                {ENFOQUES_TRANSVERSALES.map((opt) => {
                  const checked = formulario.enfoquesTransversales.includes(opt);
                  return (
                    <label key={opt} className="text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setFormulario((prev) => ({
                            ...prev,
                            enfoquesTransversales: e.target.checked
                              ? [...prev.enfoquesTransversales, opt]
                              : prev.enfoquesTransversales.filter((x) => x !== opt),
                          }));
                        }}
                      />{" "}
                      {opt}
                    </label>
                  );
                })}
              </div>
              <p className="text-xs text-gray-600">Selecciona al menos 1 enfoque.</p>
            </div>

            {/* Provider */}
            <select
              className="border p-2 w-full"
              value={formulario.provider}
              onChange={(e) => setFormulario({ ...formulario, provider: e.target.value })}
            >
              <option value="cohere">Cohere</option>
              <option value="ollama-mistral">Mistral (Ollama)</option>
            </select>

            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" type="submit" disabled={loading}>
              {loading ? "Generando…" : "Generar sesión"}
            </button>
          </form>

          {error && <p className="text-red-600 mt-4 whitespace-pre-line">{error}</p>}

          {serverResp && (
            <div className="mt-6 bg-gray-100 p-4 rounded shadow space-y-3">
              <h3 className="text-lg font-bold">Respuesta del servidor</h3>
              <pre className="text-xs overflow-auto max-h-96 bg-white p-2 border">
                {JSON.stringify(serverResp, null, 2)}
              </pre>
              <button
                onClick={descargarWord}
                disabled={descargando || !markers}
                className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                {descargando ? "Descargando..." : "Descargar Word"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
