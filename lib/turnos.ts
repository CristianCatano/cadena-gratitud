// lib/turnos.ts
import { dbGetStories, dbGetParticipants, dbGetToken, dbSubmitTurno } from "@/lib/turnos_db";
import { getSupabaseAdmin } from "@/lib/supabase/server";

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

/**
 * Devuelve el último token pendiente (used=false), o null si no hay.
 * Esto se usa en Home para mostrar el aviso "Hay un turno pendiente..."
 */
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