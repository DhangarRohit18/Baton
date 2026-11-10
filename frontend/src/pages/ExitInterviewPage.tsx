import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ExitInterview, InterviewResponse } from '../types';
import {
  FileText, CheckCircle2, UserX, AlertTriangle, Send,
  Sparkles, RefreshCw, MessageSquare, ArrowRight, ShieldCheck
} from 'lucide-react';

export const ExitInterviewPage: React.FC = () => {
  const { activeProject } = useProject();
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<ExitInterview[]>([]);
  const [activeInterview, setActiveInterview] = useState<ExitInterview | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // New Interview Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [departingName, setDepartingName] = useState('');
  const [departingEmail, setDepartingEmail] = useState('');
  const [departingRole, setDepartingRole] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Active answer editing
  const [activeAnswers, setActiveAnswers] = useState<Record<number, string>>({});
  const [savingAnswerId, setSavingAnswerId] = useState<number | null>(null);

  const loadInterviews = async () => {
    if (!activeProject) return;
    setIsLoading(true);
    try {
      const list = await api.getInterviews(activeProject.id);
      setInterviews(list);
      if (list.length > 0 && !activeInterview) {
        // Load details of latest interview
        const detail = await api.getInterview(list[0].id);
        setActiveInterview(detail);
        initAnswers(detail);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const initAnswers = (interview: ExitInterview) => {
    if (interview.responses) {
      const initial: Record<number, string> = {};
      interview.responses.forEach((r) => {
        initial[r.id] = r.answer_text || '';
      });
      setActiveAnswers(initial);
    }
  };

  useEffect(() => {
    loadInterviews();
  }, [activeProject]);

  const handleSelectInterview = async (id: number) => {
    setIsLoading(true);
    try {
      const detail = await api.getInterview(id);
      setActiveInterview(detail);
      initAnswers(detail);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !departingName.trim() || !departingEmail.trim()) return;
    setIsGenerating(true);
    try {
      const interview = await api.generateInterview({
        project_id: activeProject.id,
        departing_user_name: departingName.trim(),
        departing_user_email: departingEmail.trim(),
        role_title: departingRole.trim() || 'Software Engineer',
      });
      setIsModalOpen(false);
      setDepartingName('');
      setDepartingEmail('');
      setDepartingRole('');
      await loadInterviews();
      setActiveInterview(interview);
      initAnswers(interview);
    } catch (err: any) {
      alert('Error generating interview: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAnswer = async (responseId: number) => {
    const text = activeAnswers[responseId] || '';
    if (!text.trim()) return;
    setSavingAnswerId(responseId);
    try {
      const updated = await api.answerInterviewQuestion(responseId, text.trim());
      setActiveInterview(updated);
      initAnswers(updated);
    } catch (err: any) {
      alert('Error submitting answer: ' + err.message);
    } finally {
      setSavingAnswerId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <UserX className="w-6 h-6 text-cyan-400" />
            Gap-Driven Exit Interview Wizard
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Dynamically synthesizes tailored questionnaires from unresolved institutional gaps in{' '}
            <strong className="text-slate-200">{activeProject?.name || 'Project'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs rounded-lg hover:from-cyan-400 hover:to-teal-400 transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Initiate Offboarding Wizard</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar: Interview Sessions List */}
        <div className="bg-[#10182E] border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 pb-2 border-b border-slate-800">
            <span>Departing Personnel Sessions</span>
            <span className="text-[10px] text-cyan-400 font-mono">{interviews.length} Total</span>
          </div>

          <div className="space-y-2">
            {interviews.length > 0 ? (
              interviews.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectInterview(item.id)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    activeInterview?.id === item.id
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-slate-100">{item.departing_user_name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{item.role_title || item.departing_user_email}</div>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className="capitalize font-semibold text-cyan-400">
                      {item.status.replace('_', ' ')}
                    </span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {Math.round(item.completion_percentage)}% done
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                No offboarding sessions. Click "Initiate Offboarding Wizard" to begin.
              </div>
            )}
          </div>
        </div>

        {/* Right Content: Active Q&A Interface */}
        <div className="lg:col-span-2 space-y-4">
          {activeInterview ? (
            <div className="bg-[#10182E] border border-slate-800 rounded-xl p-6 space-y-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="text-xs uppercase font-mono tracking-wider text-cyan-400 font-bold">
                    Targeted Offboarding Questionnaire
                  </div>
                  <h3 className="text-base font-bold text-slate-100 mt-0.5">
                    {activeInterview.departing_user_name} &bull; {activeInterview.role_title}
                  </h3>
                  <div className="text-xs text-slate-400 font-mono">{activeInterview.departing_user_email}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-400">Continuity Progress</div>
                  <div className="text-lg font-black text-emerald-400">
                    {Math.round(activeInterview.completion_percentage)}%
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-teal-400 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${activeInterview.completion_percentage}%` }}
                ></div>
              </div>

              {/* Questions List */}
              <div className="space-y-4 pt-2">
                {activeInterview.responses && activeInterview.responses.length > 0 ? (
                  activeInterview.responses.map((resp, idx) => {
                    const isAnswered = Boolean(resp.answer_text && resp.answer_text.trim());
                    return (
                      <div
                        key={resp.id}
                        className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center text-[10px] font-bold">
                                {idx + 1}
                              </span>
                              <span className="text-[10px] font-mono uppercase bg-slate-950 px-2 py-0.5 rounded text-slate-400 border border-slate-800">
                                {resp.category}
                              </span>
                              {resp.is_critical && (
                                <span className="text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded">
                                  Critical Risk
                                </span>
                              )}
                              {isAnswered && (
                                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Answered
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs font-bold text-slate-200 pt-1">
                              {resp.prompt_question}
                            </h4>
                          </div>
                        </div>

                        {/* Answer text area */}
                        <div className="space-y-2">
                          <textarea
                            rows={3}
                            placeholder="Enter operational details, credentials location, architecture decisions, or next steps..."
                            value={activeAnswers[resp.id] ?? ''}
                            onChange={(e) =>
                              setActiveAnswers({
                                ...activeAnswers,
                                [resp.id]: e.target.value,
                              })
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
                          />

                          <div className="flex items-center justify-between">
                            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-cyan-400" />
                              Submitting automatically resolves the gap &amp; mints a verified claim.
                            </div>
                            <button
                              onClick={() => handleSaveAnswer(resp.id)}
                              disabled={
                                savingAnswerId === resp.id ||
                                !(activeAnswers[resp.id] && activeAnswers[resp.id].trim())
                              }
                              className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-all disabled:opacity-40"
                            >
                              <Send className="w-3 h-3" />
                              <span>{savingAnswerId === resp.id ? 'Recording...' : 'Save & Resolve'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    No questions generated for this interview.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#10182E] border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-xs space-y-3">
              <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
              <p>Select an offboarding session on the left or initiate a new gap-driven interview.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Interview Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#10182E] border border-slate-800 rounded-xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Launch Gap-Driven Exit Interview
            </h3>
            <p className="text-xs text-slate-400">
              BATON will query all open gaps and ungrounded claims in '{activeProject?.name}' to create targeted interview questions.
            </p>
            <form onSubmit={handleCreateInterview} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Departing Member Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Mercer"
                  value={departingName}
                  onChange={(e) => setDepartingName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Corporate Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="alex.mercer@company.com"
                  value={departingEmail}
                  onChange={(e) => setDepartingEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Role / Specialization</label>
                <input
                  type="text"
                  placeholder="e.g. Lead Cloud Architect"
                  value={departingRole}
                  onChange={(e) => setDepartingRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs rounded-lg hover:from-cyan-400 hover:to-teal-400 shadow-md shadow-cyan-500/20"
                >
                  {isGenerating ? 'Synthesizing Questions...' : 'Generate Q&A Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

