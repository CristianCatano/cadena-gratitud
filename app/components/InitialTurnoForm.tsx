"use client";

import { useState } from "react";

type Participant = {
  id: string;
  name: string;
  phone: string | null;
  active: boolean;
  created_at: string;
};

type Props = {
  participants: Participant[];
};

export default function InitialTurnoForm({ participants }: Props) {
  const [selectedPerson, setSelectedPerson] = useState(participants[0]?.name ?? "");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const createTurno = async () => {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL?.trim() ||
      (typeof window !== "undefined" ? window.location.origin : "");

    if (!selectedPerson) {
      setErrorMessage("Selecciona un participante activo.");
      return;
    }

    setErrorMessage(null);
    setStatusMessage(null);
    setCreatedLink(null);
    setLoading(true);

    try {
      const response = await fetch("/api/turno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forName: selectedPerson }),
      });

      const json = await response.json();
      if (!response.ok || !json.ok) {
        setErrorMessage(json.error || "No se pudo crear el turno inicial.");
        return;
      }

      const nextLink = `${baseUrl}/turno/${json.token}`;
      setCreatedLink(nextLink);
      setStatusMessage("Turno inicial creado. Comparte el link con la siguiente persona.");
    } catch (error) {
      setErrorMessage("Error al crear el turno. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!createdLink) return;

    try {
      await navigator.clipboard.writeText(createdLink);
      setStatusMessage("Link copiado. Pégalo en tu chat o WhatsApp.");
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage("No se pudo copiar el link automáticamente.");
    }
  };

  const sendWhatsapp = () => {
    if (!createdLink) return;

    const message = `Hola! Te paso este link para dejar un turno de agradecimiento:\n\n${createdLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
  };

  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-zinc-900">Crear turno inicial</h2>
      <p className="mt-2 text-sm text-zinc-600">
        Elige un participante activo y genera un token para iniciar la cadena.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700">Participante activo</label>
          <select
            value={selectedPerson}
            onChange={(event) => setSelectedPerson(event.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none"
          >
            {participants.length === 0 ? (
              <option value="" disabled>
                No hay participantes activos
              </option>
            ) : (
              participants.map((participant) => (
                <option key={participant.id} value={participant.name}>
                  {participant.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={createTurno}
            disabled={loading || participants.length === 0}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-500"
          >
            {loading ? "Creando..." : "Crear turno"}
          </button>

          {createdLink ? (
            <>
              <button
                type="button"
                onClick={copyLink}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                Copiar link
              </button>
              <button
                type="button"
                onClick={sendWhatsapp}
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500"
              >
                Enviar por WhatsApp
              </button>
            </>
          ) : null}
        </div>

        {createdLink ? (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-800">
            <span className="font-medium">Link generado:</span>
            <div className="mt-1 break-all text-emerald-700">{createdLink}</div>
            <p className="mt-2 text-xs text-zinc-500">
              Si estás en modo local, configura NEXT_PUBLIC_APP_URL para compartir en red o producción.
            </p>
          </div>
        ) : null}

        {statusMessage ? (
          <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{statusMessage}</div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{errorMessage}</div>
        ) : null}
      </div>
    </section>
  );
}
