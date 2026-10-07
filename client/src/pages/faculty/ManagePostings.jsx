import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import opportunityService from '../../services/opportunityService';
import {
  FolderKanban,
  PlusCircle,
  Edit2,
  Trash2,
  Power,
  Users,
  CheckCircle2,
  AlertCircle,
  Eye,
  Calendar
} from 'lucide-react';

const ManagePostings = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingOpp, setEditingOpp] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCapacity, setEditCapacity] = useState(1);
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('open');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPostings = async () => {
    try {
      setLoading(true);
      const data = await opportunityService.getMyOpportunities();
      if (data.success) {
        setOpportunities(data.opportunities || []);
      }
    } catch (err) {
      console.error('Error fetching postings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostings();
  }, []);

  const handleToggleStatus = async (opp) => {
    const newStatus = opp.status === 'open' ? 'closed' : 'open';
    try {
      await opportunityService.updateOpportunity(opp._id, { status: newStatus });
      setMessage({ type: 'success', text: `Posting status updated to ${newStatus}.` });
      await fetchPostings();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update status.' });
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      return;
    }
    try {
      await opportunityService.deleteOpportunity(id);
      setMessage({ type: 'success', text: 'Posting deleted successfully.' });
      await fetchPostings();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete posting.' });
    }
  };

  const openEditModal = (opp) => {
    setEditingOpp(opp);
    setEditTitle(opp.title);
    setEditCapacity(opp.capacity);
    setEditDescription(opp.description || '');
    setEditStatus(opp.status);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingOpp) return;
    setActionLoading(true);

    try {
      const data = await opportunityService.updateOpportunity(editingOpp._id, {
        title: editTitle,
        capacity: Number(editCapacity),
        description: editDescription,
        status: editStatus,
      });

      if (data.success) {
        setMessage({ type: 'success', text: 'Posting updated successfully.' });
        setEditingOpp(null);
        await fetchPostings();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update posting.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Created Postings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor applicant load, modify project descriptions, toggle open/closed status, or delete vacancies.
          </p>
        </div>
        <Link
          to="/faculty/post"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all inline-flex items-center gap-1.5 self-start"
        >
          <PlusCircle className="w-4 h-4" /> Create New Posting
        </Link>
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

      {loading ? (
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <FolderKanban className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Postings Created Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Get started by creating your first faculty research or project opportunity.
          </p>
          <Link
            to="/faculty/post"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Post Opportunity
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          {opportunities.map((opp) => (
            <div key={opp._id} className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-slate-50/50 transition-colors">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                    {opp.type}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${
                    opp.status === 'open' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {opp.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base">{opp.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-1 max-w-2xl">{opp.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                  <span>Capacity: <strong className="text-slate-700">{opp.capacity}</strong></span>
                  <span>Received Apps: <strong className="text-slate-700">{opp.totalApplications || 0}</strong></span>
                  <span>Allocated: <strong className="text-indigo-600">{opp.allocatedCount || 0}</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <Link
                  to={`/faculty/review?opportunityId=${opp._id}`}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> Applicants ({opp.totalApplications || 0})
                </Link>

                <button
                  onClick={() => handleToggleStatus(opp)}
                  title={opp.status === 'open' ? 'Close applications' : 'Reopen applications'}
                  className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-slate-200"
                >
                  <Power className="w-4 h-4" />
                </button>

                <button
                  onClick={() => openEditModal(opp)}
                  title="Edit details"
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-slate-200"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(opp._id, opp.title)}
                  title="Delete posting"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Posting Modal */}
      {editingOpp && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Edit Opportunity Posting</h3>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingOpp(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePostings;
