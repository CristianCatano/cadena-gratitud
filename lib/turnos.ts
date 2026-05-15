// lib/turnos.ts
import {
  dbGetStories,
  dbGetParticipants,
  dbGetToken,
  dbSubmitTurno,
  dbCreateToken as _dbCreateToken,
} from "@/lib/turnos_db";

import { getSupabaseAdmin } from "@/lib/supabase/server";

// ====== API “bonita” (la que usan las pages/components) ======
export async function getStories() {
  return dbGetStories();
}

export async function getParticipants() {
  const all = await dbGetParticipants();
  return all.filter((p) => p.active).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getToken(token: string) {
  return dbGetToken(token);
}

export async function submitTurno(token: string, a: string, b: string, text: string) {
  return dbSubmitTurno(token, a, b, text);
}

// ====== COMPATIBILIDAD (para rutas antiguas que importan desde "@/lib/turnos") ======
// Algunas rutas tuyas hacen: import { dbCreateToken } from "@/lib/turnos";
// Otras hacen: import { createToken } from "@/lib/turnos";
export async function dbCreateToken(forName: string) {
  return _dbCreateToken(forName);
}
export const createToken = dbCreateToken;

// ====== TURNOS PENDIENTES (para Home / muro público) ======
export async function getLatestPendingToken(): Promise<{
  token: string;
  for_name: string;
  used: boolean;
  created_at: string;
} | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("tokens")
    .select("token, for_name, used, created_at")
    .eq("used", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? null;
}