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
    <section className="rounded-[1.75rem] border border-zinc-200 bg-white p-6 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.18)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-amber-700">Turno activo</p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-900">Agradecimiento para {forName}</h2>
        </div>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-800">
          En espera
        </span>
      </div>

      <div className="mt-4 rounded-[1.5rem] border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-800 break-words">
        <span className="font-medium text-zinc-700">Link:</span>
        <div className="mt-2 text-emerald-700">{tokenUrl}</div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={`/turno/${token}`}
          className="rounded-full bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700"
        >
          Abrir turno
        </a>
        <button
          type="button"
          onClick={copyLink}
          className="rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
        >
          Copiar link
        </button>
        <button
          type="button"
          onClick={sendWhatsapp}
          className="rounded-full bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-500"
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
