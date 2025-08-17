export default function LoadingOverlay({
  show,
  text = "Generando sesión…",
}: {
  show: boolean;
  text?: string;
}) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center">
      <div className="flex flex-col items-center gap-4 p-6 bg-white/90 rounded-2xl shadow-xl">
        <div className="w-12 h-12 rounded-full border-4 border-black/20 border-t-black animate-spin" />
        <p className="text-sm">{text}</p>
      </div>
    </div>
  );
}
