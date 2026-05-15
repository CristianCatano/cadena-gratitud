// lib/turnos_db.ts
import { getSupabaseAdmin } from "@/lib/supabase/server";

export type Participant = {
  id: string;
  name: string;
  phone: string | null;
  active: boolean;
  created_at: string;
};

export type Story = {
  id: string;
  a_name: string;
  b_name: string;
  text: string;
  created_at: string;
};

export type TokenRecord = {
  token: string;
  for_name: string;
  used: boolean;
  created_at: string;
};

function supabase() {
  return getSupabaseAdmin();
}

function generateToken(): string {
  return `turno-${Math.random().toString(36).slice(2, 10)}`;
}

export async function dbGetParticipants(): Promise<Participant[]> {
  const { data, error } = await supabase()
    .from("participants")
    .select("id, name, phone, active, created_at")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function dbGetStories(): Promise<Story[]> {
  const { data, error } = await supabase()
    .from("stories")
    .select("id, a_name, b_name, text, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function dbGetToken(token: string): Promise<TokenRecord | null> {
  const { data, error } = await supabase()
    .from("tokens")
    .select("token, for_name, used, created_at")
    .eq("token", token)
    .single();

  if (error) {
    if ((error as any).code === "PGRST116") return null; // no rows
    throw new Error(error.message);
  }

  return data;
}

export async function dbCreateToken(forName: string): Promise<string> {
  const token = generateToken();

  const { error } = await supabase().from("tokens").insert([
    {
      token,
      for_name: forName,
      used: false,
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) throw new Error(error.message);
  return token;
}

export async function dbSubmitTurno(
  token: string,
  a: string,
  b: string,
  text: string
): Promise<string> {
  const existingToken = await dbGetToken(token);

  if (!existingToken || existingToken.used) {
    throw new Error("Token inválido o ya usado.");
  }

  const { error: updateError } = await supabase()
    .from("tokens")
    .update({ used: true })
    .eq("token", token);

  if (updateError) throw new Error(updateError.message);

  const { error: storyError } = await supabase().from("stories").insert([
    {
      a_name: a,
      b_name: b,
      text,
      created_at: new Date().toISOString(),
    },
  ]);

  if (storyError) throw new Error(storyError.message);

  return await dbCreateToken(b);
}

export async function dbUpsertParticipants(
  rows: Array<{ name: string; phone: string }>
): Promise<{
  inserted: number;
  updated: number;
  failed: Array<{ name: string; phone: string; reason: string }>;
}> {
  const failed: Array<{ name: string; phone: string; reason: string }> = [];
  const cleanRows = rows.filter((r) => r?.name && r?.phone);

  if (cleanRows.length === 0) return { inserted: 0, updated: 0, failed };

  const phones = cleanRows.map((r) => r.phone);

  const { data: existingData, error: existingError } = await supabase()
    .from("participants")
    .select("phone")
    .in("phone", phones);

  if (existingError) throw new Error(existingError.message);

  const existingPhones = new Set((existingData ?? []).map((x: any) => x.phone));

  const toInsert: Array<{ name: string; phone: string; active: boolean }> = [];
  const toUpdate: Array<{ name: string; phone: string; active: boolean }> = [];

  for (const r of cleanRows) {
    const payload = { name: r.name, phone: r.phone, active: true };
    if (existingPhones.has(r.phone)) toUpdate.push(payload);
    else toInsert.push(payload);
  }

  if (toInsert.length > 0) {
    const { error } = await supabase().from("participants").insert(toInsert);
    if (error) {
      for (const r of toInsert) {
        failed.push({ name: r.name, phone: r.phone, reason: error.message });
      }
    }
  }

  let updatedOk = 0;
  for (const r of toUpdate) {
    const { error } = await supabase()
      .from("participants")
      .update({ name: r.name, active: true })
      .eq("phone", r.phone);

    if (error) {
      failed.push({ name: r.name, phone: r.phone, reason: error.message });
    } else {
      updatedOk += 1;
    }
  }

  const failedPhones = new Set(failed.map((f) => f.phone));
  const insertedOk = toInsert.filter((r) => !failedPhones.has(r.phone)).length;

  return { inserted: insertedOk, updated: updatedOk, failed };
}