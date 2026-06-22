import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, History, Bell, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  if (!user) return null;

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Create Trip', path: '/create-trip', icon: PlusCircle },
    { name: 'Expense History', path: '/expense-history', icon: History },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Profile Settings', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-slate-800/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-[calc(100vh-4rem)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full justify-between py-6 px-4">
          <div className="space-y-6">
            
            {/* Header info in mobile drawer */}
            <div className="flex items-center justify-between lg:hidden border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <img
                  src={user.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                  alt={user.name}
                  className="h-8 w-8 rounded-full"
                />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                  {user.name}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Menu Links */}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 border-r-4 border-primary-600'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200'
                      }`
                    }
                  >
                    <IconComponent size={18} />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Quick Stats Summary inside Sidebar */}
          <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/60">
            <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Workspace Overview
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Track active shared budgets, divide trip expenses, and settle balances instantly.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
