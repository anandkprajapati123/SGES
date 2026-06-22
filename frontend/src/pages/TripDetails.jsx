import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  Calendar,
  Users,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Trash2,
  Edit2,
  Copy,
  Mail,
  ListFilter,
  DollarSign,
  Activity,
  History
} from 'lucide-react';

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [activities, setActivities] = useState([]);
  const [memberEmail, setMemberEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses', 'settlements', 'activities'

  const fetchTripDetails = async () => {
    try {
      const [tripRes, settlementsRes, activitiesRes] = await Promise.all([
        api.get(`/trips/${id}`),
        api.get(`/trips/${id}/settlements`),
        api.get(`/trips/${id}/activities`)
      ]);
      
      setTrip(tripRes.data.trip);
      setExpenses(tripRes.data.expenses);
      setSettlements(settlementsRes.data.settlements);
      setActivities(activitiesRes.data);
    } catch (error) {
      console.error('Error loading trip details:', error);
      toast.error('Failed to load trip details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail) return;

    setInviteLoading(true);
    try {
      await api.post(`/trips/${id}/invite`, { email: memberEmail });
      toast.success('Member added successfully!');
      setMemberEmail('');
      fetchTripDetails(); // Refresh details
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error(error.response?.data?.message || 'Failed to add member');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await api.delete(`/expenses/${expenseId}`);
        toast.success('Expense deleted successfully');
        fetchTripDetails(); // Refresh details
      } catch (error) {
        console.error('Error deleting expense:', error);
        toast.error(error.response?.data?.message || 'Failed to delete expense');
      }
    }
  };

  const copyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/join/${id}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success('Invite link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading trip details...</p>
        </div>
      </div>
    );
  }

  // Calculate user's overall balance in this trip
  let userNetBalance = 0;
  settlements.forEach((s) => {
    if (s.from.id === user._id) {
      userNetBalance -= s.amount;
    } else if (s.to.id === user._id) {
      userNetBalance += s.amount;
    }
  });

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const getPayerText = (expense) => {
    if (expense.multiplePayers && expense.multiplePayers.length > 0) {
      const activePayers = expense.multiplePayers.filter(p => p.amount > 0);
      if (activePayers.length === 1) {
        return activePayers[0].memberId?.name || 'Someone';
      } else if (activePayers.length > 1) {
        return `${activePayers.length} members`;
      }
    }
    return expense.paidBy?.name || 'Someone';
  };

  const getPayerTooltip = (expense) => {
    if (expense.multiplePayers && expense.multiplePayers.length > 0) {
      const activePayers = expense.multiplePayers.filter(p => p.amount > 0);
      return activePayers.map(p => `${p.memberId?.name || 'Someone'}: ₹${p.amount.toFixed(2)}`).join(', ');
    }
    return expense.paidBy?.name ? `${expense.paidBy.name}: ₹${expense.amount.toFixed(2)}` : '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Back to Dashboard and Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase mb-2">
            <Link to="/dashboard" className="hover:underline">Trips</Link>
            <span>/</span>
            <span className="text-slate-500">{trip.tripName}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {trip.tripName}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            {trip.description || 'No description added for this trip.'}
          </p>
        </div>

        {/* Quick Dates display */}
        {(trip.startDate || trip.endDate) && (
          <div className="flex items-center space-x-2.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 w-fit">
            <Calendar size={18} className="text-indigo-500" />
            <div className="text-xs">
              <p className="font-semibold text-slate-700 dark:text-slate-350">
                {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'Start'}
              </p>
              <p className="text-[10px] text-slate-400">
                to {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : 'End'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Total Group Spend */}
        <div className="glass-panel p-6 rounded-3xl flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Spending
            </p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
              ₹{totalSpent.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Net Personal Balance */}
        <div className="glass-panel p-6 rounded-3xl flex items-center space-x-4">
          <div className={`p-3 rounded-2xl ${
            userNetBalance > 0.05
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
              : userNetBalance < -0.05
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
              : 'bg-slate-50 dark:bg-slate-950/40 text-slate-500'
          }`}>
            {userNetBalance > 0.05 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Your Net Share
            </p>
            <h3 className={`text-2xl font-bold mt-1 ${
              userNetBalance > 0.05
                ? 'text-emerald-600 dark:text-emerald-400'
                : userNetBalance < -0.05
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-500'
            }`}>
              {userNetBalance > 0.05
                ? `You are owed ₹${userNetBalance.toFixed(2)}`
                : userNetBalance < -0.05
                ? `You owe ₹${Math.abs(userNetBalance).toFixed(2)}`
                : 'You are settled'}
            </h3>
          </div>
        </div>

        {/* Group size */}
        <div className="glass-panel p-6 rounded-3xl flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Group Size
            </p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
              {trip.members?.length || 0} Members
            </h3>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Dynamic tabs for Expenses, Settlements, Activities */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tab selector bar */}
          <div className="flex space-x-2 p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'expenses'
                  ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-650 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <History size={14} />
              <span>Expenses</span>
            </button>
            <button
              onClick={() => setActiveTab('settlements')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'settlements'
                  ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-650 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <DollarSign size={14} />
              <span>Who Pays Whom ({settlements.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'activities'
                  ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-650 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Activity size={14} />
              <span>Timeline</span>
            </button>
          </div>

          {/* Tab Content: Expenses */}
          {activeTab === 'expenses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Expense Register</h2>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/add-expense?tripId=${trip._id}`}
                    className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold shadow hover:from-violet-500 hover:to-indigo-500 transition-all"
                  >
                    <PlusCircle size={14} />
                    <span>Add Expense</span>
                  </Link>
                </div>
              </div>

              {expenses.length === 0 ? (
                <div className="glass-panel p-12 rounded-3xl text-center flex flex-col items-center justify-center">
                  <DollarSign size={36} className="text-slate-300 mb-3" />
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-350">No Expenses Recorded</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                    Get started by logging the first bill (hotels, foods, travel, shopping).
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {expenses.map((expense) => (
                    <div
                      key={expense._id}
                      className="glass-panel p-5 rounded-3xl flex items-center justify-between border-l-4 border-l-indigo-500 hover:border-l-indigo-600 hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all"
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        {/* Category Visual Badge */}
                        <div className="h-10 w-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                          {expense.category?.slice(0, 3) || 'MIS'}
                        </div>
                        
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-800 dark:text-white truncate">
                            {expense.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            Paid by <span className="font-semibold text-slate-700 dark:text-slate-350 cursor-help underline decoration-dotted" title={getPayerTooltip(expense)}>{getPayerText(expense)}</span> •{' '}
                            {new Date(expense.date).toLocaleDateString()} •{' '}
                            <span className="capitalize text-indigo-500 font-semibold">{expense.splitType} split</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-extrabold text-slate-800 dark:text-white">
                            ₹{expense.amount.toLocaleString()}
                          </p>
                          {((expense.multiplePayers && expense.multiplePayers.some(p => (p.memberId?._id || p.memberId) === user._id && p.amount > 0)) || (!expense.multiplePayers && expense.paidBy?._id === user._id)) ? (
                            <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider">You paid</p>
                          ) : (
                            <p className="text-[9px] text-slate-400 uppercase tracking-wider">Others paid</p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-1.5 border-l border-slate-100 dark:border-slate-800 pl-3">
                          <button
                            onClick={() => navigate(`/edit-expense/${expense._id}`)}
                            className="p-1.5 text-slate-400 hover:text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Who Pays Whom / Settlements */}
          {activeTab === 'settlements' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Debt Settlement Summary</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Optimal transaction steps calculated to clear all balances</p>
                </div>
                <Link
                  to={`/trips/${trip._id}/settlement`}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Record Settle Payment
                </Link>
              </div>

              {settlements.length === 0 ? (
                <div className="glass-panel p-12 rounded-3xl text-center flex flex-col items-center justify-center">
                  <Compass size={36} className="text-emerald-500 mb-3" />
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-350">All settled up!</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">No outstanding balances inside this group.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {settlements.map((s, idx) => (
                    <div
                      key={idx}
                      className="glass-panel p-4 rounded-2xl flex items-center justify-between border-l-4 border-l-emerald-500"
                    >
                      <div className="flex items-center space-x-3 text-sm">
                        <img
                          src={s.from.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${s.from.name}`}
                          alt={s.from.name}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                        <span className="font-semibold text-slate-700 dark:text-slate-250 truncate max-w-[100px]">{s.from.name}</span>
                        <span className="text-slate-450 dark:text-slate-400 font-medium">pays</span>
                        <img
                          src={s.to.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${s.to.name}`}
                          alt={s.to.name}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                        <span className="font-semibold text-slate-700 dark:text-slate-250 truncate max-w-[100px]">{s.to.name}</span>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                          ₹{s.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Timeline */}
          {activeTab === 'activities' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Activity Log</h2>
              
              <div className="glass-panel p-6 rounded-3xl min-h-[250px]">
                {activities.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-12">No activity logs recorded yet</p>
                ) : (
                  <div className="relative pl-4 space-y-6 border-l border-slate-100 dark:border-slate-800">
                    {activities.map((act) => (
                      <div key={act._id} className="relative group text-sm">
                        <div className="absolute left-[-21px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-indigo-500 bg-white dark:bg-slate-900" />
                        <div className="flex items-start space-x-2.5">
                          <img
                            src={act.performedBy?.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${act.performedBy?.name}`}
                            alt={act.performedBy?.name}
                            className="h-6 w-6 rounded-full object-cover mt-0.5"
                          />
                          <div>
                            <p className="text-slate-700 dark:text-slate-350">
                              <span className="font-semibold text-slate-900 dark:text-white">{act.performedBy?.name}</span>{' '}
                              {act.action}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {new Date(act.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side Widget Card: Member Administration */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Users size={18} className="text-indigo-500" />
              <span>Trip Members</span>
            </h3>

            {/* Quick Email add member form */}
            <form onSubmit={handleAddMember} className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Invite Member by Email
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  placeholder="friend@email.com"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="glass-input pl-9 pr-3.5 py-2 w-full text-xs text-slate-800 dark:text-slate-100"
                />
              </div>
              <button
                type="submit"
                disabled={inviteLoading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                {inviteLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span>Add Member</span>
                )}
              </button>
            </form>

            {/* Copy invite link */}
            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Share Invitation Link
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/join/${trip._id}`}
                  className="glass-input px-3 py-2 w-full text-[10px] text-slate-500 bg-slate-50 dark:bg-slate-950/40 select-all border-dashed outline-none"
                />
                <button
                  type="button"
                  onClick={copyInviteLink}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                  title="Copy Link"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>

            {/* Populate active member items */}
            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                Member Directory ({trip.members?.length})
              </label>
              
              <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1">
                {trip.members?.map((m) => (
                  <div key={m._id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <img
                        src={m.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${m.name}`}
                        alt={m.name}
                        className="h-7 w-7 rounded-full object-cover ring-2 ring-primary-500/10"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 dark:text-white truncate">
                          {m.name}
                        </p>
                        <p className="text-[10px] text-slate-450 truncate">{m.email}</p>
                      </div>
                    </div>
                    {trip.creator?._id?.toString() === m._id?.toString() && (
                      <span className="text-[8px] font-bold uppercase tracking-wider bg-violet-100 dark:bg-violet-950/40 text-violet-850 dark:text-violet-400 px-1.5 py-0.5 rounded-md">
                        Creator
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default TripDetails;
