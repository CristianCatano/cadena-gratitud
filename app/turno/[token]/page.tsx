import Link from "next/link";
import { getParticipants, getToken } from "@/lib/turnos";
import TurnoForm from "./TurnoForm";

type Props = {
  params: { token: string } | Promise<{ token: string }>;
};

export default async function TurnoPage({ params }: Props) {
  const { token } = await params;

  const [tokenData, participantsData] = await Promise.all([
    getToken(token),
    getParticipants(),
  ]);

  const participants = participantsData
    .filter((participant) => participant.name !== tokenData?.for_name)
    .map((participant) => participant.name);

  if (!tokenData || tokenData.used) {
    return (
      <main className="min-h-screen bg-zinc-50 p-4">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-zinc-900">Turno por link</h1>
          <p className="mt-1 text-zinc-600">
            Usa este enlace una sola vez para enviar un agradecimiento.
          </p>

          <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <h2 className="font-semibold text-zinc-900">Token inválido o ya usado</h2>
            <p className="mt-1 text-zinc-700">
              Este enlace no existe o ya no está activo.
            </p>
          </div>

          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-zinc-900 px-4 py-2 text-white"
          >
            Volver al muro
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-4">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">Turno por link</h1>
        <p className="mt-1 text-zinc-600">
          Este turno está asignado a:{" "}
          <span className="font-semibold text-zinc-900">{tokenData.for_name}</span>
        </p>

        <div className="mt-6">
          <TurnoForm token={token} participants={participants} forName={tokenData.for_name} />
        </div>

        <Link
          href="/"
          className="mt-6 inline-block text-sm font-medium text-zinc-700 underline"
        >
          Ver muro
        </Link>
      </div>
    </main>
  );
}