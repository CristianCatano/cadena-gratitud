// lib/turnos.ts
import {
  dbGetStories,
  dbGetParticipants,
  dbGetToken,
  dbSubmitTurno,
} from "@/lib/turnos_db";

export async function getStories() {
  return dbGetStories();
}

export async function getParticipants() {
  // si quieres solo activos, lo filtras aquí
  const all = await dbGetParticipants();
  return all.filter((p) => p.active).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getToken(token: string) {
  return dbGetToken(token);
}

export async function submitTurno(token: string, a: string, b: string, text: string) {
  return dbSubmitTurno(token, a, b, text);
}