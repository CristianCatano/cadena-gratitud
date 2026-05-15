"use client";

import { useState } from "react";

type Props = {
  token: string;
  participants: string[];
  forName: string;
};

const emojiSuggestions = ["🙌", "😊", "👏", "💛", "🎉"];

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

  const addEmoji = (emoji: string) => {
    setText((prev) => `${prev}${emoji}`);
  };

  return (
    <div className="rounded-[1.75rem] bg-white p-6 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.18)] ring-1 ring-zinc-200">
      <form onSubmit={submitForm} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-zinc-700">Tu nombre (A)</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
              placeholder="Escribe tu nombre"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700">Persona seleccionada (B)</label>
            <select
              value={selectedPerson}
              onChange={(event) => setSelectedPerson(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
            >
              {participants.map((person) => (
                <option key={person} value={person}>
                  {person}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-semibold text-zinc-700">Texto corto de agradecimiento</label>
            <span className="text-xs text-zinc-500">Máx 300 caracteres</span>
          </div>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={6}
            maxLength={300}
            className="mt-3 h-36 w-full rounded-[1.5rem] border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm leading-6 text-zinc-900 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
            placeholder="Escribe un agradecimiento breve y cercano"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {emojiSuggestions.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => addEmoji(emoji)}
                className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm transition hover:border-amber-300 hover:bg-amber-50"
              >
                {emoji}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-zinc-500">Puedes agregar emojis para darle un toque más cercano.</p>
        </div>

        {errorMessage ? (
          <div className="rounded-3xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
            {errorMessage}
          </div>
        ) : null}

        {statusMessage ? (
          <div className="rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-700 ring-1 ring-emerald-200">
            {statusMessage}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-3xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-500"
          >
            {loading ? "Enviando..." : "Enviar agradecimiento"}
          </button>
          {nextToken ? (
            <>
              <button
                type="button"
                onClick={copyLink}
                className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                Copiar link
              </button>
              <button
                type="button"
                onClick={sendWhatsapp}
                className="rounded-3xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500"
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
