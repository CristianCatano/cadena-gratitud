"use client";

import { useSearchParams } from "next/navigation";

export default function PanelClient() {
  const searchParams = useSearchParams();
  const adminKey = searchParams.get("admin") || "";

  // 👇 aquí va tu UI real del panel (esto es un ejemplo mínimo)
  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Admin panel</h1>
      <p style={{ marginTop: 8 }}>
        admin query param: <b>{adminKey || "(vacío)"}</b>
      </p>

      {/* TODO: pega aquí el contenido real de tu panel actual */}
    </div>
  );
}