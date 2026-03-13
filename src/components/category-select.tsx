import { Tag } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CATEGORIES_SORTED } from "@/domain/expense";

interface CategorySelectProps {
    readonly value: string;
    readonly onValueChange: (value: string) => void;
    readonly customCategories?: string[];
    readonly showAllOption?: boolean;
    readonly placeholder?: string;
    readonly id?: string;
    readonly triggerClassName?: string;
}

export function CategorySelect({
    value,
    onValueChange,
    customCategories = [],
    showAllOption = false,
    placeholder = "Select category",
    id,
    triggerClassName,
}: CategorySelectProps) {
    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger id={id} className={triggerClassName}>
                <SelectValue aria-label="Select category" placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {showAllOption && (
                    <>
                        <SelectItem value="all">All Categories</SelectItem>
                        {(customCategories.length > 0 || CATEGORIES_SORTED.length > 0) && (
                            <SelectSeparator />
                        )}
                    </>
                )}
                {customCategories.length > 0 && (
                    <>
                        <SelectGroup>
                            <SelectLabel className="flex items-center gap-1.5">
                                <Tag className="size-3" />
                                My Categories
                            </SelectLabel>
                            {[...customCategories]
                                .sort((a, b) => a.localeCompare(b))
                                .map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                        </SelectGroup>
                        <SelectSeparator />
                    </>
                )}
                <SelectGroup>
                    <SelectLabel>Preset Categories</SelectLabel>
                    {CATEGORIES_SORTED.map((cat) => (
                        <SelectItem key={cat.category} value={cat.category}>
                            {cat.category}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}
