import * as React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, Upload, Loader2 } from "lucide-react";
import { exportExpenses, importExpenses, type ImportOptions } from "@/api/expenses";
import { ImportOptionsDialog } from "./import-options-dialog";

interface ExpenseDataActionsProps {
    readonly onImportSuccess?: () => void;
}

export function ExpenseDataActions({ onImportSuccess }: ExpenseDataActionsProps) {
    const [isExporting, setIsExporting] = React.useState(false);
    const [isImporting, setIsImporting] = React.useState(false);
    const [showOptions, setShowOptions] = React.useState(false);
    const [pendingFile, setPendingFile] = React.useState<File | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleExport = async () => {
        setIsExporting(true);
        toast.promise(exportExpenses(), {
            loading: 'Preparing your export...',
            success: (data) => {
                if (data.error) throw new Error(data.error);
                return 'Expenses exported successfully!';
            },
            error: (err) => err.message,
            finally: () => setIsExporting(false)
        });
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
                const successMessageDescription = `Added ${result.count} expenses. ${result.skippedCount > 0 ? `Skipped ${result.skippedCount} invalid rows.` : ''}`
                toast.success(`Import complete!`, {
                    id: loadingToast,
                    description: successMessageDescription,
                });
                // Trigger callback to update state
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
        <div className="flex items-center gap-2">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
            />

            <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
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

            <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
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

            <ImportOptionsDialog
                isOpen={showOptions}
                onClose={() => {
                    setShowOptions(false);
                    setPendingFile(null);
                }}
                onConfirm={handleConfirmImport}
                fileName={pendingFile?.name || ''}
            />
        </div>
    );
}
