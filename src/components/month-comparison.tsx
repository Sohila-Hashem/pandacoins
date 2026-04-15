import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ArrowLeftRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { type Currency } from "@/lib/constants";
import { type Expense } from "@/domain/expense";
import { generateMonthComparison } from "@/domain/compare";
import { MonthSelector } from "./month-selector";

interface MonthComparisonProps {
    expenses: Expense[];
    currency: Currency;
}

export function MonthComparison({ expenses, currency }: MonthComparisonProps) {
    const [selectedMonth, setSelectedMonth] = useState<string>("");
    const [comparison, setComparison] = useState<string>("");
    const [isGenerating, setIsGenerating] = useState(false);

    const availableMonths = useMemo(() => {
        const months = new Set<string>();
        expenses.forEach((expense) => {
            const date = new Date(expense.date);
            const monthKey = format(date, "yyyy-MM");
            months.add(monthKey);
        });
        return Array.from(months).sort().reverse();
    }, [expenses]);

    const handleGenerateComparison = () => {
        if (!selectedMonth) return;

        setIsGenerating(true);
        // Simulate AI processing time
        setTimeout(() => {
            const generatedComparison = generateMonthComparison(
                expenses,
                selectedMonth,
                currency.code
            );
            setComparison(generatedComparison);
            setIsGenerating(false);
        }, 1500);
    };

    return (
        <motion.div
            className="h-full"
            role="region"
            aria-label="Monthly Comparison"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
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
                            transition={{ delay: 0.4 }}
                        >
                            <motion.div
                                animate={{ x: [-2, 2, -2] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <ArrowLeftRight className="h-5 w-5 text-accent" />
                            </motion.div>
                            <h2 className="text-xl font-semibold">Compare Months</h2>
                        </motion.div>

                        <p className="text-sm text-muted-foreground">
                            Compare your selected month with the previous month
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <MonthSelector availableMonths={availableMonths} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />

                            <Button
                                onClick={handleGenerateComparison}
                                disabled={!selectedMonth || isGenerating}
                                variant="secondary"
                            >
                                {isGenerating ? (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                                        Compare
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Compare
                                    </>
                                )}
                            </Button>
                        </div>

                        {isGenerating && (
                            <div className="py-8 flex flex-col items-center gap-3">
                                <LoadingSpinner />
                                <p className="text-sm text-muted-foreground">
                                    Crunching the numbers...
                                </p>
                            </div>
                        )}

                        {!isGenerating && comparison && (
                            <motion.div
                                className="mt-4 p-4 rounded-lg bg-secondary/30 border border-secondary"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <p aria-label="Comparison Report" className="whitespace-pre-wrap text-sm leading-relaxed">
                                    {comparison}
                                </p>
                            </motion.div>
                        )}

                        {!isGenerating && !comparison && selectedMonth && (
                            <motion.div
                                className="py-8 text-center text-muted-foreground text-sm"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                Click "Compare" to see how this month stacks up against the previous one 📊
                            </motion.div>
                        )}
                    </div>
                </Card>
            </motion.div>
        </motion.div>
    );
}