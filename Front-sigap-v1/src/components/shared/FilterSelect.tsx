import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  options: FilterOption[];
  placeholder?: string;
  allLabel?: string;
  className?: string;
}

const ALL_VALUE = "__all__";

const FilterSelect = ({
  value,
  onChange,
  options,
  placeholder = "Todos",
  allLabel = "Todos",
  className,
}: FilterSelectProps) => {
  return (
    <Select
      value={value ?? ALL_VALUE}
      onValueChange={(next) => onChange(next === ALL_VALUE ? undefined : next)}
    >
      <SelectTrigger className={cn("h-10 font-semibold text-sidebar [&>span]:font-semibold [&>svg]:text-sidebar", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_VALUE}>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default FilterSelect;
