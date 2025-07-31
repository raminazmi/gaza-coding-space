import { useState, useEffect, useCallback } from 'react';
import useAuth from './useAuth';

export const useUnreadMessages = () => {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const { authService, isAuthenticated } = useAuth();

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadMessages(0);
      return;
    }

    try {
      const result = await authService.apiCall('/api/count-messages', {}, true);
      if (result.success) {
        setUnreadMessages(result.data?.messagesCount || 0);
      } else {
        setUnreadMessages(0);
      }
    } catch (error) {
      console.error('Error fetching unread messages count:', error);
      setUnreadMessages(0);
    }
  }, [authService, isAuthenticated]);

  const markAllAsRead = useCallback(async () => {
    if (!isAuthenticated || unreadMessages === 0) return;

    try {
      const result = await authService.apiCall('/api/messages/mark-all-read', {
        method: 'PUT'
      }, true);
      
      if (result.success) {
        setUnreadMessages(0);
      } else {
        console.error('Error marking messages as read:', result.message);
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [authService, isAuthenticated, unreadMessages]);

  // Fetch count on authentication change
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount, isAuthenticated]);

  return {
    unreadMessages,
    fetchUnreadCount,
    markAllAsRead,
    setUnreadMessages, // للتحديث المباشر من Firebase notifications
  };
};