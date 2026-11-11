import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { AreaUser } from "../types/area.types";

interface AssignedUsersStackProps {
  users: AreaUser[];
  size?: "sm" | "md";
  showFirstName?: boolean;
  className?: string;
}

const AssignedUsersStack = ({
  users,
  size = "md",
  showFirstName = true,
  className,
}: AssignedUsersStackProps) => {
  if (users.length === 0) return null;

  const dim = size === "sm" ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs";
  const visible = users.slice(0, 2);
  const extra = users.length - visible.length;

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex -space-x-2">
        {visible.map((u) => (
          <Avatar key={u.id} className={cn(dim, "border-2 border-card ring-0")}>
            <AvatarFallback className="bg-sigap-sky/20 font-semibold text-sigap-dark dark:text-sigap-sky">
              {u.initials}
            </AvatarFallback>
          </Avatar>
        ))}
        {extra > 0 && (
          <div
            className={cn(
              dim,
              "flex items-center justify-center rounded-full border-2 border-card bg-muted font-semibold text-muted-foreground",
            )}
          >
            +{extra}
          </div>
        )}
      </div>
      {showFirstName && (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {visible[0].name}
            {extra > 0 && (
              <span className="text-muted-foreground"> y {extra} más</span>
            )}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            Encargado{users.length > 1 ? "s" : ""} de Área
          </p>
        </div>
      )}
    </div>
  );
};

export default AssignedUsersStack;
