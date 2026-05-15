"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import PendingTurnoCard from "@/app/components/PendingTurnoCard";

type TokenRecord = {
  token: string;
  for_name: string;
  used: boolean;
  created_at: string;
};

type Participant = {
  id: string;
  name: string;
  phone: string | null;
  active: boolean;
  created_at: string;
};

export default function AdminPanelClient() {
  const searchParams = useSearchParams();
  const key = searchParams.get("key");

  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingToken, setPendingToken] = useState<TokenRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [quantity, setQuantity] = useState(5);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [creatingTokens, setCreatingTokens] = useState(false);
  const [createdTokens, setCreatedTokens] = useState<
    Array<{ token: string; for_name: string; created_at: string }>
  >([]);

  useEffect(() => {
    if (!key) {
      setAuthorized(false);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const tokenRes = await fetch("/api/admin/pending-token", {
          headers: { "X-Admin-Key": key },
        });

        if (!tokenRes.ok) {
          if (tokenRes.status === 401) setAuthorized(false);
          else setError("Error al obtener el token");
          setLoading(false);
          return;
        }

        const tokenData = await tokenRes.json();
        setAuthorized(true);
        setPendingToken(tokenData.tokenRecord || null);

        const participantsRes = await fetch("/api/admin/participants", {
          headers: { "X-Admin-Key": key },
        });

        if (participantsRes.ok) {
          const participantsData = await participantsRes.json();
          setParticipants(participantsData.participants || []);
          if (participantsData.participants?.length > 0) {
            setSelectedParticipants([participantsData.participants[0].name]);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [key]);

  const handleToggleParticipant = (name: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleCreateInitialTokens = async () => {
    if (selectedParticipants.length === 0) {
      setError("Selecciona al menos un participante");
      return;
    }

    setCreatingTokens(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/create-initial-tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": key ?? "",
        },
        body: JSON.stringify({
          quantity,
          participantNames: selectedParticipants,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear los turnos");
      }

      const data = await res.json();
      setCreatedTokens(data.createdTokens || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setCreatingTokens(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50 p-4">
        <div className="mx-auto max-w-xl">
          <p className="text-zinc-600">Cargando...</p>
        </div>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="min-h-screen bg-zinc-50 p-4">
        <div className="mx-auto max-w-xl">
          <h1 className="text-2xl font-bold text-zinc-900">Admin Panel</h1>
          <div className="mt-4 rounded-xl bg-red-50 p-4 border border-red-200">
            <p className="text-sm text-red-800 font-semibold">No autorizado</p>
          </div>
        </div>
      </main>
    );
  }

  if (error && !createdTokens.length) {
    return (
      <main className="min-h-screen bg-zinc-50 p-4">
        <div className="mx-auto max-w-xl">
          <h1 className="text-2xl font-bold text-zinc-900">Admin Panel</h1>
          <div className="mt-4 rounded-xl bg-red-50 p-4 border border-red-200">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 via-zinc-100 to-white py-8">
      <div className="mx-auto max-w-5xl px-4 space-y-6">
        <div className="overflow-hidden rounded-[2rem] bg-white p-6 shadow-[0_28px_70px_-32px_rgba(15,23,42,0.18)] ring-1 ring-zinc-200">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-amber-700">Panel admin</p>
              <h1 className="mt-3 text-3xl font-semibold text-zinc-900">Turnos y estado</h1>
              <p className="mt-2 text-zinc-600">Administra la generación de turnos y avisa al próximo colaborador con un enlace seguro.</p>
            </div>
            <div className="flex items-center gap-4 rounded-3xl bg-zinc-50 px-4 py-3">
              <Image
                src="/branding/LOGO_ID_POSITIVO.png"
                width={120}
                height={34}
                alt="Interdoors"
                className="h-10 w-auto"
              />
              <Image
                src="/branding/Fondo-Buen-Trato.png"
                width={72}
                height={72}
                alt="Actividad Cadena de gratitud"
                className="h-16 w-16 rounded-3xl bg-white p-2"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <section className="space-y-6">
            <div className="rounded-[1.75rem] bg-white p-6 shadow-[0_18px_48px_-28px_rgba(15,23,42,0.18)] ring-1 ring-zinc-200">
              <h2 className="text-xl font-semibold text-zinc-900 mb-3">Turno actual</h2>
              {pendingToken ? (
                <PendingTurnoCard
                  token={pendingToken.token}
                  forName={pendingToken.for_name}
                  baseUrl={process.env.NEXT_PUBLIC_APP_URL?.trim() ?? ""}
                />
              ) : (
                <div className="rounded-[1.5rem] bg-amber-50 p-5 text-sm text-amber-800 ring-1 ring-amber-200">
                  No hay turnos pendientes
                </div>
              )}
            </div>

            <div className="rounded-[1.75rem] bg-white p-6 shadow-[0_18px_48px_-28px_rgba(15,23,42,0.18)] ring-1 ring-zinc-200">
              <h2 className="text-xl font-semibold text-zinc-900 mb-4">Sembrar turnos iniciales</h2>

              {error && (
                <div className="mb-4 rounded-3xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
                  {error}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-zinc-700">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="mt-2 w-full rounded-3xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Participantes</label>
                  <div className="space-y-3 max-h-44 overflow-y-auto rounded-3xl border border-zinc-300 bg-zinc-50 p-4">
                    {participants.length === 0 ? (
                      <p className="text-sm text-zinc-500">No hay participantes disponibles</p>
                    ) : (
                      participants.map((p) => (
                        <label key={p.id} className="flex items-center gap-3 cursor-pointer rounded-2xl px-3 py-2 transition hover:bg-white/80">
                          <input
                            type="checkbox"
                            checked={selectedParticipants.includes(p.name)}
                            onChange={() => handleToggleParticipant(p.name)}
                            className="h-4 w-4 rounded border-zinc-300 text-amber-600"
                          />
                          <span className="text-sm text-zinc-800">{p.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <button
                  onClick={handleCreateInitialTokens}
                  disabled={creatingTokens || selectedParticipants.length === 0}
                  className="w-full rounded-3xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:bg-zinc-400 disabled:cursor-not-allowed"
                >
                  {creatingTokens ? "Creando..." : `Crear ${quantity} turno${quantity !== 1 ? "s" : ""}`}
                </button>
              </div>

              {createdTokens.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-sm font-semibold text-zinc-800">Turnos creados ({createdTokens.length})</h3>
                  <div className="space-y-3">
                    {createdTokens.map((t, i) => (
                      <TokenItemCard
                        key={i}
                        token={t.token}
                        forName={t.for_name}
                        baseUrl={process.env.NEXT_PUBLIC_APP_URL?.trim() ?? ""}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[1.75rem] bg-amber-50 p-6 shadow-[0_18px_48px_-28px_rgba(15,23,42,0.18)] ring-1 ring-amber-200">
              <h2 className="text-xl font-semibold text-amber-900">Acceso seguro</h2>
              <p className="mt-3 text-sm text-zinc-700">Mantén &ldquo;?key=empanada&rdquo; para ingresar al panel administrativo y conservar el flujo actual del sistema.</p>
            </div>
            <div className="rounded-[1.75rem] bg-white p-6 shadow-[0_18px_48px_-28px_rgba(15,23,42,0.18)] ring-1 ring-zinc-200">
              <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Panel a la vista</p>
              <p className="mt-4 text-zinc-700">Este espacio mantiene la funcionalidad actual de ver el turno pendiente, abrirlo, copiar el enlace y enviar por WhatsApp sin cambios.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function TokenItemCard({
  token,
  forName,
  baseUrl,
}: {
  token: string;
  forName: string;
  baseUrl: string;
}) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const resolvedBaseUrl = baseUrl || (typeof window !== "undefined" ? window.location.origin : "");
  const tokenUrl = `${resolvedBaseUrl}/turno/${token}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(tokenUrl);
      setStatusMessage("Link copiado");
      setTimeout(() => setStatusMessage(null), 2000);
    } catch {
      setStatusMessage("Error al copiar");
      setTimeout(() => setStatusMessage(null), 2000);
    }
  };

  const sendWhatsapp = () => {
    const message = `Hola! Te paso este link para dejar un turno de agradecimiento:\n\n${tokenUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="rounded-[1.5rem] bg-zinc-50 p-4 border border-zinc-200 text-sm shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-zinc-800">Para: {forName}</p>
          <p className="mt-1 text-xs text-zinc-500 break-all">{token}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={copyLink}
            className="rounded-full bg-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-800 transition hover:bg-zinc-300"
          >
            Copiar
          </button>
          <button
            onClick={sendWhatsapp}
            className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
          >
            WhatsApp
          </button>
        </div>
      </div>
      {statusMessage && <p className="mt-3 text-xs text-blue-600">{statusMessage}</p>}
    </div>
  );
}
