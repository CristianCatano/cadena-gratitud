import { Suspense } from "react";
import AdminPanelClient from "./AdminPanelClient";

function getBaseUrl() {
  // En Vercel: VERCEL_URL viene sin https
  if (process.env.NEXT_PUBLIC_APP_URL?.trim()) return process.env.NEXT_PUBLIC_APP_URL.trim();
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "";
}

export default function AdminPanelPage() {
  const baseUrl = getBaseUrl();

  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-zinc-50 p-4">
          <div className="mx-auto max-w-xl">
            <p className="text-zinc-600">Cargando admin...</p>
          </div>
        </main>
      }
    >
      <AdminPanelClient baseUrl={baseUrl} />
    </Suspense>
  );
}