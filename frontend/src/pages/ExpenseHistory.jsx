import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import {
  History,
  Search,
  SlidersHorizontal,
  Compass,
  Tag,
  DollarSign,
  Calendar,
  ArrowUpDown,
  Trash2,
  Edit2
} from 'lucide-react';

const ExpenseHistory = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    tripId: '',
    category: '',
    amountMin: '',
    amountMax: '',
    dateMin: '',
    dateMax: ''
  });
  const [sortOption, setSortOption] = useState('date-desc');

  const categories = ['Food', 'Hotel', 'Transport', 'Shopping', 'Fuel', 'Entertainment', 'Miscellaneous'];

  const fetchExpensesAndTrips = async () => {
    try {
      const [expensesRes, tripsRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/trips')
      ]);
      setExpenses(expensesRes.data);
      setTrips(tripsRes.data);
    } catch (error) {
      console.error('Error fetching expense history:', error);
      toast.error('Failed to load expense history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpensesAndTrips();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleResetFilters = () => {
    setFilters({
      tripId: '',
      category: '',
      amountMin: '',
      amountMax: '',
      dateMin: '',
      dateMax: ''
    });
    setSearchQuery('');
    setSortOption('date-desc');
  };

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await api.delete(`/expenses/${expenseId}`);
        toast.success('Expense deleted successfully');
        fetchExpensesAndTrips(); // Refresh
      } catch (error) {
        console.error('Error deleting expense:', error);
        toast.error('Failed to delete expense');
      }
    }
  };

  // Perform Client-side filtering & searching
  const filteredExpenses = expenses
    .filter((expense) => {
      // Search matches title, category, or payer name
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const matchesTitle = expense.title?.toLowerCase().includes(query);
        const matchesCategory = expense.category?.toLowerCase().includes(query);
        const matchesPayer = expense.paidBy?.name?.toLowerCase().includes(query) || (expense.multiplePayers && expense.multiplePayers.some(p => p.memberId?.name?.toLowerCase().includes(query)));
        const matchesTrip = expense.tripId?.tripName?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCategory && !matchesPayer && !matchesTrip) {
          return false;
        }
      }

      // Filter by Trip
      if (filters.tripId && expense.tripId?._id !== filters.tripId) {
        return false;
      }

      // Filter by Category
      if (filters.category && expense.category !== filters.category) {
        return false;
      }

      // Filter by Min Amount
      if (filters.amountMin && expense.amount < parseFloat(filters.amountMin)) {
        return false;
      }

      // Filter by Max Amount
      if (filters.amountMax && expense.amount > parseFloat(filters.amountMax)) {
        return false;
      }

      // Filter by Min Date
      if (filters.dateMin && new Date(expense.date) < new Date(filters.dateMin)) {
        return false;
      }

      // Filter by Max Date
      if (filters.dateMax) {
        const dMax = new Date(filters.dateMax);
        dMax.setHours(23, 59, 59, 999); // Include entire day
        if (new Date(expense.date) > dMax) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (sortOption === 'date-desc') {
        return new Date(b.date) - new Date(a.date);
      }
      if (sortOption === 'date-asc') {
        return new Date(a.date) - new Date(b.date);
      }
      if (sortOption === 'amount-desc') {
        return b.amount - a.amount;
      }
      if (sortOption === 'amount-asc') {
        return a.amount - b.amount;
      }
      return 0;
    });

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Assembling expense logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Title */}
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center text-primary-600 dark:text-primary-400">
          <History size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Expense History</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Filter, search, and manage bills across all trips</p>
        </div>
      </div>

      {/* Search & Sort & Filter Toggle Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        
        {/* Search bar */}
        <div className="relative flex items-center w-full">
          <span className="absolute left-3.5 text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by title, category, payer, or trip name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input pl-11 w-full text-slate-800 dark:text-slate-100 text-sm"
          />
        </div>

        {/* Action controllers */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Sorting */}
          <div className="relative flex items-center min-w-[140px] w-full sm:w-auto">
            <span className="absolute left-3.5 text-slate-400 pointer-events-none">
              <ArrowUpDown size={16} />
            </span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="glass-input pl-10 pr-8 py-2.5 w-full text-slate-800 dark:text-slate-100 text-xs appearance-none"
            >
              <option value="date-desc">Latest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all w-full sm:w-auto ${
              showFilters
                ? 'bg-primary-50 dark:bg-primary-955/40 text-primary-600 dark:text-primary-400 border-primary-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350'
            }`}
          >
            <SlidersHorizontal size={16} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters Drawer Panel */}
      {showFilters && (
        <div className="glass-panel p-6 rounded-3xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* Trip Group Filter */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Trip / Group</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400"><Compass size={16} /></span>
              <select
                name="tripId"
                value={filters.tripId}
                onChange={handleFilterChange}
                className="glass-input pl-9 w-full text-xs text-slate-700 dark:text-slate-200 appearance-none"
              >
                <option value="">All Trips</option>
                {trips.map(t => (
                  <option key={t._id} value={t._id}>{t.tripName}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400"><Tag size={16} /></span>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="glass-input pl-9 w-full text-xs text-slate-700 dark:text-slate-205 appearance-none"
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount range */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Amount Limits (₹)</label>
            <div className="flex items-center space-x-2">
              <div className="relative flex items-center w-full">
                <span className="absolute left-2.5 text-slate-400 text-xs"><DollarSign size={14} /></span>
                <input
                  type="number"
                  placeholder="Min"
                  name="amountMin"
                  value={filters.amountMin}
                  onChange={handleFilterChange}
                  className="glass-input pl-7 py-1.5 w-full text-xs text-slate-700 dark:text-slate-200"
                />
              </div>
              <span className="text-slate-400 text-xs">to</span>
              <div className="relative flex items-center w-full">
                <span className="absolute left-2.5 text-slate-400 text-xs"><DollarSign size={14} /></span>
                <input
                  type="number"
                  placeholder="Max"
                  name="amountMax"
                  value={filters.amountMax}
                  onChange={handleFilterChange}
                  className="glass-input pl-7 py-1.5 w-full text-xs text-slate-700 dark:text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Date range - Min */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">From Date</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400"><Calendar size={16} /></span>
              <input
                type="date"
                name="dateMin"
                value={filters.dateMin}
                onChange={handleFilterChange}
                className="glass-input pl-9 w-full text-xs text-slate-700 dark:text-slate-200"
              />
            </div>
          </div>

          {/* Date range - Max */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">To Date</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400"><Calendar size={16} /></span>
              <input
                type="date"
                name="dateMax"
                value={filters.dateMax}
                onChange={handleFilterChange}
                className="glass-input pl-9 w-full text-xs text-slate-700 dark:text-slate-200"
              />
            </div>
          </div>

          {/* Action button */}
          <div className="flex items-end justify-end space-x-3">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-all"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Expenses feed */}
      {filteredExpenses.length === 0 ? (
        <div className="glass-panel p-16 rounded-3xl text-center flex flex-col items-center justify-center">
          <History size={40} className="text-slate-300 dark:text-slate-700 mb-4" />
          <h3 className="text-lg font-semibold text-slate-850 dark:text-slate-200 mb-1">No Matching Expenses</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            We couldn't find any expenses matching your filters. Try tweaking your query parameters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Showing {filteredExpenses.length} expense logs
          </p>

          <div className="space-y-4">
            {filteredExpenses.map((expense) => (
              <div
                key={expense._id}
                className="glass-panel p-5 rounded-3xl flex items-center justify-between border-l-4 border-l-primary-500 hover:border-l-primary-650 hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all cursor-pointer"
                onClick={() => navigate(`/trips/${expense.tripId?._id}`)}
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="h-10 w-10 rounded-2xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                    {expense.category?.slice(0, 3)}
                  </div>
                  <div className="min-w-0" onClick={(e) => e.stopPropagation()}>
                    <h4 className="font-bold text-slate-850 dark:text-white truncate">
                      {expense.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      Paid by <span className="font-semibold text-slate-700 dark:text-slate-350 cursor-help underline decoration-dotted" title={getPayerTooltip(expense)}>{getPayerText(expense)}</span> •{' '}
                      {new Date(expense.date).toLocaleDateString()} •{' '}
                      <span className="text-primary-500 font-semibold uppercase tracking-wider text-[9px]">{expense.tripId?.tripName}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4" onClick={(e) => e.stopPropagation()}>
                  <div className="text-right">
                    <p className="font-extrabold text-slate-800 dark:text-white">
                      ₹{expense.amount.toLocaleString()}
                    </p>
                    <p className="text-[9px] text-slate-400 capitalize">{expense.splitType} split</p>
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
        </div>
      )}
    </div>
  );
};

export default ExpenseHistory;
