import { z } from "zod";

export const expenseSchema = z.object({
    description: z
        .string("Description is required")
        .min(1, "Description is required")
        .max(200, "Description must be less than 200 characters"),
    amount: z
        .number("Amount is required")
        .min(0.1, "Amount must be at least 0.1")
        .max(1000000000, "Amount is too large"),
    date: z.date("Date is required"),
    category: z.string("Category is required").trim().min(1, "Category is required"),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
