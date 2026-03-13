import { describe, it, expect } from "vitest";
import { checkForDuplicates } from "../custom-categories";

describe("checkForDuplicates", () => {
    it("returns false for an empty custom categories list when checking a new name", () => {
        expect(checkForDuplicates("New Category", [])).toBe(false);
    });

    it("returns true when the category matches a preset category", () => {
        // 'Food' is a preset category
        expect(checkForDuplicates("Food", [])).toBe(true);
    });

    it("returns true when the category matches an existing custom category", () => {
        const customCategories = ["Gym", "Education"];
        expect(checkForDuplicates("Gym", customCategories)).toBe(true);
    });

    it("returns false for a unique name", () => {
        const customCategories = ["Gym"];
        expect(checkForDuplicates("Unique Category", customCategories)).toBe(false);
    });

    it("is case sensitive (based on current implementation using includes)", () => {
        // Current implementation is just: allCategories.includes(newCategory)
        expect(checkForDuplicates("food", [])).toBe(false);
    });
});
