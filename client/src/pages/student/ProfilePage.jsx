import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';
import {
  User,
  GraduationCap,
  FileText,
  Upload,
  Sparkles,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Building,
  Calendar,
  ExternalLink
} from 'lucide-react';

const COMMON_SKILLS = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express',
  'MongoDB', 'PostgreSQL', 'Machine Learning', 'Deep Learning', 'PyTorch',
  'TensorFlow', 'Docker', 'Kubernetes', 'AWS', 'Cybersecurity', 'Git', 'Tailwind CSS'
];

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState(1);
  const [skills, setSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [preferences, setPreferences] = useState([]);
  const [newPrefInput, setNewPrefInput] = useState('');
  const [resumeParsedSkills, setResumeParsedSkills] = useState([]);
  const [resumeUrl, setResumeUrl] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await studentService.getProfile();
      if (data.success && data.profile) {
        setProfile(data.profile);
        setName(data.profile.user?.name || user?.name || '');
        setDepartment(data.profile.department || 'Computer Science');
        setYear(data.profile.year || 1);
        setSkills(data.profile.skills || []);
        setPreferences(data.profile.preferences || []);
        setResumeParsedSkills(data.profile.resumeParsedSkills || []);
        setResumeUrl(data.profile.resumeUrl || '');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleAddSkill = (skillToAdd) => {
    const s = skillToAdd.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddPref = (prefToAdd) => {
    const p = prefToAdd.trim();
    if (p && !preferences.includes(p)) {
      setPreferences([...preferences, p]);
      setNewPrefInput('');
    }
  };

  const handleRemovePref = (prefToRemove) => {
    setPreferences(preferences.filter((p) => p !== prefToRemove));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const data = await studentService.updateProfile({
        name,
        department,
        year,
        skills,
        preferences,
      });

      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        await refreshUser();
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf')) {
      setMessage({ type: 'error', text: 'Please select a valid PDF file for resume upload.' });
      return;
    }

    setUploadingResume(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const data = await studentService.uploadResume(formData);
      if (data.success) {
        setResumeParsedSkills(data.extractedSkills || []);
        setResumeUrl(data.profile.resumeUrl);
        setMessage({
          type: 'success',
          text: `Resume processed! AI extracted ${data.extractedSkills.length} skills automatically.`,
        });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to upload and parse resume.',
      });
    } finally {
      setUploadingResume(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Student Academic Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Keep your skills and resume up-to-date to maximize AI matching accuracy with internship and project opportunities.
        </p>
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
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Resume Upload & AI Analysis Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">AI Resume Parser & Analyzer</h2>
              <p className="text-[11px] text-slate-500">
                Upload your PDF resume to automatically parse technical skills and feed the matching engine.
              </p>
            </div>
          </div>
          {resumeUrl && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <FileText className="w-3.5 h-3.5" /> View Uploaded PDF
            </a>
          )}
        </div>

        <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-6 text-center transition-colors bg-slate-50/50">
          <input
            type="file"
            id="resume-upload"
            accept=".pdf"
            onChange={handleResumeUpload}
            className="hidden"
            disabled={uploadingResume}
          />
          <label
            htmlFor="resume-upload"
            className="cursor-pointer flex flex-col items-center justify-center gap-2"
          >
            <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-indigo-600">
              {uploadingResume ? (
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
            </div>
            <span className="text-xs font-semibold text-slate-700">
              {uploadingResume ? 'Analyzing Resume with AI...' : 'Click to upload PDF resume'}
            </span>
            <span className="text-[11px] text-slate-400">PDF up to 5MB</span>
          </label>
        </div>

        {/* AI Extracted Skills Badges */}
        {resumeParsedSkills && resumeParsedSkills.length > 0 && (
          <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI-Extracted Skills from Resume ({resumeParsedSkills.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {resumeParsedSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-white text-indigo-700 border border-indigo-200 rounded-lg text-xs font-medium shadow-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-indigo-600" />
          Academic Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Institutional Email</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-400 cursor-not-allowed outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Current Year</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value={1}>1st Year (Freshman)</option>
              <option value={2}>2nd Year (Sophomore)</option>
              <option value={3}>3rd Year (Junior)</option>
              <option value={4}>4th Year (Senior)</option>
              <option value={5}>5th Year (Dual/Integrated)</option>
            </select>
          </div>
        </div>

        {/* Self-Declared Skills */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-semibold text-slate-700">
            Self-Declared Technical Skills ({skills.length})
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill(newSkillInput);
                }
              }}
              placeholder="Type a skill and press Enter (e.g. PyTorch, React, Docker)"
              className="flex-1 px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button
              type="button"
              onClick={() => handleAddSkill(newSkillInput)}
              className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          {/* Active Skills List */}
          <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-slate-50 rounded-xl border border-slate-100">
            {skills.length === 0 ? (
              <span className="text-xs text-slate-400 italic">No skills added yet. Choose from suggestions below or type above.</span>
            ) : (
              skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs font-medium shadow-xs"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-rose-600 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Quick Add Suggestions */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Suggested Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SKILLS.filter((s) => !skills.includes(s)).map((skill) => (
                <button
                  type="button"
                  key={skill}
                  onClick={() => handleAddSkill(skill)}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-md text-xs transition-colors"
                >
                  + {skill}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Career Preferences */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-semibold text-slate-700">
            Career Domain Preferences ({preferences.length})
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newPrefInput}
              onChange={(e) => setNewPrefInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddPref(newPrefInput);
                }
              }}
              placeholder="e.g. Machine Learning, Cloud Architecture, Cybersecurity"
              className="flex-1 px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button
              type="button"
              onClick={() => handleAddPref(newPrefInput)}
              className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-slate-50 rounded-xl border border-slate-100">
            {preferences.length === 0 ? (
              <span className="text-xs text-slate-400 italic">No preferences added yet.</span>
            ) : (
              preferences.map((pref) => (
                <span
                  key={pref}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-indigo-200 text-indigo-800 rounded-lg text-xs font-medium shadow-xs"
                >
                  {pref}
                  <button
                    type="button"
                    onClick={() => handleRemovePref(pref)}
                    className="text-indigo-400 hover:text-rose-600 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
