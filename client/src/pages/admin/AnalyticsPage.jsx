import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import ApplicationsByStatusChart from '../../components/charts/ApplicationsByStatusChart';
import DepartmentDistributionChart from '../../components/charts/DepartmentDistributionChart';
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  Award,
  Layers,
  Briefcase,
  FolderGit2,
  Users
} from 'lucide-react';

const AnalyticsPage = () => {
  const [overview, setOverview] = useState(null);
  const [deptAnalytics, setDeptAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [ovData, dpData] = await Promise.all([
        adminService.getAnalyticsOverview(),
        adminService.getDepartmentAnalytics(),
      ]);

      if (ovData.success) setOverview(ovData.analytics);
      if (dpData.success) setDeptAnalytics(dpData.departmentAnalytics);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const topSkills = deptAnalytics?.topRequiredSkills || [];
  const maxSkillDemand = topSkills.length > 0 ? Math.max(...topSkills.map((s) => s.demandCount)) : 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Institutional Analytics & Skill Demand</h1>
        <p className="text-xs text-slate-500 mt-1">
          Detailed metrics on student engagement, departmental vacancy distribution, and in-demand industry skill sets.
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Applications Status Funnel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Application Funnel Breakdown</h3>
              <p className="text-xs text-slate-400">Total: {overview?.applications?.total || 0} Submissions</p>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-lg">
              Avg Match: {overview?.averageMatchScore || 0}%
            </span>
          </div>
          <ApplicationsByStatusChart statusData={overview?.applications?.byStatus || {}} />
        </div>

        {/* Opportunities Capacity by Department */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Postings by Department</h3>
            <p className="text-xs text-slate-400">Number of vacancies listed per department</p>
          </div>
          <DepartmentDistributionChart departmentData={deptAnalytics?.opportunitiesByDepartment || []} />
        </div>
      </div>

      {/* Bottom Row: Top Technical Skills In Demand + Allocation Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top In-Demand Skills (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">Top In-Demand Required Skills</h3>
            </div>
            <span className="text-xs text-slate-400">Aggregated from all active postings</span>
          </div>

          {topSkills.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No skill data available.
            </div>
          ) : (
            <div className="space-y-3">
              {topSkills.map((item, idx) => (
                <div key={item.skill} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800 flex items-center gap-1.5">
                      <span className="w-4 text-slate-400 text-[10px]">#{idx + 1}</span>
                      {item.skill}
                    </span>
                    <span className="text-indigo-600">{item.demandCount} {item.demandCount === 1 ? 'posting' : 'postings'}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${(item.demandCount / maxSkillDemand) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Allocations Summary Card (1 col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base">Allocations Summary</h3>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center space-y-1">
            <span className="text-3xl font-extrabold text-emerald-700">
              {overview?.allocations?.total || 0}
            </span>
            <span className="block text-xs font-semibold text-emerald-900 uppercase tracking-wider">
              Total Confirmed Allocations
            </span>
          </div>

          <div className="space-y-3 text-xs pt-2">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="flex items-center gap-2 text-slate-600 font-medium">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                Internship Allocations
              </span>
              <strong className="text-slate-900">
                {deptAnalytics?.allocationsByType?.find((a) => a.type === 'internship')?.count || 0}
              </strong>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="flex items-center gap-2 text-slate-600 font-medium">
                <FolderGit2 className="w-4 h-4 text-emerald-600" />
                Project Allocations
              </span>
              <strong className="text-slate-900">
                {deptAnalytics?.allocationsByType?.find((a) => a.type === 'project')?.count || 0}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
