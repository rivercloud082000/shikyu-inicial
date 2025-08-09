// app/auth/error/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// evita SSG y cache en esta página
export const dynamic = "force-dynamic";
export const revalidate = 0;

const map: Record<string, string> = {
  AccessDenied: "Tu correo no está permitido por el administrador.",
  OAuthCallback: "No se pudo validar tu cuenta de Google.",
  Configuration: "Faltan variables o credenciales en el servidor.",
};

// componente cliente interno (usa el hook)
function AuthErrorInner() {
  "use client";
  const sp = useSearchParams();
  const err = sp.get("error") || "AccessDenied";
  const msg = map[err] || "No pudimos iniciar sesión.";

  return (
    <main className="min-h-screen grid place-items-center bg-gray-50">
      <div className="rounded-2xl bg-white p-8 shadow w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2">Acceso denegado</h1>
        <p className="text-gray-600 mb-6">{msg}</p>
        <Link href="/" className="px-6 py-3 rounded-full bg-black text-white inline-block">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <AuthErrorInner />
    </Suspense>
  );
}
