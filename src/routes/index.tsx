import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { HeroSection } from "@/components/hero-section";
import { CurrencySelector } from "@/components/currency-selector";
import { ModeToggle } from "@/components/mode-toggle";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseTable } from "@/components/expense-table";
import { MonthlyReport } from "@/components/monthly-report";
import { MonthComparison } from "@/components/month-comparison";
import { Confetti } from "@/components/confetti";
import { CustomCategoriesManager } from "@/components/custom-categories-manager";
import { type Currency, CURRENCIES } from "@/lib/constants";
import { type Expense } from "@/domain/expense";
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { deleteExpense, loadCurrency, loadExpenses, saveCurrency, saveExpenses, updateExpense } from '@/lib/storage';
import { v7 as uuid7 } from 'uuid';
import { addCustomCategory, deleteCustomCategory, getCustomCategories, updateCustomCategory } from '@/api/custom-categories';

export const Route = createFileRoute('/')({
    component: RouteComponent,
})

function RouteComponent() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]);
    const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
    const [customCategories, setCustomCategories] = useState<string[]>([]);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const storedExpenses = loadExpenses();
        const storedCurrency = loadCurrency();

        if (storedExpenses) {
            try {
                setExpenses(storedExpenses);
            } catch (e) {
                console.error("Failed to parse expenses:", e);
            }
        }

        if (storedCurrency) {
            try {
                const found = CURRENCIES.find((c) => c.code === storedCurrency.code);
                if (found) setCurrency(found);
            } catch (e) {
                console.error("Failed to parse currency:", e);
            }
        }

        const storedCustomCategories = getCustomCategories();
        if (storedCustomCategories.success && storedCustomCategories.data) {
            setCustomCategories(storedCustomCategories.data);
        } else if (storedCustomCategories.error) {
            toast.error("Failed to load custom categories");
        }

        setIsInitialized(true);
    }, []);

    // Save to localStorage when expenses change
    useEffect(() => {
        if (!isInitialized) return;
        saveExpenses(expenses);
    }, [expenses, isInitialized]);

    // Save to localStorage when currency changes
    useEffect(() => {
        if (!isInitialized) return;
        saveCurrency(currency);
    }, [currency, isInitialized]);

    const handleAddCustomCategory = (category: string) => {
        const trimmed = category.trim();
        if (!trimmed) {
            return;
        }

        const result = addCustomCategory(trimmed)
        if (result.error) {
            toast.error(result.error ?? "Failed to add category")
            return
        }

        setCustomCategories((prev) => [...prev, trimmed])
        toast.success("Category added!")
    };

    const handleDeleteCustomCategory = (category: string) => {
        const result = deleteCustomCategory(category)
        if (result.error) {
            toast.error(result.error ?? "Failed to delete category")
            return
        }
        setCustomCategories((prev) => prev.filter((c) => c !== category));
        toast.success("Category deleted!")
    };

    const handleUpdateCustomCategory = (oldName: string, newName: string) => {
        const result = updateCustomCategory(oldName, newName)
        if (result.error) {
            toast.error(result.error ?? "Failed to update category")
            return
        }
        setCustomCategories((prev) => prev.map((c) => (c === oldName ? newName : c)));
        setExpenses((prev) =>
            prev.map((exp) =>
                exp.category === oldName ? { ...exp, category: newName } : exp
            )
        );
        toast.success("Category updated!")
    };

    const handleAddExpense = (expense: Omit<Expense, "id">) => {
        const newExpense: Expense = {
            ...expense,
            id: uuid7(),
        };
        setExpenses([...expenses, newExpense]);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        toast.success("Expense added successfully!");
    };

    const handleUpdateExpense = (expense: Expense) => {
        setExpenses(updateExpense(expense, expenses));
        setEditingExpense(undefined);
        toast.success("Expense updated successfully!");
    };

    const handleDeleteExpense = (id: string) => {
        setExpenses(deleteExpense(id, expenses));
        toast.success("Expense deleted successfully!");
    };

    const handleEditExpense = (expense: Expense) => {
        setEditingExpense(expense);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="min-h-screen bg-background relative overflow-x-hidden">
            {/* Animated background elements */}
            <div className="fixed inset-0 pointer-events-none opacity-100">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/50 dark:bg-primary/30 rounded-full blur-3xl opacity-50 dark:opacity-100" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/50 dark:bg-accent/30 rounded-full blur-3xl opacity-50 dark:opacity-100" />
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-secondary/50 dark:bg-secondary/30 rounded-full blur-3xl opacity-50 dark:opacity-100" />
            </div>

            {showConfetti && <Confetti trigger={showConfetti} />}

            <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
                {/* Hero Section */}
                <HeroSection />

                {/* Currency Selector and Mode Toggle */}
                <div className="flex justify-end mb-6 gap-2">
                    <CurrencySelector currency={currency} onCurrencyChange={setCurrency} />
                    <ModeToggle />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Form */}
                    <div className="lg:col-span-1 space-y-6">
                        <ExpenseForm
                            onAddExpense={handleAddExpense}
                            editingExpense={editingExpense}
                            onUpdateExpense={handleUpdateExpense}
                            onCancelEdit={() => setEditingExpense(undefined)}
                            currency={currency}
                            customCategories={customCategories}
                            onAddCustomCategory={handleAddCustomCategory}
                        />
                        <CustomCategoriesManager
                            customCategories={customCategories}
                            onDeleteCustomCategory={handleDeleteCustomCategory}
                            onUpdateCustomCategory={handleUpdateCustomCategory}
                            onAddCustomCategory={handleAddCustomCategory}
                        />
                    </div>

                    {/* Right Column - Table and Insights */}
                    <div className="lg:col-span-2 space-y-6">
                        <ExpenseTable
                            expenses={expenses}
                            onDeleteExpense={handleDeleteExpense}
                            onEditExpense={handleEditExpense}
                            currency={currency}
                        />

                        <div className="grid md:grid-cols-2 gap-6">
                            <MonthlyReport expenses={expenses} currency={currency} />
                            <MonthComparison expenses={expenses} currency={currency} />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center text-sm text-muted-foreground max-w-xl mx-auto">
                    <p>Your data is stored locally in your browser. No servers, no tracking. 🔒</p>
                    <Separator decorative className="mt-3 w-1/2 mx-auto" />
                    <p>Built with ❤️ by
                        <Button className='px-1 py-0' variant={"link"} asChild>
                            <a href="https://github.com/sohila-hashem" target="_blank">Sohila Hashem</a>
                        </Button>
                    </p>
                </div>
            </div>
        </div>
    );
}
