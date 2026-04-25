import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImportMode, type ImportOptions } from "@/api/expenses";

interface ImportOptionsDialogProps {
    readonly isOpen: boolean;
    readonly onClose: () => void;
    readonly onConfirm: (options: ImportOptions) => void;
    readonly fileName: string;
}

export function ImportOptionsDialog({ isOpen, onClose, onConfirm, fileName }: ImportOptionsDialogProps) {
    const [mode, setMode] = React.useState<ImportMode>(ImportMode.MERGE);
    const [addCategories, setAddCategories] = React.useState(true);

    const handleConfirm = () => {
        onConfirm({
            mode,
            addMissingCategories: addCategories,
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] border-none bg-background/95 backdrop-blur-xl shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Import Expenses
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Configure how you want to import data from <span className="font-medium text-foreground">{fileName}</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-6">
                    <div className="space-y-4">
                        <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">
                            Import Mode
                        </Label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setMode(ImportMode.MERGE)}
                                className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 group ${mode === ImportMode.MERGE
                                    ? 'border-primary bg-primary/5 ring-4 ring-primary/10'
                                    : 'border-border/50 hover:border-border hover:bg-accent/50'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${mode === ImportMode.MERGE ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                    }`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-sm">Merge</div>
                                    <p className="text-[10px] text-muted-foreground leading-tight mt-1">Combine current & new</p>
                                </div>
                            </button>

                            <button
                                onClick={() => setMode(ImportMode.OVERWRITE)}
                                className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 group ${mode === ImportMode.OVERWRITE
                                    ? 'border-destructive/50 bg-destructive/5 ring-4 ring-destructive/10'
                                    : 'border-border/50 hover:border-border hover:bg-accent/50'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${mode === ImportMode.OVERWRITE ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-muted-foreground'
                                    }`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 6 3 18h12l3-18H3z" /><path d="M19 6V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v1" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-sm">Overwrite</div>
                                    <p className="text-[10px] text-muted-foreground leading-tight mt-1">Replace all current</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    <button
                        type="button"
                        aria-pressed={addCategories}
                        aria-label={
                            addCategories
                                ? "Disable auto-add missing categories"
                                : "Enable auto-add missing categories"
                        }
                        onClick={() => setAddCategories((prev) => !prev)}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl bg-accent/20 border border-border/50 select-none group transition-colors hover:bg-accent/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                        <div
                            aria-hidden="true"
                            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-300 ${addCategories
                                ? "bg-primary border-primary"
                                : "border-muted-foreground/30"
                                }`}
                        >
                            {addCategories && (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-primary-foreground"
                                >
                                    <path d="M20 6 9 17l-5-5" />
                                </svg>
                            )}
                        </div>

                        <div className="flex-1 text-left">
                            <div className="font-semibold text-sm">
                                Auto-add missing categories
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-tight">
                                Create custom categories if they don't exist
                            </p>
                        </div>
                    </button>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl flex-1 sm:flex-none">
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleConfirm} className="rounded-xl flex-1 sm:flex-none bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                        Start Import
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
