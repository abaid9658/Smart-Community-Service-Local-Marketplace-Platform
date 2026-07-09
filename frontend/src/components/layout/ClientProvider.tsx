'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationStore } from '@/store/notification.store';
import { initSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { notificationAPI } from '@/lib/api';

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, accessToken, user } = useAuthStore();
  const { addNotification, setNotifications } = useNotificationStore();

  useEffect(() => {
    // 1. If not authenticated, make sure to clean up the socket
    if (!isAuthenticated || !accessToken) {
      disconnectSocket();
      return;
    }

    // 2. Initialize Socket Connection globally
    const socket = initSocket(accessToken);

    // 3. Setup global real-time notifications listener
    socket.on('notification:received', (notification: any) => {
      // Add notification to Zustand store
      addNotification(notification);
    });

    // 4. Load initial notifications state and unread count
    notificationAPI.list()
      .then(({ data }) => {
        setNotifications(
          data.data?.notifications || [],
          data.data?.unreadCount || 0
        );
      })
      .catch((err) => console.error('Failed to load initial notifications:', err));

    return () => {
      socket.off('notification:received');
    };
  }, [isAuthenticated, accessToken, addNotification, setNotifications]);

  return <>{children}</>;
}
