import { useState, useEffect, useCallback } from 'react';
import useAuth from './useAuth';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifCount, setNotifCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const { authService, isAuthenticated } = useAuth();

  const fetchNotificationsData = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setNotifCount(0);
      return;
    }

    setNotifLoading(true);
    try {
      // Fetch notifications count
      const countResult = await authService.apiCall('/api/notifications/count', {}, true);
      if (countResult.success) {
        setNotifCount(countResult.data || 0);
      } else {
        setNotifCount(0);
      }

      // Fetch notifications list
      const notificationsResult = await authService.apiCall('/api/notifications?page=1', {}, true);
      if (notificationsResult.success) {
        setNotifications(notificationsResult.data?.notifications?.data?.slice(0, 5) || []);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifCount(0);
      setNotifications([]);
    } finally {
      setNotifLoading(false);
    }
  }, [authService, isAuthenticated]);

  const markNotificationsAsRead = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const result = await authService.apiCall('/api/notifications/read_at', {
        method: 'PUT'
      }, true);
      
      if (result.success) {
        // Update local state to mark all as read
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read_at: new Date().toISOString() }))
        );
        setNotifCount(0);
      } else {
        console.error('Error marking notifications as read:', result.message);
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  }, [authService, isAuthenticated]);

  // Fetch notifications on authentication change
  useEffect(() => {
    fetchNotificationsData();
  }, [fetchNotificationsData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(fetchNotificationsData, 30000);
    return () => clearInterval(interval);
  }, [fetchNotificationsData, isAuthenticated]);

  return {
    notifications,
    notifCount,
    notifLoading,
    fetchNotificationsData,
    markNotificationsAsRead,
  };
};