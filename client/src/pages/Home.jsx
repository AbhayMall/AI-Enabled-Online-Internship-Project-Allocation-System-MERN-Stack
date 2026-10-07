import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Sparkles,
  Briefcase,
  Users,
  ShieldCheck,
  Award,
  CheckCircle2,
  ArrowRight,
  FileText,
  BrainCircuit,
  Building,
  Mail,
  ChevronRight,
  HelpCircle
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated, role, user } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (role === 'student') return '/student/dashboard';
    if (role === 'faculty') return '/faculty/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    return '/login';
  };

  const FAQS = [
    {
      q: 'Who can register on this portal?',
      a: 'This allocation platform is strictly reserved for institutional students with official @cuchd.in emails and faculty members with official @cumail.in emails.',
    },
    {
      q: 'How does the AI Matching Engine score candidates?',
      a: 'The engine evaluates student self-declared skills, technical keywords extracted from PDF resumes using AI text parsing, departmental alignment, and career preferences against faculty requirements.',
    },
    {
      q: 'Are students notified when new opportunities are posted?',
      a: 'Yes! An automated email broadcast notification is dispatched to all enrolled student emails (@cuchd.in) whenever faculty publish a new internship or project vacancy.',
    },
    {
      q: 'Can students apply for multiple opportunities simultaneously?',
      a: 'Yes, students can browse and apply to multiple open postings. Once a faculty member marks an application as Allocated, the final match is officially recorded.',
    },
  ];

  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Banner Notice */}
      <div className="bg-indigo-950 text-indigo-200 text-xs py-2 px-4 text-center border-b border-indigo-900 flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>
          Official Institutional Allocation Portal · Students: <strong>@cuchd.in</strong> · Faculty: <strong>@cumail.in</strong>
        </span>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-indigo-300 shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            <span>AI-Driven Research & Project Allocation System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Intelligent Internship & Project Allocation Platform
          </h1>

          <p className="text-slate-300 text-sm sm:text-lg max-w-3xl mx-auto leading-relaxed">
            Connecting students with faculty-led research internships and capstone projects through multi-factor AI matching, automated PDF resume parsing, and verified institutional workflows.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {isAuthenticated ? (
              <button
                onClick={() => navigate(getDashboardPath())}
                className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2"
              >
                <span>Go to {role?.toUpperCase()} Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2"
                >
                  <span>Sign In with University ID</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/register"
                  className="px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm backdrop-blur-md border border-white/20 transition-all flex items-center gap-2"
                >
                  <span>Create Account</span>
                </Link>
              </>
            )}
          </div>

          {/* Email Domain Info Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
              <span className="text-slate-300">Student Domain:</span>
              <strong className="text-white font-mono bg-blue-500/20 px-2 py-0.5 rounded">@cuchd.in</strong>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-slate-300">Faculty Domain:</span>
              <strong className="text-white font-mono bg-emerald-500/20 px-2 py-0.5 rounded">@cumail.in</strong>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Role Portals Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Student Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl hover:shadow-2xl transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                For Students (@cuchd.in)
              </span>
              <h3 className="text-lg font-bold text-slate-900">Student Research & Project Portal</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload your PDF resume for instant AI skill extraction, receive ranked recommendation matches, apply for research projects, and track allocation milestones.
              </p>
            </div>
            <Link
              to={isAuthenticated && role === 'student' ? '/student/dashboard' : '/login'}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 pt-2"
            >
              Access Student Portal <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Faculty Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl hover:shadow-2xl transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
                For Faculty (@cumail.in)
              </span>
              <h3 className="text-lg font-bold text-slate-900">Faculty Mentorship & Posting Portal</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Create internship vacancies with custom skill requirements, review AI-scored candidate profiles, trigger automated student broadcasts, and allocate project slots.
              </p>
            </div>
            <Link
              to={isAuthenticated && role === 'faculty' ? '/faculty/dashboard' : '/login'}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 pt-2"
            >
              Access Faculty Portal <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Admin Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl hover:shadow-2xl transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block">
                For TPO & Administrators
              </span>
              <h3 className="text-lg font-bold text-slate-900">Institutional Oversight & Analytics</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Monitor live departmental allocation funnels, inspect in-demand industry skill metrics, oversee user permissions, and ensure AICTE compliance.
              </p>
            </div>
            <Link
              to={isAuthenticated && role === 'admin' ? '/admin/dashboard' : '/login'}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1.5 pt-2"
            >
              Access Admin Portal <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How AI Matching Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Intelligent Automation
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">How the AI Matching Engine Works</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto">
            A 3-step pipeline designed to eliminate manual review bottlenecks and ensure students get matched to opportunities matching their true competencies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-indigo-200">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base">PDF Resume AI Skill Extraction</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When students upload their PDF resumes, our natural language parser matches keywords against a technical skill taxonomy.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-indigo-200">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base">Multi-Factor Compatibility Scoring</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The matching engine calculates compatibility scores (0–100%) by comparing student skills, departmental alignment, and career preferences against posting requirements.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-indigo-200">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base">Broadcast Alert & Allocation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              New postings trigger automated email alerts to @cuchd.in inboxes. Faculty review candidate breakdowns and confirm final project allocations with a single click.
            </p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="bg-slate-100/70 border-t border-slate-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Assistance & Policies
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-800 hover:text-indigo-600 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      openFaq === idx ? 'rotate-90 text-indigo-600' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-50 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Institutional Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-10 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-bold">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            <span>Chandigarh University Internship & Project Allocation System</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Authorized Institutional Platform · Restricted to @cuchd.in & @cumail.in
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
