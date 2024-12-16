

export interface ResolveOptions {
    includeTestFiles?: boolean; // Include `.test.ts` files in the resolution.
    excludedDirectories?: string[]; // Directories to exclude from processing.
    logLevel?: "none" | "basic" | "verbose"; // Logging level for debugging.
    followSymlinks?: boolean; // Whether to follow symbolic links.
    resolveBarrelsOnly?: boolean; // Whether to resolve only from barrel files.
    includeExtensions?: string[]; // File extensions to include (e.g., `.ts`, `.tsx`).
    excludeFiles?: string[]; // Specific filenames to exclude (e.g., `index.ts`).
}
