import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import applicationService from '../../services/applicationService';
import ApplicationStatusBadge from '../../components/ApplicationStatusBadge';
import {
  FileCheck,
  Trash2,
  Calendar,
  Sparkles,
  Building,
  Award,
  AlertCircle,
  CheckCircle2,
  Clock,
  Compass
} from 'lucide-react';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [notification, setNotification] = useState({ type: '', text: '' });

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationService.getMyApplications();
      if (data.success) {
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (id, title) => {
    if (!window.confirm(`Are you sure you want to withdraw your application for "${title}"?`)) {
      return;
    }

    setWithdrawingId(id);
    setNotification({ type: '', text: '' });

    try {
      const data = await applicationService.withdraw(id);
      if (data.success) {
        setNotification({
          type: 'success',
          text: `Application for "${title}" withdrawn successfully.`,
        });
        await fetchApplications();
      }
    } catch (err) {
      setNotification({
        type: 'error',
        text: err.response?.data?.message || 'Failed to withdraw application.',
      });
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Applications & Allocations</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track real-time review status, faculty decisions, and confirmed project allocations.
          </p>
        </div>
        <Link
          to="/student/browse"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all inline-flex items-center gap-1.5 self-start"
        >
          <Compass className="w-4 h-4" /> Browse More Postings
        </Link>
      </div>

      {notification.text && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-3 border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : applications.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <FileCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No applications submitted yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse through available faculty opportunities or check your personalized AI matches to apply.
          </p>
          <Link
            to="/student/recommendations"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" /> Check AI Recommendations
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          {applications.map((app) => {
            const opp = app.opportunity || {};
            const isAllocated = app.status === 'allocated';

            return (
              <div
                key={app._id}
                className={`p-6 transition-colors ${
                  isAllocated ? 'bg-indigo-50/30' : 'hover:bg-slate-50/50'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Left: Opportunity Info */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {opp.type || 'Opportunity'}
                      </span>
                      <ApplicationStatusBadge status={app.status} />
                      {app.matchScore > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                          <Sparkles className="w-3 h-3 text-indigo-500" />
                          {app.matchScore}% Match
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-base">
                      {opp.title || 'Opportunity Posting'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
                      {opp.department && (
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          {opp.department}
                        </span>
                      )}
                      {opp.postedBy && (
                        <span>
                          Faculty: <strong>{opp.postedBy.name}</strong>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Applied on {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {isAllocated && (
                      <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>
                          <strong>Allocation Confirmed!</strong> You have been matched and allocated to this posting.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    {!isAllocated && (
                      <button
                        onClick={() => handleWithdraw(app._id, opp.title || 'this posting')}
                        disabled={withdrawingId === app._id}
                        className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Withdraw</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
