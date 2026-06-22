import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { Bell, Sparkles, Check, CheckSquare } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      // Update state locally
      setNotifications(
        notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      toast.success('All notifications marked as read');
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications read:', error);
      toast.error('Failed to mark notifications read');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading notifications...</p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center text-primary-600 dark:text-primary-400">
            <Bell size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Stay updated with activity alerts inside your group splits
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
          >
            <CheckSquare size={14} />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Notifications list */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-xl shadow-slate-100/50 dark:shadow-none">
        {notifications.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <Sparkles size={40} className="text-slate-300 dark:text-slate-700 mb-4" />
            <p className="text-sm font-semibold text-slate-805 dark:text-slate-300">You are all caught up!</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">No alerts or notifications recorded.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                className={`p-5 flex items-start justify-between gap-4 transition-colors cursor-pointer select-none ${
                  !n.isRead
                    ? 'bg-primary-50/30 dark:bg-primary-950/10 hover:bg-primary-50/50 dark:hover:bg-primary-950/20'
                    : 'bg-transparent hover:bg-slate-50/40 dark:hover:bg-slate-850/10'
                }`}
              >
                <div className="flex items-start space-x-3.5 min-w-0">
                  {/* Glowing unread bullet indicator */}
                  <div className="relative mt-1.5">
                    {!n.isRead ? (
                      <span className="flex h-2 w-2 rounded-full bg-primary-600 dark:bg-primary-400">
                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary-400 opacity-75"></span>
                      </span>
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700 block" />
                    )}
                  </div>
                  
                  <div className="min-w-0">
                    <p className={`text-sm leading-relaxed ${!n.isRead ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-655 dark:text-slate-400'}`}>
                      {n.message}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                      {new Date(n.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {!n.isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(n._id);
                    }}
                    className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 text-slate-400 hover:text-indigo-600 transition-colors"
                    title="Mark as read"
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
