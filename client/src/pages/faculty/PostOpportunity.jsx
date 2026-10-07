import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import opportunityService from '../../services/opportunityService';
import {
  PlusCircle,
  Briefcase,
  FolderGit2,
  Users,
  Building,
  Sparkles,
  Plus,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const COMMON_SKILLS = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'PyTorch',
  'TensorFlow', 'Machine Learning', 'Deep Learning', 'Computer Vision',
  'NLP', 'MongoDB', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'Cybersecurity'
];

const PostOpportunity = () => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('internship');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [capacity, setCapacity] = useState(1);
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const navigate = useNavigate();

  const handleAddSkill = (skillToAdd) => {
    const s = skillToAdd.trim();
    if (s && !requiredSkills.includes(s)) {
      setRequiredSkills([...requiredSkills, s]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const data = await opportunityService.createOpportunity({
        title,
        type,
        description,
        department,
        capacity: Number(capacity),
        requiredSkills,
      });

      if (data.success) {
        setMessage({ type: 'success', text: 'Opportunity posted successfully!' });
        setTimeout(() => {
          navigate('/faculty/manage');
        }, 1200);
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to create opportunity.',
      });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Post New Opportunity</h1>
        <p className="text-xs text-slate-500 mt-1">
          Create an internship or project vacancy. The AI matching algorithm will score candidates against these requirements.
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
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {/* Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">Opportunity Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('internship')}
              className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                type === 'internship'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className={`p-2 rounded-lg ${type === 'internship' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="font-bold text-sm block">Internship</span>
                <span className="text-[11px] text-slate-500">Research lab or external industry engagement</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setType('project')}
              className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                type === 'project'
                  ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className={`p-2 rounded-lg ${type === 'project' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="font-bold text-sm block">Capstone Project</span>
                <span className="text-[11px] text-slate-500">Guided semester project or thesis allocation</span>
              </div>
            </button>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Opportunity Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Multi-Modal Vision Transformers for Biomedical Imaging"
            className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description & Responsibilities</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the project scope, technologies used, learning objectives, and candidate prerequisites..."
            className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Department & Capacity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Department</label>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Student Capacity (Max Slots)</label>
            <input
              type="number"
              min={1}
              max={20}
              required
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Required Skills Tag Input */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700">
            Required Technical Skills for AI Matching ({requiredSkills.length})
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill(skillInput);
                }
              }}
              placeholder="Add skill (e.g. Python, PyTorch, React) and press Enter"
              className="flex-1 px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button
              type="button"
              onClick={() => handleAddSkill(skillInput)}
              className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-slate-50 rounded-xl border border-slate-100">
            {requiredSkills.length === 0 ? (
              <span className="text-xs text-slate-400 italic">No skills specified. Click suggestions below or type above.</span>
            ) : (
              requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-indigo-200 text-indigo-800 rounded-lg text-xs font-medium shadow-xs"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-indigo-400 hover:text-rose-600 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Suggested Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SKILLS.filter((s) => !requiredSkills.includes(s)).map((skill) => (
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

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <PlusCircle className="w-4 h-4" />
            )}
            <span>Publish Opportunity</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostOpportunity;
