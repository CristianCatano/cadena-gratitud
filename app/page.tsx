import { unstable_noStore as noStore } from "next/cache";
import { getStories, getLatestPendingToken } from "@/lib/turnos";

export default async function Home() {
  // 🔓 Desactivar cache: la Home se actualiza en cada visita
  noStore();

  const stories = await getStories();
  const pendingToken = await getLatestPendingToken();

  return (
    <main className="min-h-screen bg-zinc-50 p-4">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-bold text-zinc-900">Cadena de gratitud</h1>
        <p className="mt-1 text-zinc-600">
          Historias cortas de cómo nos ayudamos en equipo.
        </p>

        {/* 📌 Aviso simple si hay turno pendiente (sin link ni botones) */}
        {pendingToken && (
          <div className="mt-4 rounded-xl bg-yellow-50 p-4 border border-yellow-200">
            <p className="text-sm text-yellow-800">
              Hay un turno pendiente. Ten paciencia, pronto llegará.
            </p>
          </div>
        )}

        {/* 📖 Mostrar todas las historias (público, solo lectura) */}
        <div className="mt-6 space-y-3">
          {stories.length === 0 ? (
            <p className="text-zinc-500 text-center py-4">
              Aún no hay historias. ¡Sé el primero en compartir!
            </p>
          ) : (
            stories.map((s, i) => (
              <div key={i} className="rounded-xl bg-white p-4 shadow-sm">
                <div className="text-sm text-zinc-500">
                  <span className="font-semibold text-zinc-800">{s.a_name}</span> ➜{" "}
                  <span className="font-semibold text-zinc-800">{s.b_name}</span>
                </div>
                <div className="mt-2 text-zinc-800">{s.text}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}