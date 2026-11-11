import { cn } from "@/lib/utils";

import { USER_STATUS_LABELS, USER_STATUS_STYLES } from "../constants/people.constants";
import type { UserStatus } from "../types/user.types";

interface UserStatusBadgeProps {
  status: UserStatus;
}

const UserStatusBadge = ({ status }: UserStatusBadgeProps) => {
  const styles = USER_STATUS_STYLES[status];

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-semibold", styles.pill)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
      {USER_STATUS_LABELS[status]}
    </span>
  );
};

export default UserStatusBadge;