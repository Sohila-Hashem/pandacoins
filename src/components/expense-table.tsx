import { useState, useMemo } from "react";
import { format } from "date-fns";
import { BanknoteArrowDown, Pencil, Trash2, Inbox } from "lucide-react";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { type Currency } from "@/lib/constants";
import { filterExpensesByMonth, filterExpensesByCategory, getAvailableMonths, getTotalAmount, type Expense } from "@/domain/expense";
import { formatCurrency } from "@/lib/utils";
import { CategorySelect } from "@/components/category-select";

interface ExpenseTableProps {
    expenses: Expense[];
    onDeleteExpense: (id: string) => void;
    onEditExpense: (expense: Expense) => void;
    currency: Currency;
    customCategories?: string[];
}

export function ExpenseTable({
    expenses,
    onDeleteExpense,
    onEditExpense,
    currency,
    customCategories = [],
}: ExpenseTableProps) {
    const [selectedMonth, setSelectedMonth] = useState<string>("all");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const availableMonths = useMemo(() => {
        return getAvailableMonths(expenses);
    }, [expenses]);

    const filteredExpenses = useMemo(() => {
        let result = expenses;
        if (selectedMonth !== "all") {
            result = filterExpensesByMonth(result, selectedMonth);
        }
        if (selectedCategory !== "all") {
            result = filterExpensesByCategory(result, selectedCategory);
        }
        return result;
    }, [expenses, selectedMonth, selectedCategory]);

    const sortedExpenses = useMemo(() => {
        return [...filteredExpenses].sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
    }, [filteredExpenses]);

    const totalAmount = useMemo(() => {
        return getTotalAmount(filteredExpenses);
    }, [filteredExpenses]);

    return (
        <motion.div
            className="h-full flex flex-col min-h-0"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring", delay: 0.1 }}
        >
            <motion.div
                className="h-full flex flex-col min-h-0"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
            >
                <Card className="p-4 sm:p-6 flex-1 flex flex-col min-h-0">
                    <div className="space-y-4 flex flex-col flex-1 min-h-0">
                        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <motion.div
                                    animate={{ y: [0, -3, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <BanknoteArrowDown className="size-5 text-primary" />
                                </motion.div>
                                <h3 className="text-lg font-semibold tracking-tight">Expenses</h3>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                                    <span className="text-sm text-muted-foreground whitespace-nowrap">Month:</span>
                                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                        <SelectTrigger className="w-full sm:w-[140px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            {availableMonths?.map((month) => (
                                                <SelectItem key={month} value={month}>
                                                    {format(new Date(month + "-01"), "MMM yyyy")}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                                    <span className="text-sm text-muted-foreground whitespace-nowrap">Category:</span>
                                    <CategorySelect
                                        value={selectedCategory}
                                        onValueChange={setSelectedCategory}
                                        customCategories={customCategories}
                                        showAllOption
                                        triggerClassName="w-full sm:w-[160px]"
                                    />
                                </div>
                            </div>
                        </div>

                        {sortedExpenses.length === 0 ? (
                            <motion.div
                                className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-12"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="p-4 bg-muted/20 rounded-full mb-4">
                                    <Inbox className="size-10 text-muted-foreground/40" />
                                </div>
                                <p className="text-center font-medium">No expenses found</p>
                                <p className="text-center text-sm max-w-[200px] mt-1">Start by adding your first expense to see it here!</p>
                            </motion.div>
                        ) : (
                            <div className="flex-1 flex flex-col min-h-0">
                                <div className="flex-1 rounded-lg border overflow-hidden">
                                    <ScrollArea className="h-full">
                                        <ScrollBar orientation="horizontal" />
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/50">
                                                    <TableHead className="sticky top-0 bg-muted/50 z-10 backdrop-blur-sm">Date</TableHead>
                                                    <TableHead className="sticky top-0 bg-muted/50 z-10 backdrop-blur-sm">Description</TableHead>
                                                    <TableHead className="sticky top-0 bg-muted/50 z-10 backdrop-blur-sm">Category</TableHead>
                                                    <TableHead className="sticky top-0 bg-muted/50 z-10 backdrop-blur-sm text-right">Amount</TableHead>
                                                    <TableHead className="sticky top-0 bg-muted/50 z-10 backdrop-blur-sm text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {sortedExpenses.map((expense, _index) => (
                                                    <TableRow key={expense.id} className="hover:bg-accent/5 transition-colors">
                                                        <TableCell className="whitespace-nowrap">
                                                            {format(new Date(expense.date), "MMM dd, yyyy")}
                                                        </TableCell>
                                                        <TableCell className="max-w-[200px] truncate">{expense.description}</TableCell>
                                                        <TableCell>
                                                            <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
                                                                {expense.category}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium">
                                                            {formatCurrency(expense.amount, currency.code)}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-1">
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-8 w-8"
                                                                    onClick={() => onEditExpense(expense)}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                    onClick={() => setDeleteId(expense.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </ScrollArea>
                                </div>

                                <motion.div
                                    className="flex justify-between items-center pt-4 mt-2 border-t"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <span className="text-sm text-muted-foreground font-medium">
                                        {filteredExpenses.length} transaction{filteredExpenses.length === 1 ? "" : "s"}
                                    </span>
                                    <div className="text-xl">
                                        <span className="text-muted-foreground mr-2 text-sm">Total:</span>
                                        <span className="font-bold text-primary">
                                            {formatCurrency(totalAmount, currency.code)}
                                        </span>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </div>

                    <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete this expense? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => {
                                        if (deleteId) {
                                            onDeleteExpense(deleteId);
                                            setDeleteId(null);
                                        }
                                    }}
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </Card>
            </motion.div>
        </motion.div>
    );
}