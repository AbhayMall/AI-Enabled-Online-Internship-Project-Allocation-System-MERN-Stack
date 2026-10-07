import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import applicationService from '../../services/applicationService';
import ApplicationStatusBadge from '../../components/ApplicationStatusBadge';
import {
  Users,
  Sparkles,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  AlertCircle,
  Filter,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

const ReviewApplications = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const opportunityId = searchParams.get('opportunityId') || '';

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = {};
      if (opportunityId) params.opportunityId = opportunityId;
      if (statusFilter) params.status = statusFilter;

      const data = await applicationService.getReceivedApplications(params);
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
  }, [opportunityId, statusFilter]);

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    setMessage({ type: '', text: '' });

    try {
      const data = await applicationService.updateStatus(appId, { status: newStatus });
      if (data.success) {
        setMessage({
          type: 'success',
          text: `Candidate status updated to "${newStatus.replace('_', ' ')}".`,
        });
        await fetchApplications();
        if (selectedApp && selectedApp._id === appId) {
          setSelectedApp((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update candidate status.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Review Student Applicants</h1>
          <p className="text-xs text-slate-500 mt-1">
            Compare candidate credentials, inspect AI-matched technical skills, and allocate vacancy slots.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="applied">Applied</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="waitlisted">Waitlisted</option>
            <option value="allocated">Allocated</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-3 border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Review Table / Card View */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : applications.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No applicants found</h3>
          <p className="text-xs text-slate-400">
            {opportunityId ? 'No applications for this specific posting yet.' : 'No candidates have applied to your postings yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Candidate List (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            {applications.map((app) => {
              const isSelected = selectedApp?._id === app._id;
              const sp = app.studentProfile || {};

              return (
                <div
                  key={app._id}
                  onClick={() => setSelectedApp(app)}
                  className={`p-5 bg-white rounded-2xl border transition-all cursor-pointer shadow-xs hover:shadow-md ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">{app.student?.name}</h3>
                        <span className="text-xs text-slate-400">({app.student?.email})</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Applied for: <strong className="text-slate-800">{app.opportunity?.title}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">AI Match</span>
                        <span className="text-sm font-bold text-indigo-600">{app.matchScore}%</span>
                      </div>
                      <ApplicationStatusBadge status={app.status} />
                    </div>
                  </div>

                  {/* Skills Snapshot */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-medium text-slate-400 mr-1">Skills:</span>
                    {sp.skills && sp.skills.length > 0 ? (
                      sp.skills.slice(0, 5).map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No skills declared</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Candidate Profile Details & Decision Drawer (1 col) */}
          <div className="space-y-4">
            {selectedApp ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-5 sticky top-20">
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{selectedApp.student?.name}</h3>
                    <p className="text-xs text-slate-500">{selectedApp.student?.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-lg border border-indigo-200">
                      {selectedApp.matchScore}% Match
                    </span>
                  </div>
                </div>

                {/* Academic Metadata */}
                <div className="text-xs space-y-2 text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Department:</span>
                    <strong className="text-slate-800">{selectedApp.studentProfile?.department || 'Unspecified'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Year of Study:</span>
                    <strong className="text-slate-800">Year {selectedApp.studentProfile?.year || 1}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Applied On:</span>
                    <strong className="text-slate-800">{new Date(selectedApp.appliedAt).toLocaleDateString()}</strong>
                  </div>
                </div>

                {/* Resume Parsed Skills */}
                {selectedApp.studentProfile?.resumeParsedSkills?.length > 0 && (
                  <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-1.5">
                    <span className="text-[11px] font-bold text-indigo-900 block flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      AI-Extracted Skills ({selectedApp.studentProfile.resumeParsedSkills.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedApp.studentProfile.resumeParsedSkills.map((s, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-white text-indigo-700 rounded text-[10px] font-medium border border-indigo-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resume Link */}
                {selectedApp.studentProfile?.resumeUrl && (
                  <a
                    href={selectedApp.studentProfile.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-4 h-4" /> Open Resume PDF
                  </a>
                )}

                {/* Action Decision Controls */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-900 block">Take Decision</span>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleStatusChange(selectedApp._id, 'approved')}
                      disabled={updatingId === selectedApp._id}
                      className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>

                    <button
                      onClick={() => handleStatusChange(selectedApp._id, 'allocated')}
                      disabled={updatingId === selectedApp._id}
                      className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      <Award className="w-3.5 h-3.5" /> Allocate Slot
                    </button>

                    <button
                      onClick={() => handleStatusChange(selectedApp._id, 'waitlisted')}
                      disabled={updatingId === selectedApp._id}
                      className="py-2 px-3 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      <Clock className="w-3.5 h-3.5" /> Waitlist
                    </button>

                    <button
                      onClick={() => handleStatusChange(selectedApp._id, 'rejected')}
                      disabled={updatingId === selectedApp._id}
                      className="py-2 px-3 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center text-slate-400 text-xs">
                Select a candidate on the left to inspect their academic credentials, parsed resume skills, and take allocation decisions.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewApplications;
