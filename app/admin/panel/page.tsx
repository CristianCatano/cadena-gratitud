// app/admin/panel/page.tsx
import { Suspense } from "react";
import AdminPanelClient from "./AdminPanelClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-zinc-500">Cargando…</div>}>
      <AdminPanelClient />
    </Suspense>
  );
}