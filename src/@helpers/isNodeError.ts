

// Node.js dosya sistemi hatalarını kontrol etmek için yardımcı bir tür koruyucu
export function isNodeError(error: unknown): error is NodeJS.ErrnoException {
    return typeof error === "object" && error !== null && "code" in error;
}
