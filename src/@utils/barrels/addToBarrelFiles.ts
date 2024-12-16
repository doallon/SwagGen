/**
 * Adds a file or directory to the barrelFiles object.
 * @param barrelFiles The barrel files object.
 * @param directory The directory where the barrel file will be.
 * @param item The file or directory to be exported.
 */
export function addToBarrelFiles(
    barrelFiles: Record<string, Set<string>>,
    directory: string,
    item: string
): void {
    if (!barrelFiles[directory]) {
        barrelFiles[directory] = new Set();
    }
    barrelFiles[directory].add(item);
}
