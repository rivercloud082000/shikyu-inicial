import { z } from "zod";

export const inicialReqSchema = z
  .object({
    // Nivel fijo a "Inicial" (aunque no lo manden)
    nivel: z
      .string()
      .optional()
      .transform(() => "Inicial" as const),

    // Área libre: Psicomotricidad, Inglés, Comunicación, CyA, etc.
    area: z.string().min(1).max(60).transform((s) => s.trim()),

    // Grado (3/4/5 años). Tu route puede normalizar antes de validar.
    grado: z.enum(["3 años", "4 años", "5 años"]),

    // Campos base del request
    tema: z.string().min(1).transform((s) => s.trim()),
    docente: z.string().optional(),
    fecha: z.string().optional(),
    bimestre: z.string().optional(),
    numeroSesion: z.number().int().positive().optional(),
    experiencia: z.string().optional(),

    // Valor / Enfoques / Acciones (con límites)
    valor: z.string().min(1).transform((s) => s.trim()),
    enfoquesTransversales: z
      .array(z.string().min(1).transform((s) => s.trim()))
      .min(2)
      .max(4),
    accionesObservables: z
      .array(z.string().min(1).transform((s) => s.trim()))
      .min(2)
      .max(4),
  })
  .strict();

export type InicialRequest = z.infer<typeof inicialReqSchema>;
