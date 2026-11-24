/* 
 * garden.ts
 * 
 * Helpers for querying the garden!
 */

export function fmt_date(date: Date) {
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}
