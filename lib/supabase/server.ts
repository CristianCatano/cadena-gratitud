// lib/supabase/server.ts
import { createClient } from "@supabase/supabase-js";

function required(name: string, value: string | undefined) {
  const v = (value ?? "").trim();
  if (!v) throw new Error(`Missing ${name} in environment variables`);
  return v;
}

/**
 * Admin client (Service Role) — SOLO servidor
 */
export function getSupabaseAdmin() {
  const supabaseUrl = required("SUPABASE_URL", process.env.SUPABASE_URL);
  const serviceRoleKey = required(
    "SUPABASE_SERVICE_ROLE_KEY",
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

/**
 * ✅ Export de compatibilidad: muchos archivos importan `supabaseAdmin`
 * y Vercel estaba fallando porque no existía.
 */
export const supabaseAdmin = getSupabaseAdmin();