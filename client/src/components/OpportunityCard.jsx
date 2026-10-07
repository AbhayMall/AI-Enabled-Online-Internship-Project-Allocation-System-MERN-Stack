import React from 'react';
import { Briefcase, FolderGit2, Users, Building, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

const OpportunityCard = ({
  opportunity,
  onApply,
  onViewDetails,
  hasApplied = false,
  showMatchScore = false,
  isApplying = false,
}) => {
  const isInternship = opportunity.type === 'internship';
  const matchScore = opportunity.matchScore !== undefined ? opportunity.matchScore : null;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-slate-600 bg-slate-50 border-slate-200';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between group">
      <div>
        {/* Header Badges */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
              isInternship
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {isInternship ? <Briefcase className="w-3 h-3" /> : <FolderGit2 className="w-3 h-3" />}
            {opportunity.type}
          </span>

          {showMatchScore && matchScore !== null && (
            <div
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getScoreColor(
                matchScore
              )}`}
            >
              <Sparkles className="w-3 h-3" />
              <span>{matchScore}% Match</span>
            </div>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors line-clamp-1">
          {opportunity.title}
        </h3>
        <p className="text-slate-600 text-xs mt-1.5 line-clamp-2 leading-relaxed">
          {opportunity.description || 'No description provided.'}
        </p>

        {/* Metadata items */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-xs text-slate-500">
          {opportunity.department && (
            <span className="flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              {opportunity.department}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            Capacity: {opportunity.capacity} {opportunity.capacity === 1 ? 'slot' : 'slots'}
          </span>
          {opportunity.postedBy && (
            <span className="text-slate-400">
              Posted by: <strong className="text-slate-600 font-medium">{opportunity.postedBy.name}</strong>
            </span>
          )}
        </div>

        {/* Required Skills Tags */}
        <div className="mt-4">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">
            Required Skills
          </div>
          <div className="flex flex-wrap gap-1.5">
            {opportunity.requiredSkills && opportunity.requiredSkills.length > 0 ? (
              opportunity.requiredSkills.slice(0, 5).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-xs font-medium"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">Open to all skill levels</span>
            )}
            {opportunity.requiredSkills && opportunity.requiredSkills.length > 5 && (
              <span className="px-1.5 py-0.5 text-slate-400 text-xs font-medium">
                +{opportunity.requiredSkills.length - 5} more
              </span>
            )}
          </div>
        </div>

        {/* Match Breakdown Reasons (if available in AI recommendations) */}
        {showMatchScore && opportunity.matchAnalysis?.reasons?.length > 0 && (
          <div className="mt-3.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-600 space-y-1">
            {opportunity.matchAnalysis.reasons.slice(0, 2).map((reason, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(opportunity)}
            className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1 transition-colors"
          >
            Details <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        <div className="ml-auto">
          {hasApplied ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Applied
            </span>
          ) : (
            onApply && (
              <button
                onClick={() => onApply(opportunity)}
                disabled={isApplying || opportunity.status === 'closed'}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
              >
                {isApplying ? 'Submitting...' : 'Apply Now'}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default OpportunityCard;
