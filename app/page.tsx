"use client";

import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main
      className="relative min-h-screen text-white overflow-hidden"
      style={{
        backgroundImage: "url('/fondo-animado.gif')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay Blossom */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#05070f]/70 via-[#0b1224]/55 to-[#2a0a2a]/65" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.25),transparent_45%),radial-gradient(circle_at_70%_60%,rgba(236,72,153,0.22),transparent_50%)]" />

      {/* Logo ERES esquina */}
      <div className="absolute top-3 right-3 z-10">
        <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl px-2.5 py-2 shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
          <Image src="/logo-shikyu.png" alt="ERES" width={80} height={70} className="drop-shadow-lg" />
        </div>
      </div>

      {/* Contenido centrado (sin scroll) */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        {/* Logo principal (compacto y controlado por altura) */}
       <div className="mx-auto relative inline-flex items-center justify-center rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
  <div className="relative aspect-square w-[220px] md:w-[260px] rounded-2xl bg-white shadow-[0_20px_55px_rgba(0,0,0,0.4)]">
    <Image
      src="/sestia-blossom.jpeg"
      alt="SestIA Blossom – Generador Educativo"
      fill
      className="rounded-2xl object-contain"
      priority
    />
  </div>
</div>


        {/* Caja central compacta */}
        <div className="w-full max-w-2xl text-center rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] px-6 py-5">
          <p className="text-base md:text-lg text-white/90 font-semibold">
            Generador inteligente de sesiones e instrumentos de evaluación
          </p>

          <p className="mt-1 text-xs md:text-sm text-white/80">
            Formato profesional para Inicial • Exportación directa a Word
          </p>

          <div className="mt-4">
            <Link
              href="/app"
              className="
                inline-flex items-center justify-center gap-2
                px-8 py-2.5 rounded-full text-base md:text-lg font-extrabold
                bg-gradient-to-r from-sky-400 via-pink-400 to-fuchsia-500
                text-black shadow-lg transition-all duration-300
                hover:scale-105 hover:shadow-[0_0_30px_rgba(236,72,153,0.75)]
              "
            >
              Ir a la app <span className="text-black/70">➜</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer fijo (compacto) */}
      <footer className="absolute bottom-3 right-3 z-10 text-right text-sm text-white/80">
        <div className="flex justify-end gap-2 mb-1.5">
          <a
            href="https://wa.me/51913840883"
            target="_blank"
            rel="noopener noreferrer"
            className="group"
            aria-label="WhatsApp"
            title="WhatsApp"
          >
            <div
  className="
    relative h-11 w-11 rounded-full
    bg-[#25D366]
    shadow-[0_0_25px_rgba(37,211,102,0.85)]
    flex items-center justify-center
    transition-all duration-300
    group-hover:scale-110
  "
>
  <Image src="/whatsapp.png" alt="WhatsApp" width={24} height={24} />
</div>


          </a>

          <a
            href="https://www.instagram.com/adri.anperez5043"
            target="_blank"
            rel="noopener noreferrer"
            className="group"
            aria-label="Instagram"
            title="Instagram"
          >
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 via-fuchsia-500 to-purple-600 shadow-lg flex items-center justify-center transition group-hover:scale-110">
  <Image src="/instagram.png" alt="Instagram" width={22} height={22} />
</div>

          </a>
        </div>

       <a
  href="https://mail.google.com/mail/?view=cm&fs=1&to=e.r.e.s.enterprise@gmail.com"
  target="_blank"
  rel="noopener noreferrer"
  className="underline text-sky-300 hover:text-pink-300 transition"
>
  e.r.e.s.enterprise@gmail.com
</a>


        <div className="text-[11px] mt-0.5">
          Desarrollado por <strong className="text-pink-300">ERES</strong>
        </div>
      </footer>
    </main>
  );
}
