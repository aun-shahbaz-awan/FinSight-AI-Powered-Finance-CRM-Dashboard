"use client";

import { LogOut, Search } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { logout } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/auth-store";
import { NotificationDropdown } from '@/features/notifications/components/notification-dropdown';

const getInitials = (firstName?: string, lastName?: string) => {
  const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.trim();
  return initials || "FA";
};

export function DashboardTopbar() {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      clearSession();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background px-4 md:px-6">
      <div className="relative hidden w-full max-w-sm md:block">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-8" placeholder="Search clients, tickets, KYC..." />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <NotificationDropdown />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="gap-2 px-2" variant="ghost">
              <Avatar size="sm">
                <AvatarFallback>
                  {getInitials(user?.firstName, user?.lastName)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-32 truncate text-sm md:inline">
                {user ? `${user.firstName} ${user.lastName}` : "FinSight"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <span className="block truncate">
                {user ? `${user.firstName} ${user.lastName}` : "FinSight AI"}
              </span>
              <span className="block truncate text-xs font-normal text-muted-foreground">
                {user?.email ?? "Operations dashboard"}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
