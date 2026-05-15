// app/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Image from "next/image";
import { getStories, getLatestPendingToken } from "@/lib/turnos";

export default async function Home() {
  const stories = await getStories();
  const pendingToken = await getLatestPendingToken();

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 via-zinc-100 to-white py-8">
      <div className="mx-auto max-w-6xl px-4">
        <section className="overflow-hidden rounded-[2rem] bg-white/95 p-6 shadow-[0_30px_80px_-36px_rgba(15,23,42,0.2)] ring-1 ring-zinc-200">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-4">
                <Image
                  src="/branding/LOGO_ID_POSITIVO.png"
                  width={148}
                  height={44}
                  alt="Interdoors"
                  className="h-11 w-auto"
                />
                <span className="rounded-3xl bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-amber-800 shadow-sm">
                  Cadena de gratitud
                </span>
              </div>

              <div className="max-w-2xl space-y-4">
                <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
                  Un muro cálido donde el equipo reconoce lo mejor del otro.
                </h1>
                <p className="text-lg leading-8 text-zinc-600">
                  Historias breves de agradecimiento, contadas con respeto y energía positiva para conectar a las personas detrás de cada turno.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <span className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm">
                  Inspiración humana
                </span>
                <span className="rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
                  Cultura colaborativa
                </span>
              </div>
            </div>

            <div className="relative rounded-[1.75rem] border border-zinc-200 bg-zinc-50 p-1 shadow-sm">
              <div className="overflow-hidden rounded-[1.65rem] bg-white">
                <Image
                  src="/branding/Cartelera_BuenTrato_ID2026_CV-01.png"
                  alt="Cartelera de Buen Trato"
                  width={880}
                  height={640}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="space-y-4">
            <div className="rounded-[1.75rem] bg-white p-6 shadow-[0_20px_56px_-28px_rgba(15,23,42,0.18)] ring-1 ring-zinc-200">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-amber-700">Muro público</p>
                  <h2 className="mt-3 text-2xl font-semibold text-zinc-900">Historias recientes</h2>
                </div>
                {pendingToken ? (
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-800">
                    Turno pendiente
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-sm text-zinc-600">
                Cada mensaje es una forma de agradecer y celebrar a quienes aportan al equipo.
              </p>
            </div>

            {stories.length === 0 ? (
              <div className="rounded-[1.75rem] bg-zinc-50 p-8 text-center text-zinc-500 shadow-sm ring-1 ring-zinc-200">
                Aún no hay historias, pero pronto el equipo comenzará a compartir su gratitud.
              </div>
            ) : (
              <div className="space-y-5">
                {stories.map((s, i) => (
                  <article
                    key={i}
                    className="rounded-[1.75rem] border border-zinc-200 bg-white p-6 shadow-[0_14px_40px_-24px_rgba(15,23,42,0.18)]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm uppercase tracking-[0.22em] text-amber-700">Gratitud compartida</p>
                        <h3 className="mt-2 text-2xl font-semibold text-zinc-900">
                          <span className="text-amber-700">{s.a_name}</span> ➜ <span className="text-zinc-800">{s.b_name}</span>
                        </h3>
                      </div>
                    </div>
                    <p className="mt-5 text-base leading-8 text-zinc-700">{s.text}</p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className="space-y-5">
            {pendingToken && (
              <div className="rounded-[1.75rem] bg-amber-50/90 p-6 shadow-sm ring-1 ring-amber-200">
                <p className="text-sm uppercase tracking-[0.24em] text-amber-800">Atención</p>
                <h3 className="mt-3 text-xl font-semibold text-zinc-900">Hay un turno pendiente</h3>
                <p className="mt-2 text-zinc-700">
                  Gracias por esperar: el siguiente agradecimiento está listo para ser enviado en cuanto se abra el turno.
                </p>
              </div>
            )}

            <div className="rounded-[1.75rem] bg-white p-6 shadow-[0_12px_26px_-18px_rgba(15,23,42,0.18)] ring-1 ring-zinc-200">
              <p className="text-sm uppercase tracking-[0.24em] text-amber-700">Interdoors</p>
              <div className="mt-4 flex items-center gap-4">
                <Image
                  src="/branding/Fondo-Buen-Trato.png"
                  width={64}
                  height={64}
                  alt="Actividad Cadena de gratitud"
                  className="h-16 w-16 rounded-2xl bg-zinc-100 p-2"
                />
                <div>
                  <p className="font-semibold text-zinc-900">Cultura de reconocimiento</p>
                  <p className="mt-2 text-sm text-zinc-600">Una experiencia diseñada para que cada agradecimiento se sienta reconocido y cercano.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <footer className="mt-10 rounded-[1.75rem] border border-zinc-200 bg-white/90 p-5 text-center text-sm text-zinc-600 shadow-sm">
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Image
              src="/branding/LOGO_ID_POSITIVO.png"
              width={128}
              height={38}
              alt="Interdoors"
              className="h-9 w-auto"
            />
            <span>Cadena de gratitud · Una iniciativa cálida y cercana para el equipo.</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
