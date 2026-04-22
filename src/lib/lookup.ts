import { PARTICIPANTS, type Participant } from "@/data/participants";

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
const digits = (s: string) => s.replace(/\D/g, "");

export function findParticipant(query: string): Participant[] {
  const q = norm(query);
  if (!q) return [];
  const qd = digits(q);

  const exact = PARTICIPANTS.filter((p) => {
    if (qd.length >= 6 && p.reg && digits(p.reg) === qd) return true;
    if (qd.length >= 8 && p.phone && digits(p.phone).endsWith(qd.slice(-10)))
      return true;
    if (p.email && norm(p.email) === q) return true;
    if (norm(p.name) === q) return true;
    return false;
  });
  if (exact.length) return exact;

  // Partial name fallback
  return PARTICIPANTS.filter((p) => norm(p.name).includes(q)).slice(0, 8);
}
