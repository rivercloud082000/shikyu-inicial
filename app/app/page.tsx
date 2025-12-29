"use client";

import React, { useEffect, useMemo, useState } from "react";
import LoadingOverlay from "../../components/LoadingOverlay";
import { COMPETENCIAS_CAPACIDADES } from "../../lib/competencias-capacidades";
import { VALORES, ENFOQUES_TRANSVERSALES } from "../../lib/inicial/constants";

type Provider = "cohere" | "ollama-mistral";

type FormState = {
  // ✅ separados
  tema: string; // requerido por backend
  tituloSesion: string; // opcional (solo para plantilla / markers)

  experiencia: string;
  grado: string;
  nivel: string; // "Inicial"
  bimestre: string;
  fecha: string;
  docente: string;
  numeroSesion: string; // UI string, al enviar lo convertimos a number

  area: string;
  competencia: string; // UI (no se envía al backend si strict)
  capacidades: string[];

  valor: string;
  enfoquesTransversales: string[];

  provider: Provider;
};

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function Card({
  title,
  icon,
  children,
  right,
}: {
  title: string;
  icon?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.10)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-black/5 to-black/0 border-b border-black/10">
        <div className="flex items-center gap-2">
          {icon ? <span className="text-base">{icon}</span> : null}
          <h2 className="text-sm md:text-base font-extrabold tracking-tight text-gray-800">
            {title}
          </h2>
        </div>
        {right}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-semibold text-gray-700">{children}</label>;
}

function Help({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-gray-500 leading-snug">{children}</p>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        "w-full rounded-xl border border-black/10 bg-white/90 px-3 py-2 text-sm shadow-sm",
        "focus:outline-none focus:ring-2 focus:ring-emerald-400/60",
        props.className
      )}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cx(
        "w-full rounded-xl border border-black/10 bg-white/90 px-3 py-2 text-sm shadow-sm",
        "focus:outline-none focus:ring-2 focus:ring-emerald-400/60",
        props.className
      )}
    />
  );
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-start gap-2 text-sm text-gray-800">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-black/20"
      />
      <span className="text-sm leading-snug">{label}</span>
    </label>
  );
}

