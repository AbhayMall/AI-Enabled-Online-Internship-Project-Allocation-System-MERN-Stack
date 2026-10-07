import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';
import matchService from '../../services/matchService';
import applicationService from '../../services/applicationService';
import OpportunityCard from '../../components/OpportunityCard';
import ApplicationStatusBadge from '../../components/ApplicationStatusBadge';
import {
  Sparkles,
  FileCheck,
  Compass,
  User,
  ArrowRight,
  TrendingUp,
  Award,
  Clock,
  BookOpen
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [profData, recData, appData] = await Promise.all([
        studentService.getProfile(),
        matchService.getRecommendations(),
        applicationService.getMyApplications(),
      ]);

      if (profData.success) setProfile(profData.profile);
      if (recData.success) setRecommendations(recData.recommendations || []);
      if (appData.success) setApplications(appData.applications || []);
    } catch (err) {
      console.error('Error loading student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleApply = async (opportunity) => {
    try {
      await applicationService.apply(opportunity._id);
      await loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Application failed');
    }
  };

  const allocatedApp = applications.find((a) => a.status === 'allocated');
  const topMatch = recommendations[0];

  // Calculate profile completeness
  const computeCompleteness = () => {
    if (!profile) return 30;
    let score = 30;
    if (profile.department) score += 20;
    if (profile.skills && profile.skills.length > 0) score += 25;
    if (profile.resumeUrl) score += 25;
    return score;
  };

  const completeness = computeCompleteness();

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
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Matching Engine Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="text-indigo-200 text-xs sm:text-sm max-w-xl">
            Discover faculty-led research internships and capstone projects automatically scored against your academic profile and resume.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/student/recommendations"
            className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-950/40 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            View AI Matches
          </Link>
          <Link
            to="/student/browse"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-md transition-all flex items-center gap-2"
          >
            <Compass className="w-4 h-4" />
            Browse All
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Allocation Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Allocation Status
            </span>
            <span className="text-lg font-bold text-slate-900">
              {allocatedApp ? 'Allocated' : 'In Progress'}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {allocatedApp ? allocatedApp.opportunity?.title : `${applications.length} Active applications`}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${allocatedApp ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Applications Submitted */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              My Applications
            </span>
            <span className="text-2xl font-bold text-slate-900">{applications.length}</span>
            <Link to="/student/applications" className="text-[11px] text-indigo-600 hover:underline flex items-center gap-0.5 mt-0.5">
              Track status <ArrowRight className="w-2.5 h-2.5" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Best AI Match */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Top AI Match
            </span>
            <span className="text-2xl font-bold text-slate-900">
              {topMatch ? `${topMatch.matchScore}%` : 'N/A'}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5 truncate max-w-[130px]">
              {topMatch ? topMatch.title : 'No postings open'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Profile Completeness */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Profile Score
            </span>
            <span className="text-xs font-bold text-indigo-600">{completeness}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{ width: `${completeness}%` }}
            />
          </div>
          <Link to="/student/profile" className="text-[11px] text-slate-500 hover:text-indigo-600 flex items-center justify-between mt-2 font-medium">
            <span>{completeness === 100 ? 'Profile Complete' : 'Enhance skills & resume'}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Two Column Layout: Top AI Matches + Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Top Recommended Opportunities */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Top Recommended for You</h2>
            </div>
            <Link
              to="/student/recommendations"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recommendations.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              No open opportunities to match at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.slice(0, 4).map((opp) => (
                <OpportunityCard
                  key={opp._id}
                  opportunity={opp}
                  showMatchScore={true}
                  hasApplied={opp.hasApplied}
                  onApply={handleApply}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Recent Applications Sidebar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Application Feed</h2>
            </div>
            <Link
              to="/student/applications"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View All
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm divide-y divide-slate-100">
            {applications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                You have not applied to any opportunities yet.
              </div>
            ) : (
              applications.slice(0, 5).map((app) => (
                <div key={app._id} className="py-3 first:pt-0 last:pb-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                      {app.opportunity?.title || 'Opportunity'}
                    </h4>
                    <ApplicationStatusBadge status={app.status} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{app.opportunity?.department || 'Department'}</span>
                    <span>Match: <strong>{app.matchScore}%</strong></span>
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

export default StudentDashboard;
