// Minimum prep lead time validation for homemade food
const NIGHT_START = 21; // 9 PM
const NIGHT_END = 6;    // 6 AM
const MIN_LEAD_HOURS = 8;
const NIGHT_LEAD_HOURS = 12; // extra buffer for nighttime orders

/**
 * Returns null if OK, or an error message if the event is too soon.
 * Night = 9 PM – 6 AM: orders during night hours get extra lead time.
 */
export const checkMinPrepTime = (eventDate: string, servingTime: string): string | null => {
  if (!eventDate || !servingTime) return null;

  // Parse serving time — could be "HH:MM" or label like "8:00 AM"
  let hours = 0, minutes = 0;
  const match24 = servingTime.match(/^(\d{1,2}):(\d{2})$/);
  const matchLabel = servingTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match24) {
    hours = parseInt(match24[1]);
    minutes = parseInt(match24[2]);
  } else if (matchLabel) {
    hours = parseInt(matchLabel[1]);
    minutes = parseInt(matchLabel[2]);
    const ampm = matchLabel[3].toUpperCase();
    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
  } else {
    return null; // can't parse, skip validation
  }

  const eventDateTime = new Date(`${eventDate}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`);
  const now = new Date();
  const diffHours = (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  // Determine if event falls in nighttime window
  const isNight = hours >= NIGHT_START || hours < NIGHT_END;
  const requiredHours = isNight ? NIGHT_LEAD_HOURS : MIN_LEAD_HOURS;

  if (diffHours < requiredHours) {
    return `🏠 Homemade food needs at least ${requiredHours} hours to prepare. Please choose a later date or time. (Current lead: ${Math.max(0, Math.round(diffHours))}h)`;
  }
  return null;
};
