export function formatDate(value) {
  if (!value) return "";

  // Si viene ISO "YYYY-MM-DDT..." o "YYYY-MM-DD ..."
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  }

  // fallback si viene Date/number
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}


function parseToDate(input) {
  if (!input) return null;

  // Si ya es Date
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }

  const s = String(input).trim();
  if (!s) return null;

  // ISO con hora (ej: 2026-01-30T12:00:00.000Z)
  if (s.includes("T")) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  // MySQL DATE: YYYY-MM-DD
  const m1 = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m1) {
    const [, y, mo, da] = m1;
    const d = new Date(Number(y), Number(mo) - 1, Number(da));
    return isNaN(d.getTime()) ? null : d;
  }

  // MySQL DATETIME: YYYY-MM-DD HH:mm:ss
  const m2 = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (m2) {
    const [, y, mo, da, hh, mm, ss] = m2;
    const d = new Date(
      Number(y),
      Number(mo) - 1,
      Number(da),
      Number(hh),
      Number(mm),
      Number(ss ?? 0)
    );
    return isNaN(d.getTime()) ? null : d;
  }

  // Fallback
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}
