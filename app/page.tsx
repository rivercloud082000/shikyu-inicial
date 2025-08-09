"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signIn } from "next-auth/react";
import Loading from "@/components/loading"; // ⬅️ nuevo

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <main
      className="min-h-screen flex flex-col justify-between items-center text-white relative"
      style={{
        backgroundImage: "url('/fondo-animado.gif')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Logo posicionado manualmente */}
      <div className="logo-pos absolute top-4 right-4">
        <Image
          src="/logo-shikyu.png"
          alt="Logo ShikyuEd"
          width={100}
          height={100}
        />
      </div>

      {/* 🔹 Título en la parte superior, centrado */}
      <div className="pt-6 text-center">
        <h1 className="text-4xl font-extrabold text-white drop-shadow-lg animate-pulse">
          Bienvenido a ShikyuoEd
        </h1>
      </div>

      {/* 🔹 Caja central con el botón de login */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="bg-black bg-opacity-60 p-8 rounded-xl shadow-xl text-center max-w-xl">
          <p className="mb-6 text-lg text-white">
            Tu generador de sesiones de aprendizaje.
          </p>

          {status === "loading" ? (
            <Loading text="Verificando sesión..." /> // ⬅️ reemplaza el texto por overlay bonito
          ) : (
            <>
              {/* Botón de Google: redirige solo cuando haces click */}
              {!session?.user ? (
                <button
                  onClick={() => signIn("google", { callbackUrl: "/app" /* <-- ajusta si tu ruta es otra */ })}
                  aria-label="Iniciar sesión con Google"
                  className="relative inline-flex items-center gap-3 px-9 py-3.5 font-semibold text-lg rounded-full
                             transition-transform duration-300 hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-white/60
                             bg-white/10 backdrop-blur-md text-white shadow-[0_8px_30px_rgb(0,0,0,0.25)]
                             before:absolute before:inset-0 before:rounded-full before:p-[2px]
                             before:bg-[conic-gradient(var(--tw-gradient-stops))] before:from-blue-500 before:via-purple-500 before:to-pink-500
                             before:opacity-80 before:-z-10
                             after:absolute after:inset-[2px] after:rounded-full after:bg-black/60
                             overflow-hidden"
                >
                  {/* Shine */}
                  <span className="pointer-events-none absolute -left-1/2 top-0 h-full w-[60%] -skew-x-12 bg-white/10 blur-md
                                    translate-x-0 group-hover:translate-x-[220%] transition-transform duration-700" />

                  {/* Ícono Google minimal (cápsula blanca) */}
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white">
                    <svg viewBox="0 0 533.5 544.3" width="16" height="16" aria-hidden="true">
                      <path fill="#4285F4" d="M533.5 278.4c0-18.6-1.7-36.4-5-53.7H272v101.7h146.9c-6.3 34-25 62.7-53.3 81.9v67h86.2c50.4-46.5 81.7-115.1 81.7-197z"/>
                      <path fill="#34A853" d="M272 544.3c72.9 0 134.1-24.1 178.8-65.4l-86.2-67c-24 16.1-54.8 25.7-92.6 25.7-71 0-131.2-47.9-152.8-112.3h-89.5v70.6C74.9 485.6 167.3 544.3 272 544.3z"/>
                      <path fill="#FBBC05" d="M119.2 325.3c-10.4-31.1-10.4-65.2 0-96.3v-70.6H29.7C-9.9 202.3-9.9 342 29.7 421.2l89.5-70.6z"/>
                      <path fill="#EA4335" d="M272 107.5c39.6-.6 77.3 14 106 40.7l79.3-79.3C405.7 12.8 337.6-6.3 272 0 167.3 0 74.9 58.7 29.7 149.3l89.5 70.6C140.8 155.5 201 107.5 272 107.5z"/>
                    </svg>
                  </span>

                  <span className="relative z-10">Iniciar sesión con Google</span>
                </button>
              ) : (
                // Si ya hay sesión, muestra un botón para entrar manualmente
                <Link
                  href="/app" /* <-- ajusta si es otra ruta */
                  className="inline-block px-8 py-3 font-bold text-lg rounded-full transition-transform duration-300 hover:scale-105
                             bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                >
                  Ir a la app
                </Link>
              )}

              {/* Nota pequeña bajo el botón */}
              <p className="mt-4 text-xs text-white/70">
                Solo correos aprobados por el administrador.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Pie de página manual */}
      <div className="footer-pos text-sm absolute bottom-4 text-white">
        <div>
          📧 Contacto:{" "}
          <a
            href="mailto:huampuque2000@gmail.com"
            className="underline text-blue-300"
          >
            huampuque2000@gmail.com
          </a>
        </div>
        <div>
          ⚡ Creado por <strong className="text-blue-300">Adrian Jesus Perez Huampuque</strong>
        </div>
      </div>
    </main>
  );
}
