import { useState } from "react";
import { useCustomCategories } from "@/hooks/use-custom-categories";
import { Pencil, Trash2, Check, X, Tag, BookAlertIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { DeleteCustomCategoryDialog } from "./delete-custom-category-dialog";
import { AddCustomCategoryDialog } from "./add-custom-category-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";


interface CustomCategoriesManagerProps {
    readonly onUpdateCustomCategory?: (oldName: string, newName: string) => void;
}

export function CustomCategoriesManager({ onUpdateCustomCategory }: CustomCategoriesManagerProps) {
    const {
        customCategories,
        add: onAddCustomCategory,
        remove: onDeleteCustomCategory,
        update: hookUpdateCustomCategory
    } = useCustomCategories();
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [editInput, setEditInput] = useState("");
    const [editError, setEditError] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [newCategoryInput, setNewCategoryInput] = useState("");
    const [newCategoryError, setNewCategoryError] = useState("");

    const handleUpdateCategory = (oldName: string, newName: string) => {
        if (onUpdateCustomCategory) {
            onUpdateCustomCategory(oldName, newName);
        } else {
            hookUpdateCustomCategory(oldName, newName);
        }
    };

    const handleStartEdit = (category: string) => {
        setEditingCategory(category);
        setEditInput(category);
        setEditError(null);
    };

    const handleCancelEdit = () => {
        setEditingCategory(null);
        setEditInput("");
        setEditError(null);
    };

    const handleSaveEdit = () => {
        if (!editingCategory) return
        const trimmedNewName = editInput.trim();
        if (!trimmedNewName) {
            setEditError("Category name cannot be empty.");
            return;
        }
        if (trimmedNewName === editingCategory) {
            setEditingCategory(null);
            setEditError(null);
            return;
        }

        handleUpdateCategory(editingCategory, trimmedNewName);
        setEditingCategory(null);
        setEditError(null);
    };

    const handleDeleteClick = (category: string) => {
        setCategoryToDelete(category);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (categoryToDelete) {
            onDeleteCustomCategory(categoryToDelete);
        }
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
    };

    const handleDialogOpenChange = (open: boolean) => {
        setDialogOpen(open);
        if (!open) {
            setNewCategoryInput("");
            setNewCategoryError("");
        }
    };

    return (
        <motion.div
            className="h-full"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, type: "spring", delay: 0.1 }}
        >
            <motion.div
                className="h-full"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
            >
                <Card className="p-4 h-full flex flex-col">
                    <div className="flex flex-col space-y-1 px-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <Tag className="size-4 text-primary" />
                                </motion.div>
                                <h3 className="text-lg font-semibold">My Categories</h3>
                            </div>
                            <AddCustomCategoryDialog dialogOpen={dialogOpen} handleDialogOpenChange={handleDialogOpenChange} newCategoryInput={newCategoryInput} setNewCategoryInput={setNewCategoryInput} newCategoryError={newCategoryError} setNewCategoryError={setNewCategoryError} handleAddCustomCategory={onAddCustomCategory} />
                        </div>
                        <p className="text-sm text-muted-foreground">Manage your custom categories</p>
                    </div>


                    <div className="flex-1 flex flex-col min-h-0">
                        {customCategories.length === 0 ? (
                            <div className="flex-1 flex flex-col justify-center items-center text-muted-foreground space-y-2 py-10">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="p-3 bg-muted/50 rounded-full mb-2"
                                >
                                    <BookAlertIcon className="w-8 h-8 text-muted-foreground/40" />
                                </motion.div>
                                <p className="italic text-sm text-center font-medium">No custom categories yet</p>
                                <p className="text-xs text-center text-muted-foreground/60 max-w-[200px]">
                                    Use the "+" button above to start organizing your spending.
                                </p>
                            </div>
                        ) : (
                            <ScrollArea className="flex-1 -mx-2 px-2 min-h-0">
                                <div className="space-y-1.5 pb-4">
                                    <AnimatePresence mode="popLayout">
                                        <p className="text-sm text-muted-foreground text-end px-2">Total: {customCategories.length}</p>
                                        {customCategories.map((customCategory) => (
                                            <motion.div
                                                key={customCategory}
                                                layout
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.2 }}
                                                className="group flex items-center gap-2 rounded-md p-2 bg-muted transition-all hover:bg-accent/50"
                                            >
                                                {editingCategory === customCategory ? (
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center gap-1">
                                                            <Input
                                                                value={editInput}
                                                                onChange={(e) => {
                                                                    setEditInput(e.target.value);
                                                                    setEditError("");
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter") {
                                                                        e.preventDefault();
                                                                        handleSaveEdit();
                                                                    }
                                                                    if (e.key === "Escape") {
                                                                        handleCancelEdit();
                                                                    }
                                                                }}
                                                                className="h-7 text-sm"
                                                                autoFocus
                                                            />
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/30"
                                                                        onClick={handleSaveEdit}
                                                                        aria-label="Save category name"
                                                                    >
                                                                        <Check className="size-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="top">Save</TooltipContent>
                                                            </Tooltip>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                                                        onClick={handleCancelEdit}
                                                                        aria-label="Cancel editing"
                                                                    >
                                                                        <X className="size-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="top">Cancel</TooltipContent>
                                                            </Tooltip>
                                                        </div>
                                                        {editError && (
                                                            <p className="text-xs text-destructive px-1">{editError}</p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className="flex-1 text-sm truncate">{customCategory}</span>
                                                        <div className="flex items-center gap-0.5">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                                                        onClick={() => handleStartEdit(customCategory)}
                                                                        aria-label={`Edit ${customCategory} category`}
                                                                    >
                                                                        <Pencil className="size-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="top">Rename</TooltipContent>
                                                            </Tooltip>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                                                        onClick={() => handleDeleteClick(customCategory)}
                                                                        aria-label={`Delete ${customCategory} category`}
                                                                    >
                                                                        <Trash2 className="size-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="top">Delete</TooltipContent>
                                                            </Tooltip>
                                                        </div>
                                                    </>
                                                )}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </ScrollArea>
                        )}
                    </div>

                    <DeleteCustomCategoryDialog
                        open={deleteDialogOpen}
                        onOpenChange={setDeleteDialogOpen}
                        categoryName={categoryToDelete ?? ""}
                        onConfirm={handleConfirmDelete}
                    />
                </Card>
            </motion.div>
        </motion.div>
    );
}
