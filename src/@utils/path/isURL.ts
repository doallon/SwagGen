/**
 * Checks if a given string is a valid URL.
 * @param str - The string to check.
 * @returns True if the string is a valid URL, false otherwise.
 */

export function isURL(str: string): boolean {
    try {
        const url = new URL(str);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}
