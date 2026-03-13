import { CATEGORIES_SORTED } from "./expense"

export type CustomCategory = string

export function checkForDuplicates(newCategory: CustomCategory, customCategories: CustomCategory[] = []) {
    const normalizedPresetCategories = CATEGORIES_SORTED.map((category) => category.category)
    const normalizedCustomCategories = customCategories.map((category) => category)

    const allCategories = [...normalizedPresetCategories, ...normalizedCustomCategories]
    return allCategories.includes(newCategory)
}