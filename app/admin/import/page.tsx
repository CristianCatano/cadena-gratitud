"use client";

import { useState } from "react";

type ImportResult = {
  inserted: number;
  updated: number;
  failed: Array<{ name: string; phone: string; reason: string }>;
};

export default function AdminImportPage() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [adminKey, setAdminKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setResult(null);

    if (!csvFile) {
      setError("Selecciona un archivo CSV para importar.");
      return;
    }

    setLoading(true);

    try {
      const csvText = await csvFile.text();
      const response = await fetch("/api/admin/import-participants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ csv: csvText, adminKey }),
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json.error || "Error al importar participantes.");
      } else {
        setResult(json);
        setMessage("Importación completada.");
      }
    } catch (catchError) {
      setError("No se pudo procesar el archivo. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 p-4">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">Importar participantes</h1>
        <p className="mt-2 text-zinc-600">
          Sube un CSV con columnas <span className="font-semibold">name</span> y <span className="font-semibold">phone</span>.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700">Archivo CSV</label>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => setCsvFile(event.target.files?.[0] ?? null)}
              className="mt-2 w-full text-sm text-zinc-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">Clave admin</label>
            <input
              type="password"
              value={adminKey}
              onChange={(event) => setAdminKey(event.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none"
              placeholder="Ingresa la clave de importación"
            />
          </div>

          {error ? (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>
          ) : null}

          {message ? (
            <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-500"
          >
            {loading ? "Importando..." : "Importar participantes"}
          </button>
        </form>

        {result ? (
          <div className="mt-6 space-y-4 rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
            <div className="text-sm text-zinc-700">
              Insertados: <span className="font-semibold text-zinc-900">{result.inserted}</span>
            </div>
            <div className="text-sm text-zinc-700">
              Actualizados: <span className="font-semibold text-zinc-900">{result.updated}</span>
            </div>

            {result.failed.length > 0 ? (
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">Fallidos</h2>
                <ul className="mt-2 space-y-2 text-sm text-zinc-700">
                  {result.failed.map((item, index) => (
                    <li key={index} className="rounded-xl bg-white p-3 shadow-sm">
                      <div className="font-medium text-zinc-900">{item.name || "(sin nombre)"}</div>
                      <div className="text-zinc-600">{item.phone || "(sin teléfono)"}</div>
                      <div className="mt-1 text-xs text-red-700">{item.reason}</div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-8 rounded-3xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-600">
          <p className="font-semibold text-zinc-900">Ejemplo de CSV</p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-white p-3 text-xs text-zinc-800">
name,phone
Ana,+573001234567
Carlos,3009876543
          </pre>
        </div>
      </div>
    </main>
  );
}
