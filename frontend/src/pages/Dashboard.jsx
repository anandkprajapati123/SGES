import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import {
  TrendingDown,
  TrendingUp,
  Plus,
  Compass,
  DollarSign,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalExpenses: 0,
    amountOwedByOthers: 0,
    amountUserOwesOthers: 0,
    recentActivities: [],
    recentNotifications: []
  });
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, tripsRes] = await Promise.all([
          api.get('/dashboard'),
          api.get('/trips')
        ]);
        setStats(statsRes.data);
        setTrips(tripsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Assembling dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Welcome & Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 p-8 text-white shadow-xl shadow-indigo-100 dark:shadow-none">
        <div className="absolute right-0 top-0 translate-x-12 translate-y-[-12px] opacity-10 pointer-events-none">
          <Compass size={300} />
        </div>
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl font-extrabold mb-2 flex items-center space-x-2">
            <span>Dashboard Overview</span>
            <Sparkles size={24} className="text-amber-300 animate-pulse" />
          </h1>
          <p className="text-violet-100 text-sm leading-relaxed mb-6">
            Track balances, add shared invoices, view recent settlement payments, and coordinate splits with colleagues immediately.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/create-trip"
              className="px-5 py-2.5 rounded-xl bg-white text-indigo-600 font-bold hover:bg-violet-50 transition-all flex items-center space-x-1.5 shadow-sm text-sm"
            >
              <Plus size={16} />
              <span>Create New Trip</span>
            </Link>
            {trips.length > 0 && (
              <button
                onClick={() => {
                  // Direct to add expense for the first trip or choose
                  navigate(`/trips/${trips[0]._id}`);
                  toast.info(`Opening details for "${trips[0].tripName}" to add expense.`);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-700/50 text-white border border-indigo-500/30 font-semibold hover:bg-indigo-700/70 transition-all flex items-center space-x-1.5 text-sm"
              >
                <Plus size={16} />
                <span>Add Shared Expense</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Balance Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Active Trips Card */}
        <div className="glass-panel p-6 rounded-3xl flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <Compass size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Active Trips
            </p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
              {stats.totalTrips}
            </h3>
          </div>
        </div>

        {/* Overall Spending Card */}
        <div className="glass-panel p-6 rounded-3xl flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Overall Expenses
            </p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
              ₹{stats.totalExpenses.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* You are Owed Card */}
        <div className="glass-panel p-6 rounded-3xl flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              You are owed
            </p>
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              ₹{stats.amountOwedByOthers.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* You Owe Card */}
        <div className="glass-panel p-6 rounded-3xl flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              You owe
            </p>
            <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              ₹{stats.amountUserOwesOthers.toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Dashboard Workspace split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Active Trips list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Trips & Groups</h2>
            <Link
              to="/create-trip"
              className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center space-x-1"
            >
              <span>View all</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {trips.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl text-center flex flex-col items-center justify-center">
              <Compass size={48} className="text-slate-300 dark:text-slate-700 mb-4 animate-bounce" />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">No Active Trips Found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-450 mb-6 max-w-sm">
                Get started by creating a trip for a tour, farewell party, or home shared expenses.
              </p>
              <Link
                to="/create-trip"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-500 transition-all"
              >
                Create Trip
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {trips.slice(0, 4).map((trip) => (
                <div
                  key={trip._id}
                  onClick={() => navigate(`/trips/${trip._id}`)}
                  className="glass-panel glass-panel-hover p-6 rounded-3xl cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate pr-2">
                        {trip.tripName}
                      </h3>
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(trip.createdAt).toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                      {trip.description || 'No description provided.'}
                    </p>
                  </div>
                  
                  <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex items-center justify-between text-xs text-slate-500">
                    <div>
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        ₹{trip.totalAmountSpent?.toLocaleString() || 0}
                      </p>
                      <p className="text-[10px] text-slate-400">Total Spent</p>
                    </div>
                    <div className="flex items-center -space-x-1.5">
                      {trip.members?.slice(0, 3).map((m, index) => (
                        <img
                          key={m._id}
                          src={m.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${m.name}`}
                          alt={m.name}
                          title={m.name}
                          className="h-6 w-6 rounded-full border-2 border-white dark:border-slate-900 object-cover"
                        />
                      ))}
                      {trip.members?.length > 3 && (
                        <span className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-bold text-slate-650">
                          +{trip.members.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Activity Timeline */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Activities</h2>
          
          <div className="glass-panel p-6 rounded-3xl min-h-[300px]">
            {stats.recentActivities.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <Clock size={32} className="text-slate-300 dark:text-slate-700 mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">No recent activities logged</p>
              </div>
            ) : (
              <div className="relative pl-4 space-y-6 border-l border-slate-100 dark:border-slate-800">
                {stats.recentActivities.map((act) => (
                  <div key={act._id} className="relative group text-sm">
                    {/* Circle timeline dot */}
                    <div className="absolute left-[-21px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-indigo-500 bg-white dark:bg-slate-900 group-hover:scale-110 transition-transform" />
                    
                    <div className="flex items-start space-x-2.5">
                      <img
                        src={act.performedBy?.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${act.performedBy?.name}`}
                        alt={act.performedBy?.name}
                        className="h-6 w-6 rounded-full object-cover mt-0.5"
                      />
                      <div className="space-y-1">
                        <p className="text-slate-600 dark:text-slate-300 leading-tight">
                          <span className="font-semibold text-slate-800 dark:text-white">
                            {act.performedBy?.name || 'Someone'}
                          </span>{' '}
                          {act.action}
                        </p>
                        {act.tripId && (
                          <p className="text-[10px] text-primary-500 font-semibold uppercase tracking-wider">
                            {act.tripId?.tripName}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-405 font-medium">
                          {new Date(act.createdAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
