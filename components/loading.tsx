// /components/Loading.tsx
export default function Loading({ text = "Cargando..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur">
      <div className="bg-white rounded-2xl p-6 shadow w-72 text-center">
        <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-black/10 border-t-black" />
        <p className="font-medium">{text}</p>
      </div>
    </div>
  );
}
