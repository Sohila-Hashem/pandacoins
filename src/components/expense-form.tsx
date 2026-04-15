import { useCallback, useEffect, useState } from "react";
import { useCustomCategories } from "@/hooks/use-custom-categories";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, formatISO } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { type Expense } from "@/domain/expense";
import { type Currency } from "@/lib/constants";
import { expenseSchema, type ExpenseFormData } from "@/schemas/expense-schema";
import { cn } from "@/lib/utils";
import { AddCustomCategoryDialog } from "./add-custom-category-dialog";
import { CategorySelect } from "@/components/category-select";

interface ExpenseFormProps {
	onAddExpense: (expense: Omit<Expense, "id">) => void;
	editingExpense?: Expense;
	onUpdateExpense?: (expense: Expense) => void;
	onCancelEdit?: () => void;
	currency: Currency;
	className?: string;
}

export function ExpenseForm({
	editingExpense,
	currency,
	onAddExpense,
	onUpdateExpense,
	onCancelEdit,
	className,
}: ExpenseFormProps) {
	const { customCategories, add: onAddCustomCategory } = useCustomCategories();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [newCategoryInput, setNewCategoryInput] = useState("");
	const [newCategoryError, setNewCategoryError] = useState("");

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<ExpenseFormData>({
		resolver: zodResolver(expenseSchema),
		defaultValues: {
			description: editingExpense?.description ?? "",
			amount: editingExpense?.amount ?? undefined,
			date: editingExpense ? new Date(editingExpense.date) : undefined,
			category: editingExpense?.category ?? "",
		},
	});

	const resetForm = useCallback(() => {
		reset({
			description: "",
			amount: undefined,
			date: undefined,
			category: "",
		});
	}, [reset]);

	const setEditingExpense = useCallback((expense: Expense) => {
		reset({
			description: expense.description,
			amount: expense.amount,
			date: new Date(expense.date),
			category: expense.category,
		});
	}, [reset]);

	const onSubmit = (data: ExpenseFormData) => {
		const expenseData = {
			description: data.description,
			amount: data.amount,
			date: formatISO(data.date),
			category: data.category,
		};

		if (editingExpense && onUpdateExpense) {
			onUpdateExpense({ ...expenseData, id: editingExpense.id });
		} else {
			onAddExpense(expenseData);
		}

		resetForm();
	};

	useEffect(() => {
		if (editingExpense) {
			setEditingExpense(editingExpense);
			return;
		}
		resetForm();
	}, [editingExpense, resetForm, setEditingExpense]);

	const handleDialogOpenChange = (open: boolean) => {
		setDialogOpen(open);
		if (!open) {
			setNewCategoryInput("");
			setNewCategoryError("");
		}
	};

	return (
		<motion.div
			className={cn("h-full", className)}
			initial={{ opacity: 0, x: -50 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.5, type: "spring", delay: 0.1 }}
		>
			<motion.div
				className="h-full"
				whileHover={{ scale: 1.02 }}
				transition={{ type: "spring", stiffness: 300 }}
			>
				<Card className="p-4 h-full flex flex-col justify-center">
					<form role="form" aria-label="Add Expense" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Controller
								control={control}
								name="description"
								render={({ field }) => (
									<Input
										id="description"
										placeholder="Coffee at local cafe"
										value={field.value ?? ""}
										onChange={field.onChange}
									/>
								)}
							/>
							{errors.description && (
								<p className="text-sm text-destructive">{errors.description.message}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="amount">Amount ({currency.symbol})</Label>
							<Controller
								control={control}
								name="amount"
								render={({ field }) => (
									<Input
										id="amount"
										type="number"
										step="0.01"
										placeholder="0.00"
										value={field.value ?? ""}
										onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : e.target.value)}
									/>
								)}
							/>
							{errors.amount && (
								<p className="text-sm text-destructive">{errors.amount.message}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="date">Date</Label>
							<Controller
								control={control}
								name="date"
								render={({ field }) => (
									<Popover>
										<PopoverTrigger asChild>
											<Button
												id="date"
												variant="outline"
												className="w-full bg-input-background justify-start text-left font-normal"
											>
												<CalendarIcon className="mr-2 h-4 w-4" />
												{field.value && !Number.isNaN(new Date(field.value).getTime()) ? format(field.value, "PPP") : <span>Pick a date</span>}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar
												mode="single"
												selected={field.value}
												onSelect={field.onChange}
											/>
										</PopoverContent>
									</Popover>
								)}
							/>
							{errors.date && (
								<p className="text-sm text-destructive">{errors.date.message}</p>
							)}
						</div>

						<div className="space-y-2">
							{/* Category label row with inline + button */}
							<div className="flex items-center justify-between">
								<Label htmlFor="category">Category</Label>
								<AddCustomCategoryDialog dialogOpen={dialogOpen} handleDialogOpenChange={handleDialogOpenChange} newCategoryInput={newCategoryInput} setNewCategoryInput={setNewCategoryInput} newCategoryError={newCategoryError} setNewCategoryError={setNewCategoryError} handleAddCustomCategory={onAddCustomCategory} />
							</div>

							<Controller
								control={control}
								name="category"
								render={({ field }) => (
									<CategorySelect
										id="category"
										value={field.value ?? ""}
										onValueChange={field.onChange}
										customCategories={customCategories}
									/>
								)}
							/>
							{errors.category && (
								<p className="text-sm text-destructive">{errors.category.message}</p>
							)}
						</div>

						<div className="grid grid-cols-3 gap-2">
							<Button type="submit" className={cn("col-span-3", editingExpense && "col-span-2")}>
								{editingExpense ? "Update Expense" : "Add Expense"}
							</Button>
							{editingExpense && onCancelEdit && (
								<Button
									type="button"
									variant="outline"
									className="col-span-1"
									onClick={onCancelEdit}
								>
									Cancel
								</Button>
							)}
						</div>
					</form>
				</Card>
			</motion.div>
		</motion.div>
	);
}
