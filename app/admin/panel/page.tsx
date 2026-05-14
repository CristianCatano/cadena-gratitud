// app/admin/panel/page.tsx
import { Suspense } from "react";
import AdminPanelClient from "./AdminPanelClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-zinc-50 p-4">
          <div className="mx-auto max-w-xl">
            <p className="text-zinc-600">Cargando admin…</p>
          </div>
        </main>
      }
    >
      <AdminPanelClient />
    </Suspense>
  );
}