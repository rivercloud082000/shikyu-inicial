import {
  ENFOQUES_TRANSVERSALES,
  ENFOQUES_TRANSVERSALES_DETALLE,
} from "./constants";

export type EnfoqueNombre = typeof ENFOQUES_TRANSVERSALES[number];

// Type guard: verifica que un string sea un enfoque válido
export function isEnfoqueNombre(x: string): x is EnfoqueNombre {
  return (ENFOQUES_TRANSVERSALES as readonly string[]).includes(x);
}

const MAPA_ENFOQUE = new Map(
  ENFOQUES_TRANSVERSALES_DETALLE.map((e) => [e.nombre, e.descripcion] as const)
);

// Devuelve ["Enfoque X: descripción", ...] solo para nombres válidos
export function enfoquesConDescripcion(nombres: string[]): string[] {
  return (nombres || []).filter(isEnfoqueNombre).map((n) => {
    const d = MAPA_ENFOQUE.get(n) ?? "";
    return d ? `${n}: ${d}` : n;
  });
}

// Join simple de nombres válidos (para {enfoquesTransversales})
export function enfoquesComoTexto(nombres: string[]): string {
  return (nombres || []).filter(isEnfoqueNombre).join(", ");
}
