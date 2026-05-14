// lib/turnos_db.ts
import { supabaseAdmin } from "@/lib/supabase/server";

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

function generateToken(): string {
  return `turno-${Math.random().toString(36).slice(2, 10)}`;
}

/** PARTICIPANTES **/
export async function dbGetParticipants(): Promise<Participant[]> {
  const { data, error } = await supabaseAdmin
    .from("participants")
    .select("id, name, phone, active, created_at")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Participant[];
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

  // 1) ver cuáles ya existen
  const { data: existingData, error: existingError } = await supabaseAdmin
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

  // 2) insertar nuevos
  if (toInsert.length > 0) {
    const { error } = await supabaseAdmin.from("participants").insert(toInsert);
    if (error) {
      for (const r of toInsert) failed.push({ name: r.name, phone: r.phone, reason: error.message });
    }
  }

  // 3) actualizar existentes (uno por uno: estable)
  let updatedOk = 0;
  for (const r of toUpdate) {
    const { error } = await supabaseAdmin
      .from("participants")
      .update({ name: r.name, active: true })
      .eq("phone", r.phone);

    if (error) failed.push({ name: r.name, phone: r.phone, reason: error.message });
    else updatedOk += 1;
  }

  const failedPhones = new Set(failed.map((f) => f.phone));
  const insertedOk = toInsert.filter((r) => !failedPhones.has(r.phone)).length;

  return { inserted: insertedOk, updated: updatedOk, failed };
}

/** STORIES **/
export async function dbGetStories(): Promise<Story[]> {
  const { data, error } = await supabaseAdmin
    .from("stories")
    .select("id, a_name, b_name, text, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Story[];
}

export async function dbHasPendingToken(): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("tokens")
    .select("token")
    .eq("used", false)
    .limit(1);

  if (error) throw new Error(error.message);
  return (data ?? []).length > 0;
}

export async function dbGetLatestPendingToken(): Promise<TokenRecord | null> {
  const { data, error } = await supabaseAdmin
    .from("tokens")
    .select("token, for_name, used, created_at")
    .eq("used", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data ?? null) as TokenRecord | null;
}

/** TOKENS **/
export async function dbGetToken(token: string): Promise<TokenRecord | null> {
  const { data, error } = await supabaseAdmin
    .from("tokens")
    .select("token, for_name, used, created_at")
    .eq("token", token)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data ?? null) as TokenRecord | null;
}

export async function dbCreateToken(forName: string): Promise<string> {
  const token = generateToken();
  const { error } = await supabaseAdmin.from("tokens").insert([
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

export async function dbSubmitTurno(token: string, a: string, b: string, text: string): Promise<string> {
  const tokenRecord = await dbGetToken(token);
  if (!tokenRecord || tokenRecord.used) {
    throw new Error("Token inválido o ya usado");
  }

  const { error: markError } = await supabaseAdmin.from("tokens").update({ used: true }).eq("token", token);
  if (markError) throw new Error(markError.message);

  const { error: storyError } = await supabaseAdmin.from("stories").insert([
    { a_name: a, b_name: b, text, created_at: new Date().toISOString() },
  ]);
  if (storyError) throw new Error(storyError.message);

  return await dbCreateToken(b);
}

export const getStories = dbGetStories;
export const getParticipants = dbGetParticipants;
export const hasPendingToken = dbHasPendingToken;
export const getLatestPendingToken = dbGetLatestPendingToken;
export const getToken = dbGetToken;
export const createToken = dbCreateToken;
export const submitTurno = dbSubmitTurno;
