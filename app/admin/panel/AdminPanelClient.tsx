"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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

export default function AdminPanelClient({ baseUrl }: { baseUrl: string }) {
  const searchParams = useSearchParams();
  const key = searchParams.get("key");

  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingToken, setPendingToken] = useState<TokenRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sembrar turnos
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
    <main className="min-h-screen bg-zinc-50 p-4">
      <div className="mx-auto max-w-xl space-y-6">
        <h1 className="text-2xl font-bold text-zinc-900">Admin Panel</h1>

        {/* Turno pendiente actual */}
        <section>
          <h2 className="text-lg font-semibold text-zinc-800 mb-3">Turno actual</h2>
          {pendingToken ? (
            <PendingTurnoCard token={pendingToken.token} forName={pendingToken.for_name} baseUrl={baseUrl} />
          ) : (
            <div className="rounded-xl bg-blue-50 p-4 border border-blue-200">
              <p className="text-sm text-blue-800">No hay turnos pendientes</p>
            </div>
          )}
        </section>

        {/* Sembrar turnos iniciales */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-800 mb-4">Sembrar turnos iniciales</h2>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 border border-red-200">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Cantidad */}
            <div>
              <label className="block text-sm font-medium text-zinc-700">Cantidad</label>
              <input
                type="number"
                min="1"
                max="100"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="mt-1 w-full px-3 py-2 border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Participantes */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">Participantes</label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-zinc-300 rounded-lg p-3 bg-zinc-50">
                {participants.length === 0 ? (
                  <p className="text-sm text-zinc-500">No hay participantes disponibles</p>
                ) : (
                  participants.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedParticipants.includes(p.name)}
                        onChange={() => handleToggleParticipant(p.name)}
                        className="w-4 h-4 rounded border-zinc-300 text-blue-600"
                      />
                      <span className="text-sm text-zinc-800">{p.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Botón crear */}
            <button
              onClick={handleCreateInitialTokens}
              disabled={creatingTokens || selectedParticipants.length === 0}
              className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-zinc-400 disabled:cursor-not-allowed transition"
            >
              {creatingTokens ? "Creando..." : `Crear ${quantity} turno${quantity !== 1 ? "s" : ""}`}
            </button>
          </div>

          {/* Lista de turnos creados */}
          {createdTokens.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-zinc-800 mb-3">
                Turnos creados ({createdTokens.length})
              </h3>
              <div className="space-y-2">
                {createdTokens.map((t, i) => (
                  <TokenItemCard key={i} token={t.token} forName={t.for_name} baseUrl={baseUrl} />
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function TokenItemCard({ token, forName, baseUrl }: { token: string; forName: string; baseUrl: string }) {
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
    <div className="rounded-lg bg-zinc-50 p-3 border border-zinc-200 text-sm">
      <div className="font-medium text-zinc-800 mb-1">Para: {forName}</div>
      <div className="text-xs text-zinc-500 mb-2 break-all">{token}</div>
      <div className="flex gap-2">
        <button
          onClick={copyLink}
          className="px-3 py-1 bg-zinc-300 text-zinc-800 rounded hover:bg-zinc-400 text-xs font-medium transition"
        >
          Copiar
        </button>
        <button
          onClick={sendWhatsapp}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs font-medium transition"
        >
          WhatsApp
        </button>
        {statusMessage && <span className="text-xs text-blue-600 self-center">{statusMessage}</span>}
      </div>
    </div>
  );
}