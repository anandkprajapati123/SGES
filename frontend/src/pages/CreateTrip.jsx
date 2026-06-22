import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { Compass, Calendar, AlignLeft, Send, Sparkles } from 'lucide-react';

const CreateTrip = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tripName: '',
    description: '',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tripName) {
      toast.error('Trip name is required');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/trips', formData);
      toast.success('Trip created successfully!');
      navigate(`/trips/${res.data._id}`);
    } catch (error) {
      console.error('Error creating trip:', error);
      toast.error(error.response?.data?.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center space-x-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center text-primary-600 dark:text-primary-400">
          <Sparkles size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Trip</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Launch a shared group or trip budget with friends</p>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Trip Name */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Trip / Group Name
            </label>
            <input
              type="text"
              name="tripName"
              required
              value={formData.tripName}
              onChange={handleChange}
              placeholder="e.g. Goa Trip 2026, Flat Expenses, Manali Tour"
              className="glass-input w-full text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Description (Optional)
            </label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="What is this trip or group budget for?"
              className="glass-input w-full text-slate-800 dark:text-slate-100 resize-none"
            />
          </div>

          {/* Date range inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Start Date */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="glass-input w-full text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* End Date */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="glass-input w-full text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 dark:shadow-none transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Send size={16} />
                  <span>Create Trip & Open</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTrip;
