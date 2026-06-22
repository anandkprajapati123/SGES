import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import {
  ArrowLeft,
  DollarSign,
  CheckSquare,
  Square,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Users,
  CreditCard,
  X,
  TrendingDown,
  TrendingUp,
  Minus
} from 'lucide-react';

/* ─────────────────────────────────────────────
   POST-SAVE EXPENSE SUMMARY MODAL
   ───────────────────────────────────────────── */
const ExpenseSummaryModal = ({ data, onClose }) => {
  if (!data) return null;

  const {
    title,
    category,
    totalAmount,
    payers,       // [{ name, profilePicture, paid }]
    splits,       // [{ name, profilePicture, share }]
    settlements,  // [{ from, to, amount }]
    settled       // members with net 0
  } = data;

  const categoryEmoji = {
    Food: '🍽️', Hotel: '🏨', Transport: '🚗', Shopping: '🛍️',
    Fuel: '⛽', Entertainment: '🎬', Miscellaneous: '📦'
  }[category] || '💰';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Green success header */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }}
          />
          <div className="relative">
            <div className="flex items-center justify-center mb-3">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <CheckCircle2 size={32} className="text-white" />
              </div>
            </div>
            <p className="text-emerald-100 text-xs font-semibold uppercase tracking-widest mb-1">Expense Saved!</p>
            <h2 className="text-2xl font-extrabold mb-1">{categoryEmoji} {title}</h2>
            <p className="text-4xl font-black tracking-tight">₹{totalAmount.toFixed(2)}</p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* WHO PAID */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-1.5 bg-indigo-100 dark:bg-indigo-950/40 rounded-lg">
                <CreditCard size={14} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Who Paid
              </h3>
            </div>
            <div className="space-y-2">
              {payers.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-indigo-50/60 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={p.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${p.name}`}
                      alt={p.name}
                      className="h-7 w-7 rounded-full object-cover ring-2 ring-indigo-200 dark:ring-indigo-800"
                    />
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{p.name}</span>
                  </div>
                  <span className="text-sm font-extrabold text-indigo-700 dark:text-indigo-300">₹{p.paid.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* EXPENSE SPLIT */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-1.5 bg-violet-100 dark:bg-violet-950/40 rounded-lg">
                <Users size={14} className="text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Each Person's Share
              </h3>
            </div>
            <div className="space-y-2">
              {splits.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-violet-50/60 dark:bg-violet-950/20 rounded-2xl border border-violet-100/50 dark:border-violet-900/30">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={s.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${s.name}`}
                      alt={s.name}
                      className="h-7 w-7 rounded-full object-cover ring-2 ring-violet-200 dark:ring-violet-800"
                    />
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{s.name}</span>
                  </div>
                  <span className="text-sm font-extrabold text-violet-700 dark:text-violet-300">₹{s.share.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* NET SETTLEMENTS */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950/40 rounded-lg">
                <ArrowRight size={14} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Who Owes Whom (for this expense)
              </h3>
            </div>

            {settlements.length === 0 && settled.length > 0 ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-center">
                <CheckCircle2 size={20} className="text-emerald-500 mx-auto mb-1" />
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">All settled up!</p>
                <p className="text-xs text-slate-500 mt-0.5">Everyone paid their exact share.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {settlements.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-rose-50/60 dark:bg-rose-950/20 rounded-2xl border border-rose-100/50 dark:border-rose-900/30">
                    <div className="flex items-center space-x-2 text-sm flex-1 min-w-0">
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${s.from}`}
                        alt={s.from}
                        className="h-6 w-6 rounded-full ring-2 ring-rose-200 dark:ring-rose-900"
                      />
                      <span className="font-bold text-rose-700 dark:text-rose-300 truncate max-w-[80px]">{s.from}</span>
                      <TrendingDown size={14} className="text-slate-400 flex-shrink-0" />
                      <span className="text-slate-500 text-xs flex-shrink-0">owes</span>
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${s.to}`}
                        alt={s.to}
                        className="h-6 w-6 rounded-full ring-2 ring-emerald-200 dark:ring-emerald-900"
                      />
                      <span className="font-bold text-emerald-700 dark:text-emerald-300 truncate max-w-[80px]">{s.to}</span>
                    </div>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-white ml-2 flex-shrink-0">₹{s.amount.toFixed(2)}</span>
                  </div>
                ))}

                {/* Settled members */}
                {settled.map((name, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${name}`}
                        alt={name}
                        className="h-6 w-6 rounded-full"
                      />
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{name}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      <Minus size={12} />
                      <span>Settled</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action button */}
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 transition-all text-sm"
          >
            View Trip Details →
          </button>
        </div>
      </div>
    </div>
  );
};


/* ─────────────────────────────────────────────
   MAIN ADD EXPENSE COMPONENT
   ───────────────────────────────────────────── */
const AddExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editMode = !!id;

  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(searchParams.get('tripId') || '');
  const [tripMembers, setTripMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Summary modal state
  const [summaryData, setSummaryData] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Food',
    splitType: 'Equal',
    date: new Date().toISOString().substring(0, 10)
  });

  const [paidAmounts, setPaidAmounts] = useState({});
  const [equalSplitMembers, setEqualSplitMembers] = useState([]);
  const [customSplitAmounts, setCustomSplitAmounts] = useState({});

  const categories = ['Food', 'Hotel', 'Transport', 'Shopping', 'Fuel', 'Entertainment', 'Miscellaneous'];

  // Fetch trips
  useEffect(() => {
    const loadTrips = async () => {
      try {
        const res = await api.get('/trips');
        setTrips(res.data);
        if (!selectedTripId && res.data.length > 0 && !editMode) {
          setSelectedTripId(res.data[0]._id);
        }
      } catch (error) {
        console.error('Error fetching trips:', error);
        toast.error('Failed to load trips list');
      }
    };
    loadTrips();
  }, [editMode, selectedTripId]);

  // Load trip members
  useEffect(() => {
    const loadTripMembers = async () => {
      if (selectedTripId) {
        try {
          const res = await api.get(`/trips/${selectedTripId}`);
          const members = res.data.trip.members;
          setTripMembers(members);
          if (!editMode) {
            setEqualSplitMembers(members.map(m => m._id));
            const paidInit = {};
            const customInit = {};
            members.forEach(m => {
              paidInit[m._id] = '';
              customInit[m._id] = '';
            });
            setPaidAmounts(paidInit);
            setCustomSplitAmounts(customInit);
          }
        } catch (error) {
          console.error('Error loading trip members:', error);
        }
      }
    };
    if (!editMode || !loading) {
      loadTripMembers();
    }
  }, [selectedTripId, editMode, loading]);

  // Load expense in edit mode
  useEffect(() => {
    const loadExpenseDetails = async () => {
      if (editMode) {
        try {
          const res = await api.get(`/expenses/${id}`);
          const expense = res.data;
          setSelectedTripId(expense.tripId);
          setFormData({
            title: expense.title,
            description: expense.description || '',
            category: expense.category,
            splitType: expense.splitType,
            date: new Date(expense.date).toISOString().substring(0, 10)
          });
          const paidObj = {};
          if (expense.multiplePayers && expense.multiplePayers.length > 0) {
            expense.multiplePayers.forEach(item => {
              const memberId = typeof item.memberId === 'object' ? item.memberId._id : item.memberId;
              paidObj[memberId] = item.amount.toString();
            });
          } else if (expense.paidBy) {
            const memberId = typeof expense.paidBy === 'object' ? expense.paidBy._id : expense.paidBy;
            paidObj[memberId] = expense.amount.toString();
          }
          setPaidAmounts(paidObj);
          if (expense.splitType === 'Equal') {
            setEqualSplitMembers(expense.splitMembers || []);
          } else if (expense.splitType === 'Custom') {
            const customAmountsObj = {};
            expense.customAmounts.forEach(item => {
              const memberId = typeof item.memberId === 'object' ? item.memberId._id : item.memberId;
              customAmountsObj[memberId] = item.amount.toString();
            });
            setCustomSplitAmounts(customAmountsObj);
          }
          setLoading(false);
        } catch (error) {
          console.error('Error loading expense:', error);
          toast.error('Failed to load expense parameters');
          navigate('/dashboard');
        }
      } else {
        setLoading(false);
      }
    };
    loadExpenseDetails();
  }, [id, editMode]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePaidChange = (memberId, val) => {
    setPaidAmounts(prev => ({ ...prev, [memberId]: val }));
  };

  const handleEqualSplitToggle = (memberId) => {
    if (equalSplitMembers.includes(memberId)) {
      setEqualSplitMembers(equalSplitMembers.filter(i => i !== memberId));
    } else {
      setEqualSplitMembers([...equalSplitMembers, memberId]);
    }
  };

  const handleSelectAllEqual = () => setEqualSplitMembers(tripMembers.map(m => m._id));
  const handleDeselectAllEqual = () => setEqualSplitMembers([]);

  const handleCustomSplitChange = (memberId, val) => {
    setCustomSplitAmounts(prev => ({ ...prev, [memberId]: val }));
  };

  const totalPaidSum = Object.values(paidAmounts).reduce((acc, curr) => {
    const parsed = parseFloat(curr);
    return acc + (isNaN(parsed) ? 0 : parsed);
  }, 0);

  const customSplitsSum = Object.values(customSplitAmounts).reduce((acc, curr) => {
    const parsed = parseFloat(curr);
    return acc + (isNaN(parsed) ? 0 : parsed);
  }, 0);

  const remainingToSplit = totalPaidSum - customSplitsSum;
  const equalSplitShare = equalSplitMembers.length > 0 ? totalPaidSum / equalSplitMembers.length : 0;

  /* ── Build summary data for modal ── */
  const buildSummaryData = (submitData) => {
    const { title, category, amount, multiplePayers, splitType, splitMembers, customAmounts } = submitData;

    // Who paid
    const payers = multiplePayers.map(p => {
      const member = tripMembers.find(m => m._id === p.memberId);
      return {
        name: member?.name || 'Unknown',
        profilePicture: member?.profilePicture,
        paid: p.amount
      };
    });

    // Each person's share
    const splits = [];
    if (splitType === 'Equal') {
      const chosenMembers = splitMembers || tripMembers.map(m => m._id);
      const share = amount / chosenMembers.length;
      chosenMembers.forEach(mid => {
        const member = tripMembers.find(m => m._id === mid);
        if (member) {
          splits.push({ name: member.name, profilePicture: member.profilePicture, share });
        }
      });
    } else if (splitType === 'Custom') {
      customAmounts.forEach(ca => {
        const member = tripMembers.find(m => m._id === ca.memberId);
        if (member) {
          splits.push({ name: member.name, profilePicture: member.profilePicture, share: ca.amount });
        }
      });
    }

    // Net balances per member for this expense only
    const netBalance = {};
    tripMembers.forEach(m => { netBalance[m._id] = 0; });

    multiplePayers.forEach(p => {
      if (netBalance[p.memberId] !== undefined) netBalance[p.memberId] += p.amount;
    });

    splits.forEach(s => {
      const member = tripMembers.find(m => m.name === s.name);
      if (member && netBalance[member._id] !== undefined) netBalance[member._id] -= s.share;
    });

    // Greedy settlement for this expense
    const debtors = [];
    const creditors = [];
    const settledNames = [];

    Object.entries(netBalance).forEach(([mid, bal]) => {
      const member = tripMembers.find(m => m._id === mid);
      if (!member) return;
      if (bal < -0.01) debtors.push({ name: member.name, amount: Math.abs(bal) });
      else if (bal > 0.01) creditors.push({ name: member.name, amount: bal });
      else settledNames.push(member.name);
    });

    const settlements = [];
    const debtorsCopy = debtors.map(d => ({ ...d }));
    const creditorsCopy = creditors.map(c => ({ ...c }));

    while (debtorsCopy.length > 0 && creditorsCopy.length > 0) {
      debtorsCopy.sort((a, b) => b.amount - a.amount);
      creditorsCopy.sort((a, b) => b.amount - a.amount);
      const debtor = debtorsCopy[0];
      const creditor = creditorsCopy[0];
      const settle = Math.min(debtor.amount, creditor.amount);
      const rounded = Math.round((settle + Number.EPSILON) * 100) / 100;
      if (rounded > 0) {
        settlements.push({ from: debtor.name, to: creditor.name, amount: rounded });
      }
      debtor.amount -= settle;
      creditor.amount -= settle;
      if (debtor.amount < 0.01) debtorsCopy.shift();
      if (creditor.amount < 0.01) creditorsCopy.shift();
    }

    return { title, category, totalAmount: amount, payers, splits, settlements, settled: settledNames };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, description, category, splitType, date } = formData;

    if (!selectedTripId) { toast.error('Please select a trip/group'); return; }
    if (!title) { toast.error('Please enter expense title'); return; }
    if (totalPaidSum <= 0) { toast.error('Please enter the amount paid by at least one member'); return; }

    const payersArray = [];
    for (const memberId of Object.keys(paidAmounts)) {
      const val = parseFloat(paidAmounts[memberId] || 0);
      if (val < 0) { toast.error('Paid amounts cannot be negative'); return; }
      if (val > 0) payersArray.push({ memberId, amount: val });
    }

    const submitData = {
      tripId: selectedTripId,
      title,
      description,
      amount: totalPaidSum,
      category,
      multiplePayers: payersArray,
      splitType,
      date
    };

    if (splitType === 'Equal') {
      if (equalSplitMembers.length === 0) { toast.error('Please select at least one member to split with'); return; }
      submitData.splitMembers = equalSplitMembers;
    } else if (splitType === 'Custom') {
      const customAmountsArray = [];
      for (const member of tripMembers) {
        const memberVal = parseFloat(customSplitAmounts[member._id] || 0);
        if (memberVal < 0) { toast.error('Custom amounts cannot be negative'); return; }
        if (memberVal > 0) customAmountsArray.push({ memberId: member._id, amount: memberVal });
      }
      if (customAmountsArray.length === 0) { toast.error('Please allocate custom splitting amounts to members'); return; }
      if (Math.abs(customSplitsSum - totalPaidSum) > 0.05) {
        toast.error(`The sum of custom splits (₹${customSplitsSum.toFixed(2)}) must equal the total paid sum (₹${totalPaidSum.toFixed(2)})`);
        return;
      }
      submitData.customAmounts = customAmountsArray;
    }

    setSaving(true);
    try {
      if (editMode) {
        await api.put(`/expenses/${id}`, submitData);
        toast.success('Expense updated successfully');
        navigate(`/trips/${selectedTripId}`);
      } else {
        await api.post('/expenses', submitData);
        toast.success('Expense saved!');
        // Build and show summary modal
        const summary = buildSummaryData(submitData);
        setSummaryData(summary);
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error(error.response?.data?.message || 'Failed to save expense');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSummary = () => {
    setSummaryData(null);
    navigate(`/trips/${selectedTripId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading form options...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Summary Modal */}
      {summaryData && (
        <ExpenseSummaryModal data={summaryData} onClose={handleCloseSummary} />
      )}

      <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">

        {/* Header */}
        <div className="flex items-center space-x-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-450 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {editMode ? 'Edit Group Expense' : 'Add Shared Expense'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {editMode ? 'Modify details of your shared bill' : 'Record a new receipt to divide among members'}
            </p>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Trip Selection */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Trip / Group
                </label>
                <select
                  disabled={editMode || !!searchParams.get('tripId')}
                  value={selectedTripId}
                  onChange={(e) => setSelectedTripId(e.target.value)}
                  className="glass-input w-full text-slate-850 dark:text-slate-100 appearance-none disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                >
                  <option value="" disabled>Select a Trip</option>
                  {trips.map(t => (
                    <option key={t._id} value={t._id}>{t.tripName}</option>
                  ))}
                </select>
              </div>

              {/* Expense Title */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Expense Title
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Dinner, Fuel, Hotel, Taxi..."
                  value={formData.title}
                  onChange={handleInputChange}
                  className="glass-input w-full text-slate-850 dark:text-slate-100 text-sm"
                />
              </div>

              {/* Category */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  className="glass-input w-full text-slate-850 dark:text-slate-100 appearance-none text-sm"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Bill Date
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleInputChange}
                  className="glass-input w-full text-slate-850 dark:text-slate-100 text-sm"
                />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                rows="2"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Write any additional details here..."
                className="glass-input w-full text-slate-850 dark:text-slate-100 resize-none text-sm"
              />
            </div>

            <hr className="border-slate-100 dark:border-slate-800/80 my-4" />

            {/* Splitting Engine */}
            <div className="space-y-4">

              {/* Controls Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center space-x-1.5">
                    <span>Split Details</span>
                    <Sparkles size={14} className="text-violet-500" />
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Enter paid amounts and verify splitting allocations
                  </p>
                </div>

                {/* Split Type Toggle */}
                <div className="flex p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-xl w-fit">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, splitType: 'Equal' })}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      formData.splitType === 'Equal'
                        ? 'bg-white dark:bg-slate-800 text-indigo-650 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Split Equally
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, splitType: 'Custom' })}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      formData.splitType === 'Custom'
                        ? 'bg-white dark:bg-slate-800 text-indigo-650 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Custom Split
                  </button>
                </div>
              </div>

              {/* Amount display */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center space-x-2">
                  <DollarSign size={18} className="text-indigo-500" />
                  <span className="font-semibold text-slate-500">Total Calculated Amount:</span>
                  <span className="font-bold text-slate-800 dark:text-white">₹{totalPaidSum.toFixed(2)}</span>
                </div>
                {formData.splitType === 'Custom' && (
                  <div className={`font-bold ${Math.abs(remainingToSplit) < 0.05 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {Math.abs(remainingToSplit) < 0.05
                      ? 'Balanced!'
                      : remainingToSplit > 0
                      ? `Remaining: ₹${remainingToSplit.toFixed(2)}`
                      : `Over-allocated: ₹${Math.abs(remainingToSplit).toFixed(2)}`}
                  </div>
                )}
              </div>

              {/* Select/Deselect for Equal */}
              {formData.splitType === 'Equal' && (
                <div className="flex justify-end space-x-3 text-xs pr-1">
                  <button type="button" onClick={handleSelectAllEqual} className="text-primary-600 dark:text-primary-400 hover:underline">Select All</button>
                  <button type="button" onClick={handleDeselectAllEqual} className="text-primary-650 dark:text-primary-400 hover:underline">Deselect All</button>
                </div>
              )}

              {/* Member rows */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {tripMembers.map(m => {
                  const isChecked = equalSplitMembers.includes(m._id);
                  return (
                    <div
                      key={m._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800/80 rounded-2xl gap-3 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-950/20"
                    >
                      {/* Member info */}
                      <div className="flex items-center space-x-3 text-xs sm:text-sm min-w-[150px]">
                        <img
                          src={m.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${m.name}`}
                          className="h-7 w-7 rounded-full object-cover shadow-sm"
                          alt={m.name}
                        />
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">{m.name}</span>
                          <span className="text-[10px] text-slate-400 block truncate">{m.email}</span>
                        </div>
                      </div>

                      {/* Inputs */}
                      <div className="flex items-center gap-4 sm:justify-end">
                        {/* Paid input */}
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Paid (₹)</span>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={paidAmounts[m._id] || ''}
                            onChange={(e) => handlePaidChange(m._id, e.target.value)}
                            className="glass-input px-3 py-1.5 text-xs text-right w-[95px] text-slate-800 dark:text-slate-100 font-semibold"
                          />
                        </div>

                        {/* Share input / toggle */}
                        <div className="flex flex-col min-w-[100px]">
                          <span className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Share (₹)</span>
                          {formData.splitType === 'Equal' ? (
                            <div
                              onClick={() => handleEqualSplitToggle(m._id)}
                              className={`flex items-center space-x-2 p-1.5 rounded-lg cursor-pointer border select-none transition-all ${
                                isChecked
                                  ? 'bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/80 text-indigo-650 dark:text-indigo-400 font-bold'
                                  : 'border-transparent text-slate-400'
                              }`}
                            >
                              <span>{isChecked ? <CheckSquare size={16} /> : <Square size={16} />}</span>
                              <span className="text-xs">
                                {isChecked ? `₹${equalSplitShare.toFixed(2)}` : '0.00'}
                              </span>
                            </div>
                          ) : (
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={customSplitAmounts[m._id] || ''}
                              onChange={(e) => handleCustomSplitChange(m._id, e.target.value)}
                              className="glass-input px-3 py-1.5 text-xs text-right w-full text-slate-800 dark:text-slate-100 font-semibold"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 dark:shadow-none transition-all disabled:opacity-50 text-sm flex items-center space-x-2"
              >
                {saving ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Save Expense</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
};

export default AddExpense;
