import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { HeroSection } from "@/components/hero-section";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseTable } from "@/components/expense-table";
import { MonthlyReport } from "@/components/monthly-report";
import { MonthComparison } from "@/components/month-comparison";
import { Confetti } from "@/components/shared/confetti";
import { CustomCategoriesManager } from "@/components/custom-categories-manager";
import { FeaturesHighlight } from "@/components/features-highlight";
import { type Expense } from "@/domain/expense";
import { deleteExpense, loadExpenses, saveExpenses, updateExpense } from '@/lib/storage';
import { v7 as uuid7 } from 'uuid';
import { useCustomCategories } from '@/hooks/use-custom-categories';
import { useCurrency } from '@/hooks/use-currency';
import { Footer } from '@/components/shared/footer';

export const Route = createFileRoute('/')({
    component: HomePage,
})

function HomePage() {
    const { currency } = useCurrency();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
    const [showConfetti, setShowConfetti] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const storedExpenses = loadExpenses();

        if (storedExpenses) {
            setExpenses(storedExpenses);
        }

        setIsInitialized(true);
    }, []);

    // Save to localStorage when expenses change
    useEffect(() => {
        if (!isInitialized) return;
        saveExpenses(expenses);
    }, [expenses, isInitialized]);


    const { update: hookUpdateCustomCategory, customCategories } = useCustomCategories();

    const handleUpdateCustomCategory = (oldName: string, newName: string) => {
        hookUpdateCustomCategory(oldName, newName);
        setExpenses((prev) =>
            prev.map((exp) =>
                exp.category === oldName ? { ...exp, category: newName } : exp
            )
        );
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
        const element = document.getElementById("manage-expenses");
        element?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className="min-h-screen bg-background relative overflow-x-hidden scroll-smooth">
            {/* Animated background elements */}
            <div className="fixed inset-0 pointer-events-none opacity-60 dark:opacity-40 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/30 rounded-full blur-[120px] " />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/30 rounded-full blur-[120px]" />
                <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-secondary/20 rounded-full blur-[100px]" />
            </div>

            {showConfetti && <Confetti trigger={showConfetti} />}

            <main className="relative z-10 flex flex-col gap-24 pb-24">
                {/* Hero Section */}
                <div id="home" className="container mx-auto px-4">
                    <HeroSection />
                </div>

                {/* Features Section */}
                <div id="features" className="bg-accent/5 py-8">
                    <FeaturesHighlight />
                </div>

                {/* Management & History Section */}
                <section id="manage-expenses" className="container mx-auto px-4 max-w-7xl scroll-mt-24">
                    <div className="grid grid-cols-12 gap-8 items-stretch">
                        {/* Sidebar: Form & Categories */}
                        <div className="col-span-12 lg:col-span-4 space-y-8 flex flex-col">
                            <div className="space-y-4 text-center md:text-left">
                                <h2 className="text-3xl font-bold tracking-tight">Management</h2>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    Record your transactions and organize your custom categories.
                                </p>
                            </div>
                            <div className="flex-1 flex flex-col gap-8">
                                <ExpenseForm
                                    onAddExpense={handleAddExpense}
                                    editingExpense={editingExpense}
                                    onUpdateExpense={handleUpdateExpense}
                                    onCancelEdit={() => setEditingExpense(undefined)}
                                    currency={currency}
                                />
                                <CustomCategoriesManager onUpdateCustomCategory={handleUpdateCustomCategory} />
                            </div>
                        </div>

                        {/* Main: Table */}
                        <div className="col-span-12 lg:col-span-8 flex flex-col">
                            <div id="history" className="space-y-4 mb-4 text-center md:text-left">
                                <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
                                <p className="text-muted-foreground text-sm">Review and manage your spending history.</p>
                            </div>
                            <div className="flex-1">
                                <ExpenseTable
                                    expenses={expenses}
                                    onDeleteExpense={handleDeleteExpense}
                                    onEditExpense={handleEditExpense}
                                    currency={currency}
                                    customCategories={customCategories}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Insights Section */}
                <section id="insights" className="container mx-auto px-4 max-w-7xl">
                    <div className="space-y-8">
                        <div className="space-y-2 text-center md:text-left">
                            <h2 className="text-3xl font-bold tracking-tight">Financial Insights</h2>
                            <p className="text-muted-foreground">Detailed breakdown and intelligent comparisons.</p>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                            <MonthlyReport expenses={expenses} currency={currency} />
                            <MonthComparison expenses={expenses} currency={currency} />
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
