import { NextResponse } from "next/server";
import { dbCreateToken } from "@/lib/turnos";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const forName = String(body.forName ?? "").trim();

    if (!forName) {
      return NextResponse.json(
        { ok: false, error: "Selecciona un participante activo." },
        { status: 400 }
      );
    }

    const token = await dbCreateToken(forName);
    return NextResponse.json({ ok: true, token });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Error al crear el turno inicial." },
      { status: 400 }
    );
  }
}
