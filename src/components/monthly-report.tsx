import { useState, useMemo } from "react";
import { FileText, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { type Currency } from "@/lib/constants";
import { type Expense, getAvailableMonths } from "@/domain/expense";
import { generateMonthlyReport } from "@/domain/aggregate";
import { MonthSelector } from "./month-selector";

interface MonthlyReportProps {
    expenses: Expense[];
    currency: Currency;
}

export function MonthlyReport({ expenses, currency }: MonthlyReportProps) {
    const [selectedMonth, setSelectedMonth] = useState<string>("");
    const [report, setReport] = useState<string>("");
    const [isGenerating, setIsGenerating] = useState(false);

    const availableMonths = useMemo(() => {
        return getAvailableMonths(expenses);
    }, [expenses]);

    const handleGenerateReport = () => {
        if (!selectedMonth) return;

        setIsGenerating(true);
        // Simulate AI processing time
        setTimeout(() => {
            const generatedReport = generateMonthlyReport(
                expenses,
                selectedMonth,
                currency.code
            );
            setReport(generatedReport);
            setIsGenerating(false);
        }, 1500);
    };

    return (
        <motion.div
            className="h-full"
            role="region"
            aria-label="Monthly Report"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <motion.div
                className="h-full"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
            >
                <Card className="p-4 sm:p-6 h-full flex flex-col">
                    <div className="space-y-4">
                        <motion.div
                            className="flex items-center gap-2"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <motion.div
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <FileText className="h-5 w-5 text-primary" />
                            </motion.div>
                            <h2 className="text-lg font-semibold">Monthly Report</h2>
                        </motion.div>

                        <p className="text-sm text-muted-foreground">
                            Get a detailed breakdown of your spending for the selected month.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <MonthSelector availableMonths={availableMonths} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />

                            <Button
                                onClick={handleGenerateReport}
                                disabled={!selectedMonth || isGenerating}
                            >
                                {isGenerating ? (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                                        Generate
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Generate
                                    </>
                                )}
                            </Button>
                        </div>

                        {isGenerating && (
                            <div className="py-8 flex flex-col items-center gap-3">
                                <LoadingSpinner />
                                <p className="text-sm text-muted-foreground">
                                    Analyzing your spending patterns...
                                </p>
                            </div>
                        )}

                        {!isGenerating && report && (
                            <motion.div
                                className="mt-4 p-4 rounded-lg bg-accent/30 border border-accent"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                    {report}
                                </p>
                            </motion.div>
                        )}

                        {!isGenerating && !report && selectedMonth && (
                            <motion.div
                                className="py-8 text-center text-muted-foreground text-sm"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                Click "Generate" to see your monthly insights ✨
                            </motion.div>
                        )}
                    </div>
                </Card>
            </motion.div>
        </motion.div>
    );
}