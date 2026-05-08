"use client";

import { useState } from "react";

type Props = {
  token: string;
  forName: string;
  baseUrl?: string;
};

export default function PendingTurnoCard({ token, forName, baseUrl }: Props) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resolvedBaseUrl =
    baseUrl?.trim() || (typeof window !== "undefined" ? window.location.origin : "");
  const tokenUrl = `${resolvedBaseUrl}/turno/${token}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(tokenUrl);
      setStatusMessage("Link copiado. Pégalo en tu chat o WhatsApp.");
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage("No se pudo copiar el link automáticamente.");
      setStatusMessage(null);
    }
  };

  const sendWhatsapp = () => {
    const message = `Hola! Te paso este link para dejar un turno de agradecimiento:\n\n${tokenUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-zinc-900">Turno pendiente</h2>
      <p className="mt-2 text-sm text-zinc-700">
        Turno pendiente para: <span className="font-semibold text-zinc-900">{forName}</span>
      </p>

      <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-800 break-words">
        <span className="font-medium text-zinc-700">Link:</span>
        <div className="mt-1 text-emerald-700">{tokenUrl}</div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <a
          href={`/turno/${token}`}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
        >
          Abrir turno
        </a>
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
      </div>

      {statusMessage ? (
        <p className="mt-4 text-sm text-emerald-700">{statusMessage}</p>
      ) : null}
      {errorMessage ? (
        <p className="mt-4 text-sm text-red-700">{errorMessage}</p>
      ) : null}
    </section>
  );
}
