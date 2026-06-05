'use client';

import { useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
  getMyNotifications,
  markNotificationAsRead,
} from '@/features/notifications/api';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/features/auth/auth-store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function NotificationDropdown() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: getMyNotifications,
    enabled: Boolean(user?.id),
  });

  const readMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  useEffect(() => {
    if (!user?.id) return;

    const socket = getSocket(user.id);

    socket.on('notification:new', () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    return () => {
      socket.off('notification:new');
    };
  }, [user?.id, queryClient]);

  const unreadCount =
    data?.filter((item: any) => !item.readAt)?.length || 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />

          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white">
              {unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="border-b p-3">
          <p className="font-medium">Notifications</p>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {data?.length ? (
            data.map((notification: any) => (
              <button
                key={notification.id}
                className="w-full border-b p-3 text-left hover:bg-muted"
                onClick={() => readMutation.mutate(notification.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.message}
                    </p>
                  </div>

                  {!notification.readAt ? (
                    <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                  ) : null}
                </div>
              </button>
            ))
          ) : (
            <p className="p-4 text-sm text-muted-foreground">
              No notifications yet.
            </p>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}