import { NextResponse } from "next/server";
import { submitTurno } from "@/lib/turnos";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const body = await req.json();
    const a = String(body.a ?? "").trim();
    const b = String(body.b ?? "").trim();
    const text = String(body.text ?? "").trim();

    if (!a || !b || !text) {
      return NextResponse.json(
        { ok: false, error: "Faltan datos (a, b, text)" },
        { status: 400 }
      );
    }

    const nextToken = await submitTurno(token, a, b, text);

    return NextResponse.json({ ok: true, nextToken });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Error" },
      { status: 400 }
    );
  }
}