import React, { useState, useEffect } from 'react';
import opportunityService from '../../services/opportunityService';
import applicationService from '../../services/applicationService';
import OpportunityCard from '../../components/OpportunityCard';
import { Search, Filter, Briefcase, FolderGit2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

const BrowseOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [applyingId, setApplyingId] = useState(null);
  const [notification, setNotification] = useState({ type: '', text: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (typeFilter) params.type = typeFilter;
      if (deptFilter && deptFilter !== 'All') params.department = deptFilter;
      if (search) params.search = search;

      const [oppsData, appsData] = await Promise.all([
        opportunityService.getOpportunities(params),
        applicationService.getMyApplications(),
      ]);

      if (oppsData.success) setOpportunities(oppsData.opportunities || []);
      if (appsData.success) setMyApplications(appsData.applications || []);
    } catch (err) {
      console.error('Error fetching opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [typeFilter, deptFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleApply = async (opp) => {
    setApplyingId(opp._id);
    setNotification({ type: '', text: '' });

    try {
      const data = await applicationService.apply(opp._id);
      if (data.success) {
        setNotification({
          type: 'success',
          text: `Applied successfully to "${opp.title}" (Match score: ${data.application.matchScore}%)`,
        });
        await fetchData();
      }
    } catch (err) {
      setNotification({
        type: 'error',
        text: err.response?.data?.message || 'Failed to submit application.',
      });
    } finally {
      setApplyingId(null);
    }
  };

  const appliedOppIds = new Set(myApplications.map((a) => a.opportunity?._id || a.opportunity));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Browse All Postings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore all active faculty-led research internships and capstone projects across academic departments.
        </p>
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

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, required skills (e.g. Python, React), description..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-400 mr-1">Type:</span>
            {[
              { label: 'All', val: '' },
              { label: 'Internships', val: 'internship' },
              { label: 'Projects', val: 'project' },
            ].map((t) => (
              <button
                key={t.label}
                onClick={() => setTypeFilter(t.val)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  typeFilter === t.val
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Department:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-medium"
            >
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Data Science & AI">Data Science & AI</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
            </select>
          </div>
        </div>
      </div>

      {/* Opportunities Grid */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-700">No opportunities match your filter criteria.</p>
          <p className="text-xs text-slate-400">Try changing keywords or clearing the department filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {opportunities.map((opp) => (
            <OpportunityCard
              key={opp._id}
              opportunity={opp}
              hasApplied={appliedOppIds.has(opp._id)}
              isApplying={applyingId === opp._id}
              onApply={handleApply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseOpportunities;
