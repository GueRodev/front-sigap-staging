import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAGE_SIZE_OPTIONS } from "@/config/app.config";
import { cn } from "@/lib/utils";

interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: readonly number[];
  itemLabel?: string;
}

/**
 * Build a list of page numbers / ellipsis entries for compact pagination.
 * Examples:
 *  - 5 pages, current 3  → [1,2,3,4,5]
 *  - 10 pages, current 1 → [1,2,3,'…',10]
 *  - 10 pages, current 5 → [1,'…',4,5,6,'…',10]
 */
const getPageItems = (current: number, total: number): (number | "ellipsis")[] => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const items: (number | "ellipsis")[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  if (left > 2) items.push("ellipsis");
  for (let i = left; i <= right; i++) items.push(i);
  if (right < total - 1) items.push("ellipsis");

  items.push(total);
  return items;
};

const DataTablePagination = ({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  itemLabel = "registros",
}: DataTablePaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, total);

  const canPrev = safePage > 1;
  const canNext = safePage < totalPages;

  const pageItems = getPageItems(safePage, totalPages);

  return (
    <div className="flex flex-col-reverse items-center justify-between gap-3 py-3 sm:flex-row">
      <div className="flex items-center gap-4">
        <p className="text-xs text-muted-foreground">
          Mostrando <span className="font-medium text-foreground">{start}</span>–
          <span className="font-medium text-foreground">{end}</span> de{" "}
          <span className="font-medium text-foreground">{total}</span> {itemLabel}
        </p>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Filas</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-[72px] border-slate-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1 border-slate-300 font-semibold"
          onClick={() => onPageChange(safePage - 1)}
          disabled={!canPrev}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>

        <div className="flex items-center gap-1 px-1">
          {pageItems.map((item, idx) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 text-xs text-muted-foreground"
                aria-hidden
              >
                …
              </span>
            ) : (
              <Button
                key={item}
                variant={item === safePage ? "default" : "outline"}
                size="icon"
                className={cn(
                  "h-8 w-8 text-xs font-semibold",
                  item === safePage
                    ? "bg-sidebar text-sidebar-foreground hover:bg-sidebar/90"
                    : "border-slate-300",
                )}
                onClick={() => onPageChange(item)}
                aria-label={`Página ${item}`}
                aria-current={item === safePage ? "page" : undefined}
              >
                {item}
              </Button>
            ),
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1 border-slate-300 font-semibold"
          onClick={() => onPageChange(safePage + 1)}
          disabled={!canNext}
          aria-label="Página siguiente"
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DataTablePagination;
