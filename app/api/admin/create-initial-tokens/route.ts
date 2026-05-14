import { getParticipants, createToken } from "@/lib/turnos";

export async function POST(request: Request) {
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
    const body = await request.json();
    const { quantity, participantNames } = body;

    if (!quantity || quantity < 1 || quantity > 100) {
      return new Response(
        JSON.stringify({ error: "Cantidad debe estar entre 1 y 100" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!participantNames || !Array.isArray(participantNames) || participantNames.length === 0) {
      return new Response(
        JSON.stringify({ error: "Selecciona al menos un participante" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const createdTokens: Array<{
      token: string;
      for_name: string;
      created_at: string;
    }> = [];

    // Crear quantity tokens, alternando o repitiendo los participantes seleccionados
    for (let i = 0; i < quantity; i++) {
      const participantIndex = i % participantNames.length;
      const forName = participantNames[participantIndex];

      const token = await createToken(forName);
      createdTokens.push({
        token,
        for_name: forName,
        created_at: new Date().toISOString(),
      });
    }

    return new Response(JSON.stringify({ createdTokens }), {
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