// ---- util: timeout para fetch
const fetchWithTimeout = async (url: string, options: any, timeout = 240000) => {
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

export default function AppPage() {
  const [formulario, setFormulario] = useState<FormState>({
    tema: "",
    tituloSesion: "",

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

  const [serverResp, setServerResp] = useState<any>(null);
  const [markers, setMarkers] = useState<any>(null);


  const [loading, setLoading] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const [descargandoInst, setDescargandoInst] = useState(false);
  const [descargandoInstrumentoElegido, setDescargandoInstrumentoElegido] = useState(false);
  const [error, setError] = useState("");

  // ✅ Nuevo: selector de 1 instrumento elegido (híbrido)
  const [instrumentType, setInstrumentType] = useState("LISTA_COTEJO");
  const [instrumento, setInstrumento] = useState<any>(null);

  const tieneSesion = useMemo(() => !!markers, [markers]);

  // ---- dependencias de Área/Competencia (solo UI)
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
    setServerResp(null);
    setMarkers(null);
    setInstrumento(null); // ✅ reset instrumento elegido
  }, [formulario.area]);

  useEffect(() => {
    if (formulario.area && formulario.competencia) {
      const caps = COMPETENCIAS_CAPACIDADES[formulario.area]?.[formulario.competencia] || [];
      setCapacidadesDisponibles(caps);
    } else {
      setCapacidadesDisponibles([]);
      setFormulario((prev) => ({ ...prev, capacidades: [] }));
    }
    setServerResp(null);
    setMarkers(null);
    setInstrumento(null); // ✅ reset instrumento elegido
  }, [formulario.competencia, formulario.area]);

  // ---- submit sesión (✅ payload compatible con tu backend viejo)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setServerResp(null);
    setMarkers(null);
    setInstrumento(null);

    const tema = (formulario.tema ?? "").trim();
    if (!tema) return setError("El tema es obligatorio.");
    if (!formulario.grado.trim()) return setError("El grado es obligatorio (ej: 3 años).");
    if (!formulario.area.trim()) return setError("Selecciona un área.");
    if (!formulario.valor.trim()) return setError("Selecciona un valor.");
    if (formulario.enfoquesTransversales.length < 1) return setError("Selecciona al menos 1 enfoque transversal.");

    setLoading(true);
    try {
      // ✅ acciones observables por defecto (igual que tu código antiguo)
      const accionesObservables = ["Escucha con atención", "Participa con orden"];

      // ✅ numeroSesion a number o undefined (igual que tu código antiguo)
      const numeroSesion =
        formulario.numeroSesion && formulario.numeroSesion.trim() !== ""
          ? Number(formulario.numeroSesion)
          : undefined;

      // ✅ PAYLOAD “SEGÚN CONTRATO DEL BACKEND”
      const payload: any = {
        area: formulario.area,
        grado: formulario.grado,
        tema,

        docente: formulario.docente || undefined,
        fecha: formulario.fecha || undefined,
        bimestre: formulario.bimestre || undefined,
        numeroSesion,
        experiencia: formulario.experiencia || undefined,

        valor: formulario.valor,
        enfoquesTransversales: formulario.enfoquesTransversales,
        accionesObservables,

        provider: formulario.provider,

        // ✅✅✅ PASO 3.3 (AQUÍ): mandamos el instrumento elegido
        instrumentType,
      };

      const res = await fetchWithTimeout(
        "/api/generar",
        {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify(payload),
        },
        240000
      );

      const text = await res.text();
      let data: any = null;

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = { error: "Respuesta no-JSON del servidor", raw: text };
      }

      if (!res.ok) {
        const detalles =
          data?.issues ? JSON.stringify(data.issues, null, 2)
          : data?.error ? data.error
          : text || "Error del servidor";
        throw new Error(`Error del servidor:\n${detalles}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || "El servidor no devolvió success:true");
      }

      // ✅ inyectamos título SOLO en markers para plantilla
      const tituloSesionFinal = (formulario.tituloSesion ?? "").trim() || tema;
      const patchedMarkers = {
        ...data.markers,
        tituloSesion: tituloSesionFinal,
      };

      setServerResp(data);
      setMarkers(patchedMarkers);

      // ✅ Instrumento elegido (si el backend lo devuelve)
      setInstrumento(data?.instrumento ?? null);

    } catch (err: any) {
      setError(err.message || "Error inesperado");
      console.error("❌ handleSubmit:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---- exportar Word sesión
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
      setError("Error al descargar el Word de la sesión.");
    } finally {
      setDescargando(false);
    }
  };

  // ✅ NUEVO: exportar Word del instrumento elegido (separado)
  const descargarInstrumentoElegidoWord = async () => {
    if (!instrumento) return;
    setDescargandoInstrumentoElegido(true);
    try {
      const res = await fetch("/api/exportarInstrumento", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ instrumento }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Error al generar el Word del instrumento.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Instrumento-Inicial.docx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al descargar instrumento", err);
      setError("Error al descargar el Word del instrumento elegido.");
    } finally {
      setDescargandoInstrumentoElegido(false);
    }
  };

    // ✅ NUEVO: generar SOLO instrumento (sin generar sesión)
  const generarInstrumento = async () => {
    setError("");
    setInstrumento(null);

    // Validaciones mínimas (elige lo que tu backend requiere)
    const tema = (formulario.tema ?? "").trim();
    if (!tema) return setError("El tema es obligatorio para generar el instrumento.");
    if (!formulario.grado.trim()) return setError("El grado es obligatorio.");
    if (!formulario.area.trim()) return setError("Selecciona un área.");

    setDescargandoInst(true);
    try {
      const payload: any = {
        area: formulario.area,
        grado: formulario.grado,
        tema,

        docente: formulario.docente || undefined,
        fecha: formulario.fecha || undefined,
        bimestre: formulario.bimestre || undefined,
        experiencia: formulario.experiencia || undefined,

        // ✅ importante: el tipo de instrumento elegido
        instrumentType,

        // (opcional) si tu backend lo usa:
        valor: formulario.valor || undefined,
        enfoquesTransversales: formulario.enfoquesTransversales,
        provider: formulario.provider,
      };

      const res = await fetchWithTimeout(
        "/api/generarInstrumento",
        {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify(payload),
        },
        240000
      );

      const text = await res.text();
      let data: any = null;

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = { error: "Respuesta no-JSON del servidor", raw: text };
      }

      if (!res.ok || !data?.success) {
        const detalles =
          data?.issues ? JSON.stringify(data.issues, null, 2)
          : data?.error ? data.error
          : text || "Error del servidor";
        throw new Error(`Error del servidor:\n${detalles}`);
      }

      // ✅ setea el instrumento para habilitar el botón de descarga
      setInstrumento(data.instrumento);

    } catch (err: any) {
      setError(err.message || "Error inesperado al generar instrumento");
      console.error("❌ generarInstrumento:", err);
    } finally {
      setDescargandoInst(false);
    }
  };


  // ---- instrumentos (tu flujo anterior: genera varios)
  

  return (
    <>
      <LoadingOverlay show={loading} />

      <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/giffy5.gif')" }}>
        <div className="min-h-screen bg-black/10 p-3 md:p-6">
          <div className="mx-auto max-w-6xl space-y-4">
            <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.10)] px-5 py-4">
              <div className="flex flex-col gap-1">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-gray-900">
                  🌸 SestIA Blossom Inicial
                </h1>
                <p className="text-sm text-gray-700">Sesiones MINEDU Inicial • Branding ERES</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Card title="🧾 Datos generales" icon="📌">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1 md:col-span-2">
                    <Label>Tema (requerido)</Label>
                    <Input
                      placeholder="Ej: El círculo"
                      value={formulario.tema}
                      onChange={(e) => setFormulario((p) => ({ ...p, tema: e.target.value }))}
                    />

                    <div className="mt-3">
                      <Label>Título de la sesión (opcional)</Label>
                      <Input
                        placeholder="Si lo dejas vacío, se usará el tema"
                        value={formulario.tituloSesion}
                        onChange={(e) => setFormulario((p) => ({ ...p, tituloSesion: e.target.value }))}
                      />
                    </div>

                    <Help>
                      El backend usa <b>tema</b>. El <b>título</b> se inyecta en markers para la plantilla Word.
                    </Help>
                  </div>

                  <div className="space-y-1">
                    <Label>Experiencia</Label>
                    <Input
                      placeholder="Ej: VI"
                      value={formulario.experiencia}
                      onChange={(e) => setFormulario({ ...formulario, experiencia: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Grado (requerido)</Label>
                    <Input
                      placeholder="Ej: 3 años"
                      required
                      value={formulario.grado}
                      onChange={(e) => setFormulario({ ...formulario, grado: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Nivel</Label>
                    <Select value={formulario.nivel} onChange={(e) => setFormulario({ ...formulario, nivel: e.target.value })}>
                      <option value="Inicial">Inicial</option>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label>Bimestre</Label>
                    <Input
                      placeholder="Ej: III"
                      value={formulario.bimestre}
                      onChange={(e) => setFormulario({ ...formulario, bimestre: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Fecha</Label>
                    <Input
                      placeholder="Ej: 28/12/2025"
                      value={formulario.fecha}
                      onChange={(e) => setFormulario({ ...formulario, fecha: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Docente</Label>
                    <Input
                      placeholder="Ej: Adrian Perez"
                      value={formulario.docente}
                      onChange={(e) => setFormulario({ ...formulario, docente: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <Label>N° de sesión (opcional)</Label>
                    <Input
                      placeholder="Ej: 6"
                      value={formulario.numeroSesion}
                      onChange={(e) => setFormulario({ ...formulario, numeroSesion: e.target.value })}
                    />
                    <Help>Si escribes algo aquí, se enviará como número al backend.</Help>
                  </div>
                </div>
              </Card>

              {/* ✅ Instrumento elegido */}
              <Card title="🧰 Instrumento (elige 1)" icon="🧾">
                <div className="space-y-1">
                  <Label>Instrumento de evaluación</Label>
                  <Select
                    value={instrumentType}
                    onChange={(e) => setInstrumentType(e.target.value)}
                  >
                    <option value="GUIA_OBSERVACION">Guía de observación</option>
                    <option value="LISTA_COTEJO">Lista de cotejo</option>
                    <option value="ESCALA_VALORACION">Escala de valoración</option>
                    <option value="RUBRICA_ANALITICA">Rúbrica analítica</option>
                    <option value="REGISTRO_ANECDOTICO">Registro anecdótico</option>
                    <option value="DIARIO_CAMPO">Diario de campo</option>
                    <option value="LISTA_VERIFICACION">Lista de verificación</option>
                    <option value="FICHA_SEGUIMIENTO">Ficha de seguimiento</option>
                  </Select>
                  <Help>Se enviará al backend para generar SOLO este instrumento (híbrido).</Help>
                </div>
              </Card>

              <Card title="📚 Marco curricular (UI)" icon="📘">
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Área</Label>
                      <Select required value={formulario.area} onChange={(e) => setFormulario({ ...formulario, area: e.target.value })}>
                        <option value="">Selecciona un área</option>
                        {Object.keys(COMPETENCIAS_CAPACIDADES).map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label>Competencia</Label>
                      <Select value={formulario.competencia} onChange={(e) => setFormulario({ ...formulario, competencia: e.target.value })}>
                        <option value="">Selecciona una competencia</option>
                        {competenciasDisponibles.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div className="rounded-xl border border-black/10 bg-white/70 p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-800">🧩 Capacidades (opcional)</p>
                      <p className="text-[11px] text-gray-600">Solo UI por ahora.</p>
                    </div>

                    {capacidadesDisponibles.length === 0 ? (
                      <p className="mt-2 text-sm text-gray-700">Selecciona área y competencia para ver capacidades.</p>
                    ) : (
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {capacidadesDisponibles.map((cap) => (
                          <Checkbox
                            key={cap}
                            label={cap}
                            checked={formulario.capacidades.includes(cap)}
                            onChange={(v) => {
                              setFormulario((prev) => ({
                                ...prev,
                                capacidades: v ? [...prev.capacidades, cap] : prev.capacidades.filter((c) => c !== cap),
                              }));
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <Card title="⭐ Valores y enfoques" icon="✨">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Valor (requerido)</Label>
                    <Select required value={formulario.valor} onChange={(e) => setFormulario({ ...formulario, valor: e.target.value })}>
                      <option value="">Selecciona un valor</option>
                      {VALORES.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label>Proveedor IA</Label>
                    <Select value={formulario.provider} onChange={(e) => setFormulario({ ...formulario, provider: e.target.value as Provider })}>
                      <option value="cohere">Cohere</option>
                      <option value="ollama-mistral">Mistral (Ollama)</option>
                    </Select>
                  </div>

                  <div className="md:col-span-2 rounded-xl border border-black/10 bg-white/70 p-3">
                    <p className="font-bold text-gray-800">🧠 Enfoques transversales (mínimo 1)</p>
                    <p className="text-[11px] text-gray-600 mb-2">Marca al menos un enfoque para que aparezca en la sesión.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {ENFOQUES_TRANSVERSALES.map((opt) => (
                        <Checkbox
                          key={opt}
                          label={opt}
                          checked={formulario.enfoquesTransversales.includes(opt)}
                          onChange={(v) => {
                            setFormulario((prev) => ({
                              ...prev,
                              enfoquesTransversales: v ? [...prev.enfoquesTransversales, opt] : prev.enfoquesTransversales.filter((x) => x !== opt),
                            }));
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={cx("rounded-xl px-4 py-2 font-bold text-white shadow-md text-sm", "bg-blue-600 hover:bg-blue-700 disabled:opacity-60")}
                >
                  🚀 {loading ? "Generando…" : "Generar sesión"}
                </button>

                                


                <button
                  type="button"
                  onClick={descargarWord}
                  disabled={descargando || !markers}
                  className={cx("rounded-xl px-4 py-2 font-bold text-white shadow-md text-sm", "bg-teal-600 hover:bg-teal-700 disabled:opacity-60")}
                >
                  📄 {descargando ? "Descargando…" : "Descargar Word (Sesión)"}
                </button>

                {/* ✅ Nuevo: descargar instrumento elegido */}
                <button
                  type="button"
                  onClick={descargarInstrumentoElegidoWord}
                  disabled={descargandoInstrumentoElegido || !instrumento}
                  className={cx("rounded-xl px-4 py-2 font-bold text-white shadow-md text-sm", "bg-gray-900 hover:bg-black disabled:opacity-60")}
                >
                  🧾 {descargandoInstrumentoElegido ? "Descargando…" : "Descargar Instrumento (Word)"}
                </button>

                {/* Tu flujo anterior (varios instrumentos) */}
                
              </div>
            </form>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-red-700 whitespace-pre-line text-sm">
                ❌ {error}
              </div>
            )}

            {serverResp && (
              <Card title="📦 Respuesta del servidor" icon="🧩" right={<span className="text-[11px] text-gray-600">{tieneSesion ? "✅ Sesión lista" : ""}</span>}>
                <details className="rounded-xl border border-black/10 bg-white p-3">
                  <summary className="cursor-pointer text-sm font-bold text-gray-800">Ver JSON (sesión)</summary>
                  <pre className="mt-3 text-xs overflow-auto max-h-[420px] rounded-xl bg-white p-3 border border-black/10">
                    {JSON.stringify(serverResp, null, 2)}
                  </pre>
                </details>
              </Card>
            )}

            

            {/* ✅ Debug opcional: ver instrumento elegido */}
            {instrumento && (
              <Card title="🧾 Instrumento elegido (1)" icon="✅" right={<span className="text-[11px] text-gray-600">solo 1</span>}>
                <details className="rounded-xl border border-black/10 bg-white p-3">
                  <summary className="cursor-pointer text-sm font-bold text-gray-800">Ver JSON (instrumento elegido)</summary>
                  <pre className="mt-3 text-xs overflow-auto max-h-[420px] rounded-xl bg-white p-3 border border-black/10">
                    {JSON.stringify(instrumento, null, 2)}
                  </pre>
                </details>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
