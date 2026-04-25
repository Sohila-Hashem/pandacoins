import { createContext, useContext, useState, useEffect, useCallback, type ReactNode, useMemo } from "react";
import { toast } from "sonner";
import {
    getCustomCategories,
    addCustomCategory,
    deleteCustomCategory,
    updateCustomCategory
} from "@/api/custom-categories";

interface CustomCategoriesContextType {
    readonly customCategories: string[];
    readonly isInitialized: boolean;
    readonly add: (category: string) => void;
    readonly remove: (category: string) => void;
    readonly update: (oldName: string, newName: string) => void;
    readonly refresh: () => void;
}

const CustomCategoriesContext = createContext<CustomCategoriesContextType | undefined>(undefined);

export function CustomCategoriesProvider({ children }: { readonly children: ReactNode }) {
    const [customCategories, setCustomCategories] = useState<string[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const result = getCustomCategories();
        if (result.success && result.data) {
            setCustomCategories(result.data);
        } else if (result.error) {
            toast.error(result.error ?? "Failed to load custom categories");
        }
        setIsInitialized(true);
    }, []);

    const add = useCallback((category: string) => {
        const trimmed = category.trim();
        if (!trimmed) return;

        const result = addCustomCategory(trimmed);
        if (result.error) {
            toast.error(result.error ?? "Failed to add category");
            return;
        }

        setCustomCategories((prev) => [...prev, trimmed]);
        toast.success("Category added!");
    }, []);

    const remove = useCallback((category: string) => {
        const result = deleteCustomCategory(category);
        if (result.error) {
            toast.error(result.error ?? "Failed to delete category");
            return;
        }
        setCustomCategories((prev) => prev.filter((c) => c !== category));
        toast.success("Category deleted!");
    }, []);

    const update = useCallback((oldName: string, newName: string) => {
        const result = updateCustomCategory(oldName, newName);
        if (result.error) {
            toast.error(result.error ?? "Failed to update category");
            return;
        }
        setCustomCategories((prev) => prev.map((c) => (c === oldName ? newName : c)));
        toast.success("Category updated!");
    }, []);

    const refresh = useCallback(() => {
        const result = getCustomCategories();
        if (result.success && result.data) {
            setCustomCategories(result.data);
        } else if (result.error) {
            toast.error(result.error ?? "Failed to load custom categories");
        }
    }, []);

    const providerData = useMemo(() => ({
        customCategories,
        isInitialized,
        add,
        remove,
        update,
        refresh
    }), [customCategories, isInitialized, add, remove, update, refresh]);

    return (
        <CustomCategoriesContext.Provider value={providerData}>
            {children}
        </CustomCategoriesContext.Provider>
    );
}

export function useCustomCategories() {
    const context = useContext(CustomCategoriesContext);
    if (context === undefined) {
        throw new Error("useCustomCategories must be used within a CustomCategoriesProvider");
    }
    return context;
}
