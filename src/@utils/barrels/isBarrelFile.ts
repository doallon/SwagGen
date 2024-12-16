

/**
 * Checks if the content represents a valid barrel file.
 * @param content The content of the file to check.
 * @returns True if the content is a barrel file, false otherwise.
 */
export function isBarrelFile(content: string): boolean {
    return content.split("\n").every((line) => {
        return (
            line.trim() === "" || // Empty lines
            line.startsWith("export * from './") || // Barrel exports
            line.startsWith("export {") // Named exports (optional, for custom barrels)
        );
    });
}
