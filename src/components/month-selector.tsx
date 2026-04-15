import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { format } from "date-fns";

interface MonthSelectorProps {
  readonly availableMonths: string[];
  readonly selectedMonth: string;
  readonly setSelectedMonth: (month: string) => void;
}

export function MonthSelector({ availableMonths, selectedMonth, setSelectedMonth }: MonthSelectorProps) {
  return (
    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
      <SelectTrigger className="flex-1" aria-label="Select a month">
        <SelectValue placeholder="Select a month" />
      </SelectTrigger>
      <SelectContent>
        {availableMonths.length === 0 ? (
          <SelectItem value="none" disabled>
            No expenses yet
          </SelectItem>
        ) : (
          availableMonths.map((month) => (
            <SelectItem key={month} value={month}>
              {format(new Date(month + "-01"), "MMMM yyyy")}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}