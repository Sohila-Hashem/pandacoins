import { endOfMonth, format, getDaysInMonth, isWithinInterval, startOfMonth } from "date-fns";
import type { Expense, ExpenseCategory } from "./expense";
import { formatCurrency } from "@/lib/utils";
import { BALANCED_SPENDING_MESSAGE, HIGH_SPENDING_MESSAGE, HIGH_SPENDING_THRESHOLD, LOW_SPENDING_MESSAGE, LOW_SPENDING_THRESHOLD, MEDIUM_SPENDING_MESSAGE, MEDIUM_SPENDING_THRESHOLD } from "@/lib/constants";

export interface TopCategory {
    category: ExpenseCategory;
    amount: number;
}

export interface ReportInsights {
    total: number;
    categoryTotals: Record<ExpenseCategory, number>;
    categoryPercentages: CategoryStats[];
    topCategory: TopCategory;
    dailyAvg: number;
    totalTransactions: number;
}

export interface CategoryStats {
    category: ExpenseCategory;
    amount: number;
    percentage: number;
}

export function generateMonthlyReport(expenses: Expense[], month: string, currencyCode: string) {
    const monthDate = new Date(month + "-01");
    const monthExpenses = getMonthExpenses(expenses, month);
    const insights = generateReportInsightsData(monthExpenses, monthDate);
    return generateReportInsights(insights, monthDate, currencyCode);
}

export const generateReportInsightsData = (expenses: Expense[], monthDate: Date): ReportInsights => {
    const total = getMonthTotal(expenses);
    const categoryTotals = getCategoriesTotal(expenses);
    const topCategory = getTopCategory(categoryTotals);
    const dailyAvg = total / getDaysInMonth(monthDate);
    const totalTransactions = expenses.length;
    const categoryPercentages = getCategoriesTotalPercentage(categoryTotals, total);

    return {
        total,
        categoryTotals,
        categoryPercentages,
        topCategory,
        dailyAvg,
        totalTransactions,
    };
}

export function generateReportInsights(
    insights: ReportInsights,
    monthDate: Date,
    currencyCode: string
): string {

    if (insights.total === 0) {
        return `You didn't record any expenses for ${format(monthDate, "MMMM yyyy")}. Either you're living like a hermit or you forgot to track! 🏝️`;
    }

    // Category breakdown
    const categoryTotals = insights.categoryTotals;

    const topCategory = insights.topCategory;
    const topCategoryPercentage = insights.categoryPercentages.find((cat) => cat.category === topCategory.category)?.percentage || 0;
    console.log(topCategoryPercentage);

    const dailyAvg = insights.dailyAvg;

    // Generate insights
    let report = `📊 **${format(monthDate, "MMMM yyyy")} Money Snapshot**\n\n`;

    report += `You spent a total of **${formatCurrency(insights.total, currencyCode)}** across ${insights.totalTransactions} transactions. `;
    report += `That's an average of ${formatCurrency(dailyAvg, currencyCode)} per day.\n\n`;

    report += `🎯 **Where It Went:**\n`;
    report += `Your biggest spending category was **${topCategory.category}** at **${formatCurrency(topCategory.amount, currencyCode)}** `;
    report += `(${topCategoryPercentage.toFixed(1)}% of your total). `;
    if (topCategoryPercentage / 100 > HIGH_SPENDING_THRESHOLD) {
        report += HIGH_SPENDING_MESSAGE;
    } else if (topCategoryPercentage / 100 > MEDIUM_SPENDING_THRESHOLD) {
        report += MEDIUM_SPENDING_MESSAGE;
    } else if (topCategoryPercentage / 100 > LOW_SPENDING_THRESHOLD) {
        report += LOW_SPENDING_MESSAGE;
    } else {
        report += BALANCED_SPENDING_MESSAGE;
    }

    // Category breakdown
    const sortedCategories = getCategoriesTotalPercentage(categoryTotals, insights.total);
    report += `📈 **Category Breakdown:**\n`;
    sortedCategories.forEach(({ category, amount, percentage }) => {
        report += `• ${category}: ${formatCurrency(amount, currencyCode)} (${percentage.toFixed(1)}%)\n`;
    });

    return report;
}

export const getCategoriesTotal = (expenses: Expense[]) => {
    return expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
    }, {} as Record<ExpenseCategory, number>);
}

export const getMonthExpenses = (expenses: Expense[], month: string) => {
    const monthDate = new Date(month + "-01");
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);

    return expenses.filter((exp) => {
        const expDate = new Date(exp.date);
        return isWithinInterval(expDate, { start: monthStart, end: monthEnd });
    });
}

export const getMonthTotal = (expenses: Expense[]) => {
    return expenses.reduce((acc, exp) => acc + exp.amount, 0);
}

export const getTopCategory = (categoriesTotal: Record<ExpenseCategory, number>): TopCategory => {
    const entries = Object.entries(categoriesTotal);
    if (entries.length === 0) {
        return { category: "Other" as ExpenseCategory, amount: 0 };
    }
    const [category, amount] = entries.sort(([, a], [, b]) => b - a)[0];
    return { category: category, amount };
}

export const getCategoriesTotalPercentage = (categoriesTotal: Record<ExpenseCategory, number>, total: number): CategoryStats[] => {
    return Object.entries(categoriesTotal).map(([category, amount]) => {
        return {
            category: category,
            amount,
            percentage: (amount / total) * 100
        };
    }).sort((a, b) => b.percentage - a.percentage);
}