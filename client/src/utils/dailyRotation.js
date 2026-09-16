/**
 * Utility for deterministic, calendar-day-based product rotation.
 * Ensures items consistently change every calendar day (at midnight)
 * while remaining stable and reproducible across page refreshes during the day.
 */

/**
 * Returns an integer seed for the given day (e.g. 20260909 for 9th Sep 2026).
 * @param {number} offsetDays - Optional day offset (e.g. 1 for tomorrow)
 */
export const getDaySeed = (offsetDays = 0) => {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
};

/**
 * Converts a string into a positive 32-bit integer hash for salting.
 */
export const hashString = (str) => {
  if (!str) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

/**
 * Deterministically shuffles an array based on the current calendar day.
 * Uses a linear congruential generator (LCG) Fisher-Yates shuffle.
 *
 * @param {Array} items - The source items to rotate
 * @param {number|string} salt - Additional unique salt (e.g., collection ID)
 * @returns {Array} Shuffled copy of items for today
 */
export const getDailyRotatedItems = (items, salt = 0) => {
  if (!items || !Array.isArray(items) || items.length <= 1) {
    return items || [];
  }

  const saltNum = typeof salt === "string" ? hashString(salt) : Number(salt) || 0;
  const daySeed = getDaySeed() + saltNum;

  const copy = [...items];
  let seed = daySeed;

  for (let i = copy.length - 1; i > 0; i--) {
    // LCG pseudo-random step
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
};

/**
 * Computes hours, minutes, and seconds remaining until the next midnight (00:00:00).
 */
export const getTimeUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);

  const diffMs = Math.max(0, midnight.getTime() - now.getTime());
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);

  return { hours, minutes, seconds };
};
