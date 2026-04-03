export function parseDurationInput(input: string): number | null {
  const value = input.trim().toLowerCase();

  if (!value) {
    return null;
  }

  if (/^\d+(\.\d+)?$/.test(value)) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return null;
    }

    // Values <= 8 are interpreted as hours to support "1.5" style input.
    if (numeric <= 8 && value.includes(".")) {
      return Math.round(numeric * 60);
    }

    if (numeric <= 8 && !value.includes(".")) {
      return Math.round(numeric * 60);
    }

    return Math.round(numeric);
  }

  const hoursMatch = value.match(/(\d+(?:\.\d+)?)\s*h/);
  const minutesMatch = value.match(/(\d+(?:\.\d+)?)\s*m/);

  if (!hoursMatch && !minutesMatch) {
    return null;
  }

  const hours = hoursMatch ? Number(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? Number(minutesMatch[1]) : 0;

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }

  const totalMinutes = Math.round(hours * 60 + minutes);
  if (totalMinutes <= 0) {
    return null;
  }

  return totalMinutes;
}

export function formatMinutes(totalMinutes: number): string {
  const safeMinutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

export function formatHours(totalMinutes: number): string {
  const hours = totalMinutes / 60;
  if (hours >= 10) {
    return `${hours.toFixed(1)}h`;
  }

  return `${hours.toFixed(1)}h`;
}
