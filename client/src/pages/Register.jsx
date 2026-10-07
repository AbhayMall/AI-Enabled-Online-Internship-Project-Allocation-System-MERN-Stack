import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, UserPlus, Lock, Mail, User, Building, AlertCircle, ArrowLeft } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [department, setDepartment] = useState('Computer Science');
  const [year, setYear] = useState(1);
  const [designation, setDesignation] = useState('Assistant Professor');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const getDomainHint = () => {
    if (role === 'student') return 'Must end with @cuchd.in';
    if (role === 'faculty') return 'Must end with @cumail.in';
    return 'Must end with @cumail.in or @cuchd.in';
  };

  const getEmailPlaceholder = () => {
    if (role === 'student') return 'e.g. 21bcs1001@cuchd.in or yourname@cuchd.in';
    if (role === 'faculty') return 'e.g. faculty.name@cumail.in';
    return 'e.g. admin@cumail.in';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const normalizedEmail = email.trim().toLowerCase();

    // Client-side domain check
    if (role === 'student' && !normalizedEmail.endsWith('@cuchd.in')) {
      setError('Student accounts must use their official university email ending with @cuchd.in');
      return;
    }

    if (role === 'faculty' && !normalizedEmail.endsWith('@cumail.in')) {
      setError('Faculty accounts must use their official university email ending with @cumail.in');
      return;
    }

    if (role === 'admin' && !normalizedEmail.endsWith('@cumail.in') && !normalizedEmail.endsWith('@cuchd.in')) {
      setError('Admin accounts must use an institutional email ending with @cumail.in or @cuchd.in');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name,
        email: normalizedEmail,
        password,
        role,
        department,
        ...(role === 'student' ? { year: Number(year) } : {}),
        ...(role === 'faculty' ? { designation } : {}),
      };

      const data = await register(payload);
      if (data.success) {
        if (role === 'student') navigate('/student/dashboard');
        else if (role === 'faculty') navigate('/faculty/dashboard');
        else if (role === 'admin') navigate('/admin/dashboard');
        else navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your institutional details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
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
          Create Institutional Account
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Select role to verify required institutional domain
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Role Selection Tabs */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Role</label>
              <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
                {['student', 'faculty', 'admin'].map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => {
                      setRole(r);
                      setError('');
                    }}
                    className={`py-1.5 text-xs font-semibold capitalize rounded-lg transition-all ${
                      role === r
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="mt-1.5 text-[11px] font-medium text-indigo-600 flex items-center gap-1">
                <span>Domain requirement:</span>
                <strong className="underline">{getDomainHint()}</strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Full Name</label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="block w-full pl-9 pr-3 py-2 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

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
                  placeholder={getEmailPlaceholder()}
                  className="block w-full pl-9 pr-3 py-2 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
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
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="block w-full pl-9 pr-3 py-2 sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {role !== 'admin' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 sm:text-sm border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Data Science & AI">Data Science & AI</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>
            )}

            {role === 'student' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700">Year of Study</label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="mt-1 block w-full px-3 py-2 sm:text-sm border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value={1}>1st Year (Freshman)</option>
                  <option value={2}>2nd Year (Sophomore)</option>
                  <option value={3}>3rd Year (Junior)</option>
                  <option value={4}>4th Year (Senior)</option>
                  <option value={5}>5th Year (Dual/Integrated)</option>
                </select>
              </div>
            )}

            {role === 'faculty' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700">Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Associate Professor"
                  className="mt-1 block w-full px-3 py-2 sm:text-sm border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Institutional Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-600">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 inline-flex items-center gap-0.5">
              <ArrowLeft className="w-3 h-3" /> Back to Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
