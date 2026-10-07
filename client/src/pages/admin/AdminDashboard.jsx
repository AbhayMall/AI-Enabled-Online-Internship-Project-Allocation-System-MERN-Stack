import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import ApplicationsByStatusChart from '../../components/charts/ApplicationsByStatusChart';
import DepartmentDistributionChart from '../../components/charts/DepartmentDistributionChart';
import {
  Users,
  FolderKanban,
  FileCheck,
  Award,
  Sparkles,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [deptAnalytics, setDeptAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [overviewData, deptData] = await Promise.all([
        adminService.getAnalyticsOverview(),
        adminService.getDepartmentAnalytics(),
      ]);

      if (overviewData.success) setAnalytics(overviewData.analytics);
      if (deptData.success) setDeptAnalytics(deptData.departmentAnalytics);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const u = analytics?.users || {};
  const o = analytics?.opportunities || {};
  const a = analytics?.applications || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-purple-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>TPO & Institutional Admin Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Institutional Oversight Portal
          </h1>
          <p className="text-purple-200 text-xs sm:text-sm max-w-xl">
            Real-time analytics across academic departments, student allocations, skill demand metrics, and role permissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/analytics"
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-950/40 transition-all flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Deep Analytics
          </Link>
          <Link
            to="/admin/users"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-md transition-all flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Manage Users
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Registered Users
            </span>
            <span className="text-2xl font-bold text-slate-900">{u.total || 0}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {u.student || 0} Students · {u.faculty || 0} Faculty
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Postings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Opportunities
            </span>
            <span className="text-2xl font-bold text-slate-900">{o.total || 0}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {o.open || 0} Open · {o.closed || 0} Closed
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FolderKanban className="w-6 h-6" />
          </div>
        </div>

        {/* Total Applications */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Applications
            </span>
            <span className="text-2xl font-bold text-slate-900">{a.total || 0}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Avg Match: <strong>{analytics?.averageMatchScore || 0}%</strong>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Total Allocations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Allocated Students
            </span>
            <span className="text-2xl font-bold text-emerald-600">
              {analytics?.allocations?.total || 0}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Confirmed matches
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Two Column Visual Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Applications By Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Application Status Distribution</h3>
            <span className="text-xs text-slate-400">All Departments</span>
          </div>
          <ApplicationsByStatusChart statusData={a.byStatus || {}} />
        </div>

        {/* Opportunities by Department */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Opportunities by Department</h3>
            <Link to="/admin/analytics" className="text-xs font-semibold text-indigo-600 hover:underline">
              View Detailed Breakdown
            </Link>
          </div>
          <DepartmentDistributionChart departmentData={deptAnalytics?.opportunitiesByDepartment || []} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
