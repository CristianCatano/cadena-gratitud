"use client";

import { useState } from "react";

type Props = {
  token: string;
  participants: string[];
  forName: string;
};

export default function TurnoForm({ token, participants, forName }: Props) {
  const [name, setName] = useState(forName);
  const [selectedPerson, setSelectedPerson] = useState(participants[0] ?? "");
  const [text, setText] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);
    setCopyStatus(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/turno/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a: name, b: selectedPerson, text }),
      });

      const json = await response.json();
      if (!response.ok) {
        setErrorMessage(json.error || "Ocurrió un error inesperado.");
        return;
      }

      const newToken = json.nextToken;
      setNextToken(newToken);
      setStatusMessage("Turno enviado. Se generó un nuevo token para la siguiente persona.");
      setText("");
    } catch (error) {
      setErrorMessage("Error al enviar el formulario. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!nextToken) {
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || window.location.origin;
    const nextUrl = `${baseUrl}/turno/${nextToken}`;

    try {
      await navigator.clipboard.writeText(nextUrl);
      setCopyStatus("Link copiado. Pégalo donde quieras.");
    } catch (error) {
      setCopyStatus("No se pudo copiar el link automáticamente. Copia el enlace manualmente.");
    }
  };

  const sendWhatsapp = () => {
    if (!nextToken) {
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || window.location.origin;
    const nextUrl = `${baseUrl}/turno/${nextToken}`;
    const message = `Hola! Te paso este link para dejar un turno de agradecimiento:\n\n${nextUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <form onSubmit={submitForm} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700">Tu nombre (A)</label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none"
            placeholder="Escribe tu nombre"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700">Elegir a la persona seleccionada (B)</label>
          <select
            value={selectedPerson}
            onChange={(event) => setSelectedPerson(event.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none"
          >
            {participants.map((person) => (
              <option key={person} value={person}>
                {person}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700">Texto corto de agradecimiento</label>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={5}
            maxLength={300}
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none"
            placeholder="Escribe un agradecimiento breve (máx 300 caracteres)"
          />
          <p className="mt-1 text-xs text-zinc-500">{text.length} / 300 caracteres</p>
        </div>

        {errorMessage ? (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{errorMessage}</div>
        ) : null}

        {statusMessage ? (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">{statusMessage}</div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-500"
          >
            {loading ? "Enviando..." : "Enviar agradecimiento"}
          </button>

          {nextToken ? (
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

        {copyStatus ? <p className="text-sm text-zinc-600">{copyStatus}</p> : null}
      </form>
    </div>
  );
}
