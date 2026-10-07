import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogIn, Lock, Mail, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side domain sanity check
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.endsWith('@cuchd.in') && !normalizedEmail.endsWith('@cumail.in')) {
      setError('Please use your official university email (@cuchd.in for students, @cumail.in for faculty).');
      return;
    }

    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.success) {
        const userRole = data.user.role;
        const from = location.state?.from?.pathname;
        if (from) {
          navigate(from, { replace: true });
        } else {
          if (userRole === 'student') navigate('/student/dashboard');
          else if (userRole === 'faculty') navigate('/faculty/dashboard');
          else if (userRole === 'admin') navigate('/admin/dashboard');
          else navigate('/');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your institutional credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick demo credentials fill for easy testing
  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 mb-4 transition-colors font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white shadow-xl shadow-indigo-200">
            <GraduationCap className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Sign In to Your Institutional Portal
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Restricted to <span className="font-semibold text-slate-700">@cuchd.in</span> (Students) & <span className="font-semibold text-slate-700">@cumail.in</span> (Faculty)
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Institutional Email</label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@cuchd.in or @cumail.in"
                  className="block w-full pl-9 pr-3 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins for Fast Evaluation */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
              One-Click Institutional Demo Accounts
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('john.doe@cuchd.in')}
                className="px-2 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 text-center transition-colors leading-tight"
              >
                Student<br/><span className="text-[10px] font-normal text-blue-500">@cuchd.in</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('alan.turing@cumail.in')}
                className="px-2 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 text-center transition-colors leading-tight"
              >
                Faculty<br/><span className="text-[10px] font-normal text-emerald-500">@cumail.in</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin@cumail.in')}
                className="px-2 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg border border-purple-200 text-center transition-colors leading-tight"
              >
                Admin<br/><span className="text-[10px] font-normal text-purple-500">@cumail.in</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-600">
            Need to register?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 inline-flex items-center gap-0.5">
              Create account here <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
