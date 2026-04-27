import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { connectSocket, disconnectSocket, getSocket } from '../lib/socket';
import { useChatStore } from '../stores/chatStore';
import { useNotificationStore } from '../stores/notificationStore';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const addIncomingMessage = useChatStore((state) => state.addIncomingMessage);
  const updateMessageStatus = useChatStore((state) => state.updateMessageStatus);
  const addNotification = useNotificationStore((state) => state.addNotification);

  useEffect(() => {
    if (!token || !user) return;

    const socket = connectSocket(token);

    socket.on('new_message', (message) => {
      addIncomingMessage(message);
    });

    socket.on('message_status_update', ({ messageId, status }) => {
      updateMessageStatus(messageId, status);
    });

    socket.on('notification', (notification) => {
      addNotification(notification);
    });

    return () => {
      disconnectSocket();
    };
  }, [token, user, addIncomingMessage, updateMessageStatus, addNotification]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

