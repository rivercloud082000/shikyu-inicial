// app/admin/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return <div className="p-6">Acceso restringido.</div>;
  }

  const allowlist = await prisma.allowlist.findMany({ orderBy: { createdAt: "desc" } });

  <section className="mt-6">
  <h3 className="font-semibold mb-2">Carga masiva (uno por línea)</h3>
  <form action="/api/admin/allow-bulk" method="post" className="grid gap-2">
    <textarea
      name="emails"
      rows={6}
      placeholder={`correo1@colegio.edu.pe\ncorreo2@colegio.edu.pe`}
      className="border p-2 rounded"
    />
    <div className="flex gap-2 items-center">
      <select name="role" className="border p-2 rounded">
        <option value="TEACHER">Docente</option>
        <option value="ADMIN">Admin</option>
      </select>
      <button className="border px-3 py-2 rounded">Cargar</button>
    </div>
  </form>
</section>

  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Panel de administración</h1>

      <section>
        <h2 className="text-xl font-semibold mb-2">Allowlist</h2>
        <form action="/api/admin/allow" method="post" className="flex gap-2">
          <input name="email" placeholder="email@colegio.edu.pe" className="border p-2 rounded" />
          <select name="role" className="border p-2 rounded">
            <option value="TEACHER">Docente</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button className="border px-3 py-2 rounded">Agregar</button>
        </form>
        <ul className="mt-4 space-y-1">
          {allowlist.map(a => (
            <li key={a.email} className="text-sm">
              {a.email} — {a.role}
              <form action="/api/admin/allow" method="post" className="inline ml-2">
                <input type="hidden" name="remove" value={a.email} />
                <button className="underline">Quitar</button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Usuarios</h2>
        <ul className="space-y-1">
          {users.map(u => (
            <li key={u.id} className="text-sm">
              {u.email} — {u.role} — {u.isAllowed ? "Permitido" : "Bloqueado"}
              <form action="/api/admin/user" method="post" className="inline ml-2">
                <input type="hidden" name="email" value={u.email ?? ""} />
                <input type="hidden" name="toggle" value="1" />
                <button className="underline">Alternar permiso</button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <Link href="/app/app" className="underline">Ir a la app</Link>
    </div>
  );
}
