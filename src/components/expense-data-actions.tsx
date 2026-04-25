import * as React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, Upload, Loader2 } from "lucide-react";
import { exportExpenses, importExpenses, type ImportOptions } from "@/api/expenses";
import { ImportOptionsDialog } from "./import-options-dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
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

interface ExpenseDataActionsProps {
    readonly onImportSuccess?: () => void;
    readonly expensesToExport?: import("@/domain/expense").Expense[];
    readonly fileName?: string;
}

export function ExpenseDataActions({
    onImportSuccess,
    expensesToExport = [],
    fileName
}: ExpenseDataActionsProps) {
    const [isExporting, setIsExporting] = React.useState(false);
    const [isImporting, setIsImporting] = React.useState(false);
    const [showOptions, setShowOptions] = React.useState(false);
    const [showExportConfirm, setShowExportConfirm] = React.useState(false);
    const [pendingFile, setPendingFile] = React.useState<File | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleExportConfirm = async () => {
        setShowExportConfirm(false);
        setIsExporting(true);

        toast.promise(exportExpenses(expensesToExport, fileName), {
            loading: 'Preparing your export...',
            success: (data) => {
                if (data.error) throw new Error(data.error);
                return 'Expenses exported successfully!';
            },
            error: (err) => err.message,
            finally: () => setIsExporting(false)
        });
    };

    const handleExportClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (expensesToExport.length === 0) {
            toast.error("No expenses found to export.");
            return;
        }
        setShowExportConfirm(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPendingFile(file);
            setShowOptions(true);
        }
        // Reset input so the same file can be selected again
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleConfirmImport = async (options: ImportOptions) => {
        if (!pendingFile) return;

        setIsImporting(true);
        const loadingToast = toast.loading(`Importing ${pendingFile.name}...`);

        try {
            const result = await importExpenses(pendingFile, options);

            if (result.success) {
                const skippedRowsMsg = result.skippedCount > 0 ? `Skipped ${result.skippedCount} invalid rows.` : '';
                const successMessageDescription = `Added ${result.count} expenses. ${skippedRowsMsg}`;
                toast.success(`Import complete!`, {
                    id: loadingToast,
                    description: successMessageDescription,
                });
                onImportSuccess?.();
            } else {
                toast.error(result.error || 'Import failed', { id: loadingToast });
            }
        } catch (error) {
            console.error(error);
            toast.error('An unexpected error occurred during import.', { id: loadingToast });
        } finally {
            setIsImporting(false);
            setPendingFile(null);
        }
    };

    return (
        <TooltipProvider>
            <div className="flex items-center gap-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".csv"
                    className="hidden"
                />

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.preventDefault();
                                fileInputRef.current?.click();
                            }}
                            disabled={isImporting}
                            className="rounded-xl border-border px-4 py-2 h-10 transition-all duration-300 hover:bg-primary/5 hover:text-primary hover:border-primary/30 group"
                        >
                            {isImporting ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin text-primary" />
                            ) : (
                                <Upload className="w-4 h-4 mr-2 transition-transform group-hover:-translate-y-1 text-primary" />
                            )}
                            Import CSV
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p>Upload expenses from a CSV file</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleExportClick}
                            disabled={isExporting}
                            className="rounded-xl border-border px-4 py-2 h-10 transition-all duration-300 hover:bg-primary/5 hover:text-primary hover:border-primary/30 group"
                        >
                            {isExporting ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin text-primary" />
                            ) : (
                                <Download className="w-4 h-4 mr-2 transition-transform group-hover:translate-y-1 text-primary" />
                            )}
                            Export CSV
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p>Download your expenses as CSV</p>
                    </TooltipContent>
                </Tooltip>

                <ImportOptionsDialog
                    isOpen={showOptions}
                    onClose={() => {
                        setShowOptions(false);
                        setPendingFile(null);
                    }}
                    onConfirm={handleConfirmImport}
                    fileName={pendingFile?.name || ''}
                />

                <AlertDialog open={showExportConfirm} onOpenChange={setShowExportConfirm}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Export</AlertDialogTitle>
                            <AlertDialogDescription asChild>
                                <div className="space-y-3">
                                    <p>You are about to export <strong>{expensesToExport.length}</strong> transactions to a CSV file.</p>
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleExportConfirm}>
                                Export Now
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </TooltipProvider>
    );
}
