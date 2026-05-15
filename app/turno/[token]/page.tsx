import Image from "next/image";
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
      <main className="min-h-screen bg-gradient-to-b from-zinc-50 via-zinc-100 to-white py-8">
        <div className="mx-auto max-w-3xl px-4">
          <div className="overflow-hidden rounded-[2rem] bg-white p-6 shadow-[0_28px_70px_-32px_rgba(15,23,42,0.18)] ring-1 ring-zinc-200">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-amber-700">Turno por link</p>
                <h1 className="mt-3 text-3xl font-semibold text-zinc-900">Enlace inválido o expirado</h1>
              </div>
              <Image
                src="/branding/Fondo-Buen-Trato.png"
                alt="Logo actividad"
                width={96}
                height={96}
                className="h-24 w-24 rounded-3xl bg-zinc-100 p-2"
              />
            </div>

            <p className="mt-5 text-zinc-600">
              Este enlace solo puede usarse una vez. Si ya fue utilizado, volverá al muro principal para que el equipo siga compartiendo gratitud.
            </p>

            <div className="mt-7 rounded-[1.75rem] border border-zinc-200 bg-zinc-50 p-5">
              <h2 className="text-lg font-semibold text-zinc-900">Token inválido</h2>
              <p className="mt-2 text-zinc-700">El enlace no existe o ya no está activo.</p>
            </div>

            <Link
              href="/"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-700"
            >
              Volver al muro
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 via-zinc-100 to-white py-8">
      <div className="mx-auto max-w-3xl px-4">
        <div className="overflow-hidden rounded-[2rem] bg-white p-6 shadow-[0_28px_70px_-32px_rgba(15,23,42,0.18)] ring-1 ring-zinc-200">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-amber-700">Turno asignado</p>
              <h1 className="mt-3 text-3xl font-semibold text-zinc-900">Escribe tu agradecimiento</h1>
              <p className="mt-3 text-zinc-600">
                Tu mensaje llegará directo al siguiente compañero en la cadena.
              </p>
            </div>
            <div className="flex items-center gap-4 rounded-3xl bg-zinc-50 px-4 py-3">
              <Image
                src="/branding/LOGO_ID_POSITIVO.png"
                alt="Interdoors"
                width={120}
                height={34}
                className="h-10 w-auto"
              />
              <Image
                src="/branding/Fondo-Buen-Trato.png"
                alt="Actividad Cadena de gratitud"
                width={72}
                height={72}
                className="h-16 w-16 rounded-3xl bg-white p-2"
              />
            </div>
          </div>

          <div className="mt-6 rounded-[1.75rem] border border-amber-200 bg-amber-50/90 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-amber-800">Para</p>
            <p className="mt-3 text-4xl font-semibold text-zinc-900">{tokenData.for_name}</p>
            <p className="mt-3 text-zinc-700">
              Comparte una frase amable y celebrá su aporte al equipo.
            </p>
          </div>

          <div className="mt-8">
            <TurnoForm token={token} participants={participants} forName={tokenData.for_name} />
          </div>

          <div className="mt-7 text-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50"
            >
              Ver muro
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
