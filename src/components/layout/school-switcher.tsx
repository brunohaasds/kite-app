"use client";

import { ChevronDown, Store } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Organization {
  id: number;
  name: string;
}

interface SchoolSwitcherProps {
  organizations: Organization[];
  currentOrgId: number | null;
  onSwitch: (orgId: number) => void;
}

export function SchoolSwitcher({
  organizations,
  currentOrgId,
  onSwitch,
}: SchoolSwitcherProps) {
  const currentOrg = organizations.find((o) => o.id === currentOrgId);

  if (organizations.length <= 1) {
    return (
      <div className="flex items-center gap-2 text-sm font-medium">
        <Store className="h-4 w-4 text-primary" />
        <span className="truncate">{currentOrg?.name ?? "Escola"}</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Store className="h-4 w-4 text-primary" />
          <span className="max-w-[150px] truncate">
            {currentOrg?.name ?? "Escola"}
          </span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => onSwitch(org.id)}
            className={org.id === currentOrgId ? "bg-accent" : ""}
          >
            {org.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
