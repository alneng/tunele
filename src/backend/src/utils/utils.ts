import { DateTime } from "luxon";

/**
 * Returns a string representation of the current date and time in the specified timezone.
 *
 * @param options the options object containing the timezone
 * @returns the current date and time string in the format "yyyy-MM-dd HH:mm:ss"
 */
export function currentDateTimeString(
  options: { timezone: string } = { timezone: "America/New_York" },
): string {
  return DateTime.now().setZone(options.timezone).toFormat("yyyy-MM-dd HH:mm:ss");
}
