import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/shared/NavLink";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { NavItem } from "./navigationConfig";

const TRANSITION = "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]";

const baseItemClass = `flex items-center gap-3 rounded-md px-3 py-2.5 text-[15px] font-display font-bold data-[active=true]:font-bold text-sidebar-foreground border-l-2 ${TRANSITION} hover:bg-sidebar-accent`;
const activeItemClass = "bg-sidebar-accent border-sidebar-primary";

interface SidebarNavItemProps {
  item: NavItem;
  collapsed: boolean;
}

const SidebarNavItem = ({ item, collapsed }: SidebarNavItemProps) => {
  const location = useLocation();
  const hasChildren = !!item.children?.length;
  const isSectionActive = hasChildren && location.pathname.startsWith(item.url);
  const [open, setOpen] = useState(isSectionActive);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Auto-open the group when navigating into one of its routes.
  useEffect(() => {
    if (isSectionActive) setOpen(true);
  }, [isSectionActive]);

  // Close the flyout popover whenever the route changes.
  useEffect(() => {
    setPopoverOpen(false);
  }, [location.pathname]);

  if (!hasChildren) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip={item.title}>
          <NavLink
            to={item.url}
            end={item.end}
            className={`${baseItemClass} border-transparent`}
            activeClassName={activeItemClass}
          >
            <item.icon className="h-4 w-4 shrink-0" strokeWidth={2.5} />
            <span
              className={`truncate whitespace-nowrap ${TRANSITION}`}
              style={{
                opacity: collapsed ? 0 : 1,
                maxWidth: collapsed ? 0 : 200,
              }}
            >
              {item.title}
            </span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  // Collapsed sidebar with children → use a Popover flyout so all subitems
  // remain reachable without expanding the sidebar.
  if (collapsed) {
    const isHighlighted = isSectionActive || popoverOpen;
    return (
      <SidebarMenuItem>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <SidebarMenuButton
              tooltip={item.title}
              isActive={isHighlighted}
              className={`${baseItemClass} ${
                isHighlighted ? activeItemClass : "border-transparent"
              } data-[state=open]:bg-sidebar-accent data-[state=open]:border-sidebar-primary`}
            >
              <item.icon className="h-4 w-4 shrink-0" strokeWidth={2.5} />
            </SidebarMenuButton>
          </PopoverTrigger>
          <PopoverContent
            side="right"
            align="start"
            sideOffset={8}
            className="w-56 p-2 bg-sidebar border-sidebar-border text-sidebar-foreground"
          >
            <div className="px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-sidebar-foreground/60">
              {item.title}
            </div>
            <div className="mt-1 flex flex-col gap-0.5">
              {item.children!.map((child) => (
                <NavLink
                  key={child.title}
                  to={child.url}
                  end={child.end}
                  onClick={() => setPopoverOpen(false)}
                  className="flex items-center gap-2 rounded-md px-2 py-2 text-[14px] font-semibold text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  activeClassName="bg-sidebar-accent text-sidebar-foreground"
                >
                  <child.icon className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                  <span className="truncate">{child.title}</span>
                </NavLink>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} asChild>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={isSectionActive}
            className={`${baseItemClass} ${
              isSectionActive ? activeItemClass : "border-transparent"
            }`}
          >
            <item.icon className="h-4 w-4 shrink-0" strokeWidth={2.5} />
            <span
              className={`flex-1 truncate whitespace-nowrap text-left ${TRANSITION}`}
              style={{
                opacity: collapsed ? 0 : 1,
                maxWidth: collapsed ? 0 : 200,
              }}
            >
              {item.title}
            </span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 ${TRANSITION}`}
              style={{
                opacity: collapsed ? 0 : 0.7,
                maxWidth: collapsed ? 0 : 16,
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
              }}
              strokeWidth={2.5}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children!.map((child) => (
              <SidebarMenuSubItem key={child.title}>
                <SidebarMenuSubButton asChild>
                  <NavLink
                    to={child.url}
                    end={child.end}
                    className="flex items-center gap-2 text-[14px] font-semibold text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    activeClassName="bg-sidebar-accent text-sidebar-foreground"
                  >
                    <child.icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                    <span>{child.title}</span>
                  </NavLink>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

export default SidebarNavItem;
