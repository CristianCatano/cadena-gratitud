import { getParticipants, getStories, getLatestPendingToken } from "@/lib/turnos";
import InitialTurnoForm from "@/app/components/InitialTurnoForm";
import PendingTurnoCard from "@/app/components/PendingTurnoCard";

export default async function Home() {
  const participants = await getParticipants();
  const stories = await getStories();
  const pendingToken = await getLatestPendingToken();

  return (
    <main className="min-h-screen bg-zinc-50 p-4">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-bold text-zinc-900">Cadena de gratitud</h1>
        <p className="mt-1 text-zinc-600">
          Historias cortas de cómo nos ayudamos en equipo.
        </p>

        {pendingToken ? (
          <PendingTurnoCard
            token={pendingToken.token}
            forName={pendingToken.for_name}
            baseUrl={process.env.NEXT_PUBLIC_APP_URL?.trim() ?? ""}
          />
        ) : (
          <InitialTurnoForm participants={participants} />
        )}

        <div className="space-y-3">
          {stories.map((s, i) => (
            <div key={i} className="rounded-xl bg-white p-4 shadow-sm">
              <div className="text-sm text-zinc-500">
                <span className="font-semibold text-zinc-800">{s.a_name}</span> ➜{" "}
                <span className="font-semibold text-zinc-800">{s.b_name}</span>
              </div>
              <div className="mt-2 text-zinc-800">{s.text}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}