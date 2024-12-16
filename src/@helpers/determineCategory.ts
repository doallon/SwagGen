import { generalTerms } from "../types/generalTerms";

/**
 * Determines the category of a schema based on its name.
 * @param schemaName The name of the schema.
 * @param knownCategories The list of known categories to validate against.
 * @param defaultCategory The default category if no match is found (default: 'common').
 * @returns The determined category.
 */
export function determineCategory(
    schemaName: string,
    knownCategories: string[],
    defaultCategory: string = "common"
): string {
    // Ensure schemaName is not empty
    if (!schemaName.trim()) {
        console.warn("Empty schemaName provided. Defaulting to common category.");
        return defaultCategory;
    }

    // Extract words starting with an uppercase letter
    const detectedCategories = schemaName.match(/[A-Z][a-z]+/g) || [];

    // Prioritize meaningful categories
    for (const detected of detectedCategories) {
        const detectedLower = detected.toLowerCase();

        // Skip general terms and check against known categories
        if (
            !generalTerms.includes(detectedLower) &&
            knownCategories.some((category) => category.toLowerCase() === detectedLower)
        ) {
            return detectedLower;
        }
    }
/*

    // Log when falling back to the default category
    console.info(
        `No matching category found for schema "${schemaName}". Falling back to default: ${defaultCategory}.`
    );
*/

    return defaultCategory;
}
