import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Bell, LogOut, User as UserIcon, Menu } from 'lucide-react';
import api from '../utils/api';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    let interval;
    const fetchUnreadCount = async () => {
      if (user) {
        try {
          const res = await api.get('/notifications');
          const unread = res.data.filter(n => !n.isRead).length;
          setUnreadCount(unread);
        } catch (error) {
          console.error('Error fetching unread notifications:', error);
        }
      }
    };

    fetchUnreadCount();
    // Poll for notifications every 15 seconds for a dynamic feel
    if (user) {
      interval = setInterval(fetchUnreadCount, 15000);
    }
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-800/50 transition-all duration-300">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Section: Logo & Toggle */}
        <div className="flex items-center space-x-4">
          {user && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none lg:hidden"
            >
              <Menu size={20} />
            </button>
          )}
          
          <Link to="/" className="flex items-center space-x-2">
            <span className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-200 dark:shadow-none">
              S
            </span>
            <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              SGES
            </span>
          </Link>
        </div>

        {/* Right Section: Menu Items */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
          </button>

          {user && (
            <>
              {/* Notifications Link */}
              <Link
                to="/notifications"
                className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-rose-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 p-1 rounded-full focus:outline-none hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <img
                    src={user.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-violet-500/20"
                  />
                  <span className="hidden md:block text-sm font-medium text-slate-700 dark:text-slate-200 px-1">
                    {user.name}
                  </span>
                </button>

                {dropdownOpen && (
                  <>
                    {/* Backdrop */}
                    <div onClick={() => setDropdownOpen(false)} className="fixed inset-0 z-10" />
                    
                    <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-2xl py-1 z-20 animate-fade-in">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-200">{user.email}</p>
                      </div>
                      
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <UserIcon size={16} />
                        <span>Profile Settings</span>
                      </Link>
                      
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
