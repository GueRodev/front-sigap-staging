import { cn } from "@/lib/utils";

import { BASE_ROLE_LABELS, BASE_ROLE_STYLES } from "../constants/people.constants";
import type { BaseRole } from "../types/user.types";

interface BaseRoleBadgeProps {
  role: BaseRole;
}

const BaseRoleBadge = ({ role }: BaseRoleBadgeProps) => {
  const styles = BASE_ROLE_STYLES[role];

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-semibold", styles.pill)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
      {BASE_ROLE_LABELS[role]}
    </span>
  );
};

export default BaseRoleBadge;