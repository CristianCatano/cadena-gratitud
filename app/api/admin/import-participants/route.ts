import { NextResponse } from "next/server";
import { dbUpsertParticipants } from "@/lib/turnos_db";

const ADMIN_IMPORT_KEY = (process.env.ADMIN_IMPORT_KEY ?? "").trim();

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values.map((value) => value.trim());
}

function parseCsvText(csv: string) {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    throw new Error("CSV vacío.");
  }

  const header = parseCsvLine(lines[0]).map((value) => value.toLowerCase());
  if (header[0] !== "name" || header[1] !== "phone") {
    throw new Error("Encabezado inválido. Debe ser: name,phone");
  }

  const rows = [] as Array<{ name: string; phone: string }>;
  for (let i = 1; i < lines.length; i += 1) {
    const values = parseCsvLine(lines[i]);
    if (values.length === 0 || (values.length === 1 && values[0] === "")) {
      continue;
    }
    rows.push({
      name: values[0] ?? "",
      phone: values[1] ?? "",
    });
  }

  return rows;
}

function normalizePhone(phone: string): string | null {
  const clean = phone.replace(/[^\d+]/g, "").replace(/^00/, "+").trim();

  // ya viene +57XXXXXXXXXX
  if (/^\+57\d{10}$/.test(clean)) return clean;

  // viene 3001234567 -> +573001234567
  if (/^\d{10}$/.test(clean)) return `+57${clean}`;

  return null;
}

export async function POST(request: Request) {
  try {
    if (!ADMIN_IMPORT_KEY) {
      return NextResponse.json({ ok: false, error: "ADMIN_IMPORT_KEY no configurada." }, { status: 500 });
    }

    const body = await request.json();
    const adminKey = String(body?.adminKey ?? "");
    const csv = String(body?.csv ?? "");

    if (adminKey !== ADMIN_IMPORT_KEY) {
      return NextResponse.json({ ok: false, error: "Clave admin incorrecta." }, { status: 403 });
    }

    if (!csv.trim()) {
      return NextResponse.json({ ok: false, error: "CSV vacío." }, { status: 400 });
    }

    // Parse CSV simple: name,phone
    const lines = csv.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      return NextResponse.json({ ok: false, error: "CSV sin datos." }, { status: 400 });
    }

    const header = lines[0].toLowerCase().replace(/\s/g, "");
    if (header !== "name,phone") {
      return NextResponse.json({ ok: false, error: "Encabezado inválido. Debe ser: name,phone" }, { status: 400 });
    }

    const rows: Array<{ name: string; phone: string }> = [];
    const failed: Array<{ name: string; phone: string; reason: string }> = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(",");
      const name = (parts[0] ?? "").trim();
      const phoneRaw = (parts[1] ?? "").trim();

      if (!name) {
        failed.push({ name: "", phone: phoneRaw, reason: "Nombre vacío" });
        continue;
      }

      const normalized = normalizePhone(phoneRaw);
      if (!normalized) {
        failed.push({ name, phone: phoneRaw, reason: "Teléfono inválido" });
        continue;
      }

      rows.push({ name, phone: normalized });
    }

    const result = await dbUpsertParticipants(rows);

    return NextResponse.json({
      ok: true,
      inserted: result.inserted,
      updated: result.updated,
      failed: [...failed, ...result.failed],
    });
  } catch (err: any) {
    console.error("IMPORT ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}