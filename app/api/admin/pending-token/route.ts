import { getLatestPendingToken } from "@/lib/turnos";

export async function GET(request: Request) {
  const adminKey = request.headers.get("X-Admin-Key");

  const adminViewKey = (process.env.ADMIN_VIEW_KEY ?? "").trim();
  const adminImportKey = (process.env.ADMIN_IMPORT_KEY ?? "").trim();
  const validKey = adminViewKey || adminImportKey;

  if (!validKey || !adminKey || adminKey !== validKey) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const tokenRecord = await getLatestPendingToken();
    return new Response(JSON.stringify({ tokenRecord }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Error desconocido" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
