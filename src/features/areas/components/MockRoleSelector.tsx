import { UserCog } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { FUNCTIONAL_ROLE_LABEL } from "../constants/areaType.constants";
import { useCurrentMockUser } from "../hooks/useCurrentMockUser";
import { useAreasStore } from "../hooks/useAreasStore";

/**
 * Mock role selector — lets demo viewers switch personas so they can see
 * how the Areas module reacts to different permission scopes.
 * Only the first 5 mock users are exposed here (one per role).
 */
const MockRoleSelector = () => {
  const users = useAreasStore((s) => s.users);
  const { user, setCurrentMockUser } = useCurrentMockUser();

  const selectable = users.slice(0, 5);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 px-2 text-left">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-sigap-sky/25 text-[10px] font-semibold text-sigap-dark dark:text-sigap-sky">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold leading-tight text-foreground">{user.name}</p>
            <p className="text-[10px] leading-tight text-muted-foreground">
              {FUNCTIONAL_ROLE_LABEL[user.functionalRole]}
            </p>
          </div>
          <UserCog className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs">Cambiar usuario (demo)</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {selectable.map((u) => (
          <DropdownMenuItem
            key={u.id}
            onClick={() => setCurrentMockUser(u.id)}
            className="flex items-center gap-2"
          >
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-muted text-[10px] font-semibold">
                {u.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{u.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {FUNCTIONAL_ROLE_LABEL[u.functionalRole]}
              </p>
            </div>
            {u.id === user.id && <span className="text-[10px] text-primary">Activo</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MockRoleSelector;
