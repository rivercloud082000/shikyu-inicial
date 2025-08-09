"use client";

import Link from "next/link";
import Image from "next/image";

export default function Home() {
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

      {/* 🔹 Caja central con el acceso directo */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="bg-black bg-opacity-60 p-8 rounded-xl shadow-xl text-center max-w-xl">
          <p className="mb-6 text-lg text-white">
            Tu generador de sesiones de aprendizaje.
          </p>

          {/* Botón para ir directamente a la app */}
          <Link
            href="/app" /* <-- ajusta si es otra ruta */
            className="inline-block px-8 py-3 font-bold text-lg rounded-full transition-transform duration-300 hover:scale-105
                       bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.15)]"
          >
            Ir a la app
          </Link>

          {/* Nota pequeña bajo el botón */}
          <p className="mt-4 text-xs text-white/70">
            Acceso libre sin autenticación.
          </p>
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
