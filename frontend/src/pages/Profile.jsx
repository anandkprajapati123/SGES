import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { User, Mail, Lock, Sparkles, Image } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profilePicture: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        profilePicture: user.profilePicture || '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, profilePicture, password, confirmPassword } = formData;

    if (!name || !email) {
      toast.error('Name and Email are required');
      return;
    }

    if (password) {
      if (password.length < 6) {
        toast.error('New password must be at least 6 characters long');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }
    }

    setLoading(true);
    const updateData = { name, email, profilePicture };
    if (password) {
      updateData.password = password;
    }

    const result = await updateProfile(updateData);
    setLoading(false);

    if (result.success) {
      toast.success('Profile updated successfully!');
      // Clear password fields
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center space-x-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center text-primary-600 dark:text-primary-400">
          <Sparkles size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your profile details and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card Side */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center h-fit text-center">
          <img
            src={formData.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${formData.name}`}
            alt={formData.name}
            className="h-28 w-28 rounded-full object-cover ring-4 ring-primary-500/20 mb-4"
          />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
            {formData.name || 'User Name'}
          </h2>
          <p className="text-sm text-slate-450 truncate max-w-[200px] mb-2">{formData.email}</p>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-950/40 text-primary-800 dark:text-primary-400">
            Active Splitter
          </span>
        </div>

        {/* Profile Edit Form Side */}
        <div className="md:col-span-2 glass-panel p-8 rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Name */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-400">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="glass-input pl-11 w-full text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-400">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="glass-input pl-11 w-full text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* Avatar URL */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-455 uppercase tracking-wider mb-2">
                Avatar / Profile Picture URL (Optional)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400">
                  <Image size={18} />
                </span>
                <input
                  type="text"
                  name="profilePicture"
                  value={formData.profilePicture}
                  onChange={handleChange}
                  placeholder="Leave empty for dynamic initials"
                  className="glass-input pl-11 w-full text-slate-850 dark:text-slate-100 text-xs"
                />
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800/80 my-2" />
            
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Change Password (Leave blank to keep current)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Password */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-505 dark:text-slate-450 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-400">
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="glass-input pl-11 w-full text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-400">
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="glass-input pl-11 w-full text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/20 dark:shadow-none transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  'Save Profile Details'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
