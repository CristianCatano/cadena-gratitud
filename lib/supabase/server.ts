// lib/supabase/server.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (process.env.SUPABASE_URL ?? "").trim();
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
}

// ✅ Nombre único oficial
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

// (Opcional) si Next alguna vez sugiere "supabase", dejamos alias seguro
export const supabase = supabaseAdmin;