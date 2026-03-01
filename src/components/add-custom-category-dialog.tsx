import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { PlusCircle, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type AddCustomCategoryDialogProps = {
  readonly dialogOpen: boolean;
  readonly handleDialogOpenChange: (open: boolean) => void;
  readonly newCategoryInput: string;
  readonly setNewCategoryInput: (input: string) => void;
  readonly newCategoryError: string;
  readonly setNewCategoryError: (error: string) => void;
  readonly handleAddCustomCategory: (category: string) => void;
}
export function AddCustomCategoryDialog({ dialogOpen, handleDialogOpenChange, newCategoryInput, setNewCategoryInput, newCategoryError, setNewCategoryError, handleAddCustomCategory }: AddCustomCategoryDialogProps) {
  const onSave = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) {
      setNewCategoryError("Category name cannot be empty.");
      return;
    }
    handleAddCustomCategory(trimmed);
    setNewCategoryInput("");
    setNewCategoryError("");
    handleDialogOpenChange(false);
  };

  return <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
    <Tooltip>
      <TooltipTrigger asChild>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            aria-label="Add custom category"
          >
            <PlusCircle className="size-4" />
          </Button>
        </DialogTrigger>
      </TooltipTrigger>
      <TooltipContent side="top">Add custom category</TooltipContent>
    </Tooltip>
    <DialogContent className="sm:max-w-sm">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-base">
          <Tag className="size-4" />
          New Category
        </DialogTitle>
        <DialogDescription className="text-sm text-start">
          Create a custom category for your expenses.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-2">
        <Input
          id="new-category-input"
          className="text-sm"
          placeholder="e.g. Hobbies"
          value={newCategoryInput}
          onChange={(e) => {
            setNewCategoryInput(e.target.value);
            setNewCategoryError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSave();
            }
          }}
          autoFocus
        />
        {newCategoryError && (
          <p className="text-sm text-destructive">{newCategoryError}</p>
        )}
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleDialogOpenChange(false)}
        >
          Cancel
        </Button>
        <Button type="button" onClick={onSave}>
          Add Category
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
}