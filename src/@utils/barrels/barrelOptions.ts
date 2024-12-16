


export interface BarrelOptions {
    overwriteExisting?: boolean; // Overwrite existing barrel files
    includeTestFiles?: boolean; // Include test files
    excludedDirectories?: string[]; // Directories to exclude
    logLevel?: "none" | "basic" | "verbose"; // Logging level
}
