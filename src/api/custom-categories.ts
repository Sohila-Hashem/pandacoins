import { CATEGORIES_SORTED, type CustomCategory, type ExpenseCategory } from "@/domain/expense"
import { loadCustomCategories, saveCustomCategories } from "@/lib/storage"

function checkForDuplicates(newCategory: CustomCategory, customCategories: ExpenseCategory[] = []) {
    const normalizedPresetCategories = CATEGORIES_SORTED.map((category) => category.category)
    const normalizedCustomCategories = customCategories.map((category) => category)

    const allCategories = [...normalizedPresetCategories, ...normalizedCustomCategories]
    return allCategories.includes(newCategory)
}

export function getCustomCategories() {
    try {
        const data = loadCustomCategories();
        return { success: true, data };
    } catch (error) {
        console.error(error)
        return { error: error instanceof Error ? error.message : "Failed to load custom categories." }
    }
}

export function addCustomCategory(category: string) {
    try {
        if (!category) return { error: "Category name cannot be empty." }
        const trimmed = category.trim()
        if (!trimmed) return { error: "Category name cannot be empty." }

        const normalized = trimmed

        const currentCustomCategories = loadCustomCategories()
        if (checkForDuplicates(normalized, currentCustomCategories)) {
            return { error: "Category already exists." }
        }
        const updatedCategories = [...currentCustomCategories, normalized]
        saveCustomCategories(updatedCategories)
        return { success: true }
    } catch (error) {
        console.error(error)
        return { error: error instanceof Error ? error.message : "Failed to add category." }
    }
}

export function deleteCustomCategory(category: string) {
    try {
        if (!category) return { error: "Category name cannot be empty." }
        const trimmed = category.trim()
        if (!trimmed) return { error: "Category name cannot be empty." }

        const currentCustomCategories = loadCustomCategories()
        const updatedCategories = currentCustomCategories.filter((category) => category !== trimmed)
        saveCustomCategories(updatedCategories)
        return { success: true }
    } catch (error) {
        console.error(error)
        return { error: error instanceof Error ? error.message : "Failed to delete category." }
    }
}

export function updateCustomCategory(oldName: string, newName: string) {
    try {
        if (!oldName || !newName) return { error: "Category name cannot be empty." }
        const trimmedOldName = oldName.trim()
        const trimmedNewName = newName.trim()
        if (!trimmedOldName || !trimmedNewName) return { error: "Category name cannot be empty." }

        const noramlizedNewName = trimmedNewName
        const noramlizedOldName = trimmedOldName

        const currentCustomCategories = loadCustomCategories()

        if (checkForDuplicates(noramlizedNewName, currentCustomCategories)) {
            return { error: "Category already exists." }
        }
        const updatedCategories = currentCustomCategories.map((category) => category === noramlizedOldName ? noramlizedNewName : category)
        saveCustomCategories(updatedCategories)
        return { success: true }
    } catch (error) {
        console.error(error)
        return { error: error instanceof Error ? error.message : "Failed to update category." }
    }
}