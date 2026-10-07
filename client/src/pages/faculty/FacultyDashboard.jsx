import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import opportunityService from '../../services/opportunityService';
import applicationService from '../../services/applicationService';
import ApplicationStatusBadge from '../../components/ApplicationStatusBadge';
import {
  FolderKanban,
  Users,
  PlusCircle,
  Award,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2
} from 'lucide-react';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [oppsData, appsData] = await Promise.all([
        opportunityService.getMyOpportunities(),
        applicationService.getReceivedApplications(),
      ]);

      if (oppsData.success) setOpportunities(oppsData.opportunities || []);
      if (appsData.success) setApplications(appsData.applications || []);
    } catch (err) {
      console.error('Error loading faculty dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalCapacity = opportunities.reduce((sum, o) => sum + (o.capacity || 1), 0);
  const allocatedCount = applications.filter((a) => a.status === 'allocated').length;
  const pendingCount = applications.filter((a) => a.status === 'applied' || a.status === 'under_review').length;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-emerald-200">
            <Award className="w-3.5 h-3.5" />
            <span>Faculty & Lab Director Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome, {user?.name || 'Professor'}!
          </h1>
          <p className="text-emerald-200 text-xs sm:text-sm max-w-xl">
            Post research opportunities, review AI-ranked student candidates, and allocate project vacancies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/faculty/post"
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Post New Opportunity
          </Link>
          <Link
            to="/faculty/review"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-md transition-all flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Review Candidates
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Active Postings
            </span>
            <span className="text-2xl font-bold text-slate-900">{opportunities.length}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Total Capacity: {totalCapacity} students
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FolderKanban className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Total Applicants
            </span>
            <span className="text-2xl font-bold text-slate-900">{applications.length}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Across all postings
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Pending Reviews
            </span>
            <span className="text-2xl font-bold text-slate-900">{pendingCount}</span>
            <Link to="/faculty/review" className="text-[11px] text-indigo-600 hover:underline flex items-center gap-0.5 mt-0.5">
              Review now <ArrowRight className="w-2.5 h-2.5" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Allocations Made
            </span>
            <span className="text-2xl font-bold text-slate-900">{allocatedCount}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {totalCapacity > 0 ? `${Math.round((allocatedCount / totalCapacity) * 100)}% filled` : '0% filled'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Postings & Recent Applicants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Postings Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-indigo-600" />
              My Postings
            </h2>
            <Link
              to="/faculty/manage"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
            {opportunities.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                You haven't posted any opportunities yet.
              </div>
            ) : (
              opportunities.slice(0, 4).map((opp) => (
                <div key={opp._id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {opp.type}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{opp.title}</h4>
                    <span className="text-xs text-slate-500">
                      Capacity: {opp.capacity} | Apps: {opp.totalApplications || 0}
                    </span>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${
                    opp.status === 'open' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {opp.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Applicants Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Recent Applicants
            </h2>
            <Link
              to="/faculty/review"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Review All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
            {applications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No student applications received yet.
              </div>
            ) : (
              applications.slice(0, 4).map((app) => (
                <div key={app._id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{app.student?.name}</h4>
                    <p className="text-xs text-slate-500 truncate max-w-xs">
                      Applied for: <strong>{app.opportunity?.title}</strong>
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <ApplicationStatusBadge status={app.status} />
                    <span className="text-[11px] text-slate-400 block">
                      Match: <strong className="text-indigo-600">{app.matchScore}%</strong>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
