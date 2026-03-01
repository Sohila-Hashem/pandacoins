import { useState, useMemo } from "react";
import { format } from "date-fns";
import { BanknoteArrowDown, Pencil, Trash2 } from "lucide-react";
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
import { filterExpensesByMonth, getAvailableMonths, getTotalAmount, type Expense } from "@/domain/expense";
import { formatCurrency } from "@/lib/utils";

interface ExpenseTableProps {
    expenses: Expense[];
    onDeleteExpense: (id: string) => void;
    onEditExpense: (expense: Expense) => void;
    currency: Currency;
}

export function ExpenseTable({
    expenses,
    onDeleteExpense,
    onEditExpense,
    currency,
}: ExpenseTableProps) {
    const [selectedMonth, setSelectedMonth] = useState<string>("all");
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const availableMonths = useMemo(() => {
        return getAvailableMonths(expenses);
    }, [expenses]);

    const filteredExpenses = useMemo(() => {
        if (selectedMonth === "all") return expenses;
        return filterExpensesByMonth(expenses, selectedMonth);
    }, [expenses, selectedMonth]);

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
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring", delay: 0.1 }}
        >
            <motion.div
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
            >
                <Card className="p-4 sm:p-6">
                    <div className="space-y-4">
                        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <motion.div
                                    animate={{ y: [0, -3, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <BanknoteArrowDown className="size-5 text-primary" />
                                </motion.div>
                                <h3>Expenses</h3>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                                <span className="text-sm text-muted-foreground whitespace-nowrap">Filter by month:</span>
                                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                    <SelectTrigger className="w-full sm:w-[180px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Months</SelectItem>
                                        {availableMonths?.map((month) => (
                                            <SelectItem key={month} value={month}>
                                                {format(new Date(month + "-01"), "MMMM yyyy")}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {sortedExpenses.length === 0 ? (
                            <motion.div
                                className="py-12 text-center text-muted-foreground"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                No expenses found. Start by adding your first expense!
                            </motion.div>
                        ) : (
                            <>
                                <div className="rounded-lg border">
                                    <ScrollArea className="h-56">
                                        <ScrollBar orientation="horizontal" />
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="sticky top-0 bg-card z-10">Date</TableHead>
                                                    <TableHead className="sticky top-0 bg-card z-10">Description</TableHead>
                                                    <TableHead className="sticky top-0 bg-card z-10">Category</TableHead>
                                                    <TableHead className="sticky top-0 bg-card z-10 text-right">Amount</TableHead>
                                                    <TableHead className="sticky top-0 bg-card z-10 text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {sortedExpenses.map((expense, _index) => (
                                                    <TableRow key={expense.id}>
                                                        <TableCell>
                                                            {format(new Date(expense.date), "MMM dd, yyyy")}
                                                        </TableCell>
                                                        <TableCell>{expense.description}</TableCell>
                                                        <TableCell>
                                                            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs">
                                                                {expense.category}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {formatCurrency(expense.amount, currency.code)}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => onEditExpense(expense)}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => setDeleteId(expense.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
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
                                    className="flex justify-between items-center pt-2 border-t"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <span className="text-sm text-muted-foreground">
                                        {filteredExpenses.length} expense
                                        {filteredExpenses.length !== 1 ? "s" : ""}
                                    </span>
                                    <div className="text-lg">
                                        <span className="text-muted-foreground mr-2">Total:</span>
                                        <span className="font-medium text-primary">
                                            {formatCurrency(totalAmount, currency.code)}
                                        </span>
                                    </div>
                                </motion.div>
                            </>
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