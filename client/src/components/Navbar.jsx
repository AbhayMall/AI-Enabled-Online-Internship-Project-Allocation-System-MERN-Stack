import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import {
  Briefcase,
  LayoutDashboard,
  Compass,
  Sparkles,
  FileCheck,
  User,
  PlusCircle,
  FolderKanban,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  GraduationCap,
  LogIn,
  UserPlus
} from 'lucide-react';

const Navbar = () => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  // Student Navigation Links
  const studentLinks = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Browse Postings', path: '/student/browse', icon: Compass },
    { label: 'AI Matches', path: '/student/recommendations', icon: Sparkles, badge: 'AI' },
    { label: 'My Applications', path: '/student/applications', icon: FileCheck },
    { label: 'My Profile', path: '/student/profile', icon: User },
  ];

  // Faculty Navigation Links
  const facultyLinks = [
    { label: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
    { label: 'Post Opportunity', path: '/faculty/post', icon: PlusCircle },
    { label: 'Manage Postings', path: '/faculty/manage', icon: FolderKanban },
    { label: 'Review Applicants', path: '/faculty/review', icon: Users },
  ];

  // Admin Navigation Links
  const adminLinks = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'System Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'User Directory', path: '/admin/users', icon: ShieldCheck },
  ];

  let links = [];
  if (role === 'student') links = studentLinks;
  if (role === 'faculty') links = facultyLinks;
  if (role === 'admin') links = adminLinks;

  const getRoleBadge = () => {
    if (role === 'student') return <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">Student (@cuchd.in)</span>;
    if (role === 'faculty') return <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">Faculty (@cumail.in)</span>;
    if (role === 'admin') return <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">Admin</span>;
    return null;
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-base text-slate-900 tracking-tight block leading-tight">
                  AllocAI
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                  Institutional Allocation Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              links.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-indigo-50 text-indigo-700 shadow-sm font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.2 rounded-md font-bold uppercase tracking-wider animate-pulse">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })
            ) : (
              <Link
                to="/"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium ${
                  isActive('/') ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Home
              </Link>
            )}
          </nav>

          {/* User Section / Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <NotificationBell />

                <div className="h-6 w-px bg-slate-200" />

                <div className="flex items-center gap-2.5">
                  <div className="text-right">
                    <div className="text-xs font-semibold text-slate-900 leading-tight">
                      {user?.name || 'User'}
                    </div>
                    <div className="flex justify-end mt-0.5">{getRoleBadge()}</div>
                  </div>

                  <button
                    onClick={handleLogout}
                    title="Log out"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" /> Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && <NotificationBell />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {isAuthenticated ? (
            <>
              <div className="py-2 px-3 mb-2 bg-slate-50 rounded-lg flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">{user?.name}</span>
                {getRoleBadge()}
              </div>
              {links.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                      active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </div>
                    {link.badge && (
                      <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-bold">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full mt-3 flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2 px-3 rounded-lg text-sm font-semibold bg-slate-100 text-slate-700"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2 px-3 rounded-lg text-sm font-semibold bg-indigo-600 text-white shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
