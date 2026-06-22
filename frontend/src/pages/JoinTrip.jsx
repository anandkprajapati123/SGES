import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Compass } from 'lucide-react';

const JoinTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const performJoin = async () => {
      if (!token) {
        toast.info('Please log in first to join this trip!');
        navigate(`/login?redirect=/join/${id}`);
        return;
      }

      try {
        await api.post(`/trips/${id}/join`);
        toast.success('Successfully joined the trip!');
      } catch (error) {
        console.error('Error joining trip:', error);
        // If already a member, we still want to show them the trip!
        if (error.response?.status === 400) {
          toast.info('You are already a member of this trip.');
        } else {
          toast.error(error.response?.data?.message || 'Failed to join trip');
          navigate('/dashboard');
          return;
        }
      } finally {
        setLoading(false);
        navigate(`/trips/${id}`);
      }
    };

    performJoin();
  }, [id, token, navigate]);

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center space-y-4">
        <Compass size={48} className="text-primary-600 animate-spin" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center space-x-1.5">
          <span>Joining Shared Trip...</span>
          <Sparkles size={18} className="text-amber-400" />
        </h2>
        <p className="text-xs text-slate-500">Linking your account to this group splits registry</p>
      </div>
    </div>
  );
};

export default JoinTrip;
