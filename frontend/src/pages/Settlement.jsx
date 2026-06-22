import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { Compass, Users, DollarSign, Calendar, Sparkles, ArrowLeft, Send } from 'lucide-react';

const Settlement = () => {
  const { id } = useParams(); // Trip ID
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [trip, setTrip] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [fromUser, setFromUser] = useState(searchParams.get('from') || '');
  const [toUser, setToUser] = useState(searchParams.get('to') || '');
  const [amount, setAmount] = useState(searchParams.get('amount') || '');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));

  const fetchSettlementDetails = async () => {
    try {
      const [tripRes, settlementsRes] = await Promise.all([
        api.get(`/trips/${id}`),
        api.get(`/trips/${id}/settlements`)
      ]);
      setTrip(tripRes.data.trip);
      setSettlements(settlementsRes.data.settlements);
      
      // Setup defaults if not pre-populated via query
      if (!fromUser && settlementsRes.data.settlements.length > 0) {
        const first = settlementsRes.data.settlements[0];
        setFromUser(first.from.id);
        setToUser(first.to.id);
        setAmount(first.amount.toString());
      } else if (!fromUser && tripRes.data.trip.members.length > 1) {
        setFromUser(tripRes.data.trip.members[0]._id);
        setToUser(tripRes.data.trip.members[1]._id);
      }
    } catch (error) {
      console.error('Error fetching settlement details:', error);
      toast.error('Failed to load settlement details');
      navigate(`/trips/${id}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlementDetails();
  }, [id]);

  const handleSettleQuickAction = (s) => {
    setFromUser(s.from.id);
    setToUser(s.to.id);
    setAmount(s.amount.toString());
    toast.info(`Pre-loaded settlement details for ${s.from.name} to ${s.to.name}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fromUser || !toUser || !amount) {
      toast.error('Please enter payer, receiver, and amount');
      return;
    }

    if (fromUser === toUser) {
      toast.error('Payer and Receiver cannot be the same person');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error('Amount must be a positive number');
      return;
    }

    // Identify payer and receiver names for Title
    const payerName = trip.members.find(m => m._id === fromUser)?.name || 'Member';
    const receiverName = trip.members.find(m => m._id === toUser)?.name || 'Member';

    // A settlement is represented as an Expense where:
    // - PaidBy = Debtor (Payer, fromUser)
    // - Amount = paymentAmount
    // - SplitType = Custom
    // - CustomAmounts = [{ memberId: Creditor (Receiver, toUser), amount: paymentAmount }]
    // - Title = "Settlement: Payer to Receiver"
    // - Category = "Miscellaneous"
    const settlementExpense = {
      tripId: trip._id,
      title: `Settlement: ${payerName} to ${receiverName}`,
      description: `Debt clearance payment recorded virtually`,
      amount: numericAmount,
      category: 'Miscellaneous',
      paidBy: fromUser,
      splitType: 'Custom',
      customAmounts: [
        {
          memberId: toUser,
          amount: numericAmount
        }
      ],
      date
    };

    setSaving(true);
    try {
      await api.post('/expenses', settlementExpense);
      toast.success(`Recorded ₹${numericAmount} payment successfully!`);
      navigate(`/trips/${id}`);
    } catch (error) {
      console.error('Error recording settlement payment:', error);
      toast.error(error.response?.data?.message || 'Failed to record settlement payment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Analyzing balances...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Link
          to={`/trips/${trip._id}`}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-505 hover:bg-slate-200 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Record Settlement</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Clear debts in "{trip.tripName}" by logging payments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Current Debts & Settle Shortcut */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Debt Registry</h2>

          {settlements.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl text-center flex flex-col items-center justify-center">
              <Sparkles size={40} className="text-emerald-500 mb-3 animate-pulse" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-350">Group is fully settled!</p>
              <p className="text-xs text-slate-500 mt-1">There are no outstanding debts to clear.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {settlements.map((s, idx) => (
                <div
                  key={idx}
                  className="glass-panel p-5 rounded-3xl flex items-center justify-between border-l-4 border-l-emerald-500 hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all"
                >
                  <div className="flex items-center space-x-3 text-sm">
                    <img
                      src={s.from.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${s.from.name}`}
                      alt={s.from.name}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{s.from.name}</span>
                    <span className="text-slate-400 font-medium">owes</span>
                    <img
                      src={s.to.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${s.to.name}`}
                      alt={s.to.name}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{s.to.name}</span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      ₹{s.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleSettleQuickAction(s)}
                      className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold rounded-xl text-xs hover:bg-emerald-100 transition-colors"
                    >
                      Settle Debt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Form to record payment */}
        <div>
          <div className="glass-panel p-8 rounded-3xl space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <DollarSign size={20} className="text-indigo-500" />
              <span>Log Payment</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* From User selection */}
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Sender (Who Paid)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400"><Users size={16} /></span>
                  <select
                    value={fromUser}
                    onChange={(e) => setFromUser(e.target.value)}
                    className="glass-input pl-9 w-full text-xs text-slate-800 dark:text-slate-200 appearance-none"
                  >
                    {trip.members.map(m => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* To User selection */}
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Recipient (Who Received)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400"><Users size={16} /></span>
                  <select
                    value={toUser}
                    onChange={(e) => setToUser(e.target.value)}
                    className="glass-input pl-9 w-full text-xs text-slate-800 dark:text-slate-200 appearance-none"
                  >
                    {trip.members
                      .filter(m => m._id !== fromUser)
                      .map(m => (
                        <option key={m._id} value={m._id}>{m.name}</option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Amount input */}
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Payment Amount (₹)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 text-xs"><DollarSign size={16} /></span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="glass-input pl-8 w-full text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Date */}
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Payment Date
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400"><Calendar size={16} /></span>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="glass-input pl-9 w-full text-xs text-slate-850 dark:text-slate-100 text-sm"
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs shadow hover:from-violet-500 hover:to-indigo-500 transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Send size={12} />
                    <span>Record Payment</span>
                  </>
                )}
              </button>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settlement;
