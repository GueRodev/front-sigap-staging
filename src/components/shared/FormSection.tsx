import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  /** Number of columns on `md+` viewports. Defaults to 2. */
  columns?: 1 | 2 | 3;
  className?: string;
}

const COLUMNS_CLASS: Record<NonNullable<FormSectionProps["columns"]>, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
};

const FormSection = ({ title, description, children, columns = 2, className }: FormSectionProps) => {
  return (
    <section className={cn("space-y-3", className)}>
      <header className="space-y-0.5">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </header>
      <div className={cn("grid grid-cols-1 gap-4", COLUMNS_CLASS[columns])}>{children}</div>
    </section>
  );
};

export default FormSection;
