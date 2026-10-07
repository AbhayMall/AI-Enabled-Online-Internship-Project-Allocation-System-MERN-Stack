import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import matchService from '../../services/matchService';
import applicationService from '../../services/applicationService';
import OpportunityCard from '../../components/OpportunityCard';
import { Sparkles, ArrowRight, CheckCircle2, AlertCircle, Award, Target, HelpCircle } from 'lucide-react';

const RecommendedOpportunities = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [notification, setNotification] = useState({ type: '', text: '' });

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const data = await matchService.getRecommendations();
      if (data.success) {
        setRecommendations(data.recommendations || []);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleApply = async (opp) => {
    setApplyingId(opp._id);
    setNotification({ type: '', text: '' });

    try {
      const data = await applicationService.apply(opp._id);
      if (data.success) {
        setNotification({
          type: 'success',
          text: `Applied successfully to "${opp.title}" (Match Score: ${data.application.matchScore}%)`,
        });
        await fetchRecommendations();
      }
    } catch (err) {
      setNotification({
        type: 'error',
        text: err.response?.data?.message || 'Application submission failed.',
      });
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 rounded-2xl p-6 text-white shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-300">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Intelligent Multi-Factor Matching Algorithm</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Personalized Opportunity Recommendations
        </h1>
        <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl leading-relaxed">
          These opportunities are ranked dynamically based on your self-declared skills, AI-parsed resume skills, departmental alignment, and career domain preferences.
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

      {/* Recommendations List */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No open postings to match</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Once faculty post new internship or project vacancies, the AI engine will score and rank them here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recommendations.map((opp, index) => (
            <div key={opp._id} className="relative">
              {index === 0 && (
                <div className="absolute -top-3 left-4 z-10 bg-amber-400 text-amber-950 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                  <Award className="w-3 h-3" /> Top Match #{index + 1}
                </div>
              )}
              <OpportunityCard
                opportunity={opp}
                showMatchScore={true}
                hasApplied={opp.hasApplied}
                isApplying={applyingId === opp._id}
                onApply={handleApply}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendedOpportunities;
