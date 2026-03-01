import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

export type DeleteCustomCategoryDialogProps = {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly categoryName: string;
    readonly onConfirm: () => void;
};

export function DeleteCustomCategoryDialog({
    open,
    onOpenChange,
    categoryName,
    onConfirm,
}: DeleteCustomCategoryDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-sm">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-base">
                        <Trash2 className="size-4 text-destructive" />
                        Delete Category
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm text-start">
                        Are you sure you want to delete{" "}
                        <span className="font-semibold">"{categoryName}"</span>?
                        <br />
                        <br />
                        This will <strong>NOT</strong> affect any existing expenses that use
                        this category.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={onConfirm}
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
