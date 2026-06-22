import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, DollarSign, Users, Award, Bell, Shield, Sparkles } from 'lucide-react';

const Home = () => {
  const { token } = useAuth();

  const features = [
    {
      title: 'Smart Split Options',
      description: 'Split bills equally among members or specify custom splits down to the penny.',
      icon: DollarSign,
      color: 'from-violet-500 to-indigo-500',
    },
    {
      title: 'Group Budgets',
      description: 'Create trips, outings, shared flats, or parties and keep expense tracking organized.',
      icon: Users,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'Greedy Settlement Engine',
      description: 'Get an optimal "Who Pays Whom" breakdown minimizing transactions required to settle.',
      icon: Award,
      color: 'from-amber-500 to-orange-500',
    },
    {
      title: 'Activity Timelines',
      description: 'View chronological audit trails of who added, edited, or deleted any group expense.',
      icon: Sparkles,
      color: 'from-pink-500 to-rose-500',
    },
    {
      title: 'Real-time Notifications',
      description: 'Get notified immediately whenever someone adds an expense or settles a debt.',
      icon: Bell,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Secure Accounts',
      description: 'Your profiles and splitting histories are fully locked and protected by JWT auth.',
      icon: Shield,
      color: 'from-purple-500 to-indigo-500',
    },
  ];

  return (
    <div className="relative overflow-hidden min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      {/* Background blobs for premium glassmorphism theme */}
      <div className="absolute top-12 left-10 w-72 h-72 bg-violet-400/20 dark:bg-violet-600/10 rounded-full filter blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full filter blur-3xl" />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center z-10 animate-fade-in">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/30 border border-primary-200/50 dark:border-primary-850 mb-6">
          <Sparkles size={16} className="text-primary-600 dark:text-primary-400" />
          <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
            Settle debts optimally in seconds
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
          Split Expenses, <br />
          <span className="bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Not Friendships.
          </span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
          The ultimate group expense manager. Track shared bills for trips, flatmates, events, and dinners. Settle balances easily with optimized transaction pathing.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {token ? (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/20 dark:hover:shadow-none hover:translate-y-[-1px] transition-all"
            >
              <span>Go to Dashboard</span>
              <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/20 dark:hover:shadow-none hover:translate-y-[-1px] transition-all"
              >
                <span>Get Started Now</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-850 hover:translate-y-[-1px] transition-all"
              >
                <span>Log In</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 z-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
          Everything you need to divide budgets
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="glass-panel glass-panel-hover p-6 rounded-3xl"
              >
                <div className={`h-12 w-12 rounded-2xl bg-gradient-to-tr ${feature.color} flex items-center justify-center text-white shadow-md shadow-slate-100 dark:shadow-none mb-6`}>
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 dark:border-slate-850 py-6 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} SGES (Smart Group Expense Splitter). All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
