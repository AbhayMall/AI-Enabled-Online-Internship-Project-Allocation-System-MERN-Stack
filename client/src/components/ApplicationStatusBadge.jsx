import React from 'react';
import { Clock, Eye, CheckCircle2, XCircle, AlertCircle, Award } from 'lucide-react';

const STATUS_CONFIGS = {
  applied: {
    label: 'Applied',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Clock,
  },
  under_review: {
    label: 'Under Review',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Eye,
  },
  approved: {
    label: 'Approved',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: XCircle,
  },
  waitlisted: {
    label: 'Waitlisted',
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: AlertCircle,
  },
  allocated: {
    label: 'Allocated',
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-300 font-semibold shadow-sm',
    icon: Award,
  },
};

const ApplicationStatusBadge = ({ status }) => {
  const config = STATUS_CONFIGS[status] || {
    label: status || 'Unknown',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Clock,
  };

  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg}`}
    >
      <IconComponent className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

export default ApplicationStatusBadge;
