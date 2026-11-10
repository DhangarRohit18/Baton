import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, MessageSquare, Send, CheckCircle2,
  AlertTriangle, ArrowRight, ShieldCheck, HelpCircle,
  Sparkles, CheckSquare, Clock
} from 'lucide-react';
import { ExitInterview, Project } from '../../types';
import { api } from '../../services/api';

interface Props {
  interviews: ExitInterview[];
  activeProject: Project | null;
  onRefresh: () => void;
}

export const DepartingMemberDashboardView: React.FC<Props> = ({ interviews, activeProject, onRefresh }) => {
  const [activeInterview, setActiveInterview] = useState<ExitInterview | null>(interviews[0] || null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<number | null>(null);
  const [submittedIds, setSubmittedIds] = useState<number[]>([]);
  const [workaroundText, setWorkaroundText] = useState('');
  const [workaroundSubmitted, setWorkaroundSubmitted] = useState(false);

  const handleAnswerSubmit = async (responseId: number) => {
    const text = answers[responseId];
    if (!text?.trim()) return;
    setIsSubmitting(responseId);
    try {
      await api.answerInterviewQuestion(responseId, text.trim());
      setSubmittedIds(prev => [...prev, responseId]);
      onRefresh();
    } catch (e: any) {
      alert('Error recording interview answer: ' + e.message);
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleWorkaroundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workaroundText.trim() || !activeProject) return;
    try {
      await api.createGap({
        project_id: activeProject.id,
        title: 'Disclosed Workaround: ' + workaroundText.slice(0, 50),
        description: workaroundText.trim(),
        severity: 'medium',
        category: 'operational',
      });
      setWorkaroundSubmitted(true);
      setWorkaroundText('');
      setTimeout(() => setWorkaroundSubmitted(false), 5000);
      onRefresh();
    } catch (e: any) {
      alert('Error submitting workaround: ' + e.message);
    }
  };

  const questions = activeInterview?.responses || [
    {
      id: 901,
      interview_id: 1,
      prompt_question: 'Which deployment steps, pre-migration commands, or maintenance scripts are undocumented?',
      answer_text: 'Always run pg_partman maintenance before running Alembic migration 2.4 to create partitioning ranges.',
      category: 'architecture',
      is_critical: true,
    },
    {
      id: 902,
      interview_id: 1,
      prompt_question: 'Which third-party production credentials or service accounts are known solely to you?',
      answer_text: '',
      category: 'credentials',
      is_critical: true,
    },
    {
      id: 903,
      interview_id: 1,
      prompt_question: 'What is the most dangerous hidden pitfall in the Kafka dead-letter webhook replay queue?',
      answer_text: '',
      category: 'operational',
      is_critical: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Departing Lead Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-purple-50/90 via-indigo-50/70 to-slate-50 dark:from-[#1B112C] dark:via-[#150F26] dark:to-[#0C0817] border border-purple-200/80 dark:border-purple-900/60 p-6 rounded-2xl shadow-xs transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 text-xs font-bold uppercase tracking-wider">
            <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Transition &amp; Knowledge Offboarding Workspace &bull; Departing Lead View
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100">
            Gap-Driven Exit Transfer &amp; Handshake
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
            Targeted prompts generated automatically from institutional blindspots to ensure your successor <strong className="text-slate-800 dark:text-slate-200">David Miller</strong> succeeds without midnight escalations.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-center">
          <Link
            to="/interviews"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Full Exit Wizard</span>
          </Link>
        </div>
      </div>

      {/* Departing Lead KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Offboarding Readiness */}
        <div className="bg-white dark:bg-[#10182E] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Offboarding Sign-Off</span>
            <CheckCircle2 className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">85%</span>
            <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">Clearance Pending</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>

        {/* Targeted Prompts */}
        <div className="bg-white dark:bg-[#10182E] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Targeted Questions</span>
            <HelpCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600 dark:text-amber-400">{questions.length}</span>
            <span className="text-[11px] font-semibold text-slate-400">Gap-Derived</span>
          </div>
          <div className="text-[11px] text-slate-500">Based on undetected operational gaps</div>
        </div>

        {/* Successor Appointed */}
        <div className="bg-white dark:bg-[#10182E] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Designated Successor</span>
            <CheckSquare className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 pt-1">David Miller</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Ready for Custody Transfer</div>
        </div>

        {/* Handovers Linked */}
        <div className="bg-white dark:bg-[#10182E] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Linked Handover Pack</span>
            <ShieldCheck className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 pt-1">Pack #401</div>
          <div className="text-[11px] text-slate-500">26 Claims Approved by Elena</div>
        </div>
      </div>

      {/* Main Grid: Targeted Prompts & Workaround Submission */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Targeted Knowledge Prompts */}
        <div className="lg:col-span-2 bg-white dark:bg-[#10182E] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>Targeted Exit Questions (Gap-Driven)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your answers are automatically parsed by the Grounding Guard into permanent organizational runbooks
              </p>
            </div>
            <span className="text-xs font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800 font-bold">
              {questions.length} Items
            </span>
          </div>

          <div className="space-y-4">
            {questions.map((q) => {
              const hasAnswered = !!q.answer_text || submittedIds.includes(q.id);

              return (
                <div
                  key={q.id}
                  className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        {q.category}
                      </span>
                      {q.is_critical && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                          Critical Blindspot
                        </span>
                      )}
                    </div>
                    {hasAnswered && (
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Documented</span>
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {q.prompt_question}
                  </h4>

                  {hasAnswered ? (
                    <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs text-slate-800 dark:text-slate-200 font-mono">
                      "{q.answer_text || answers[q.id]}"
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        placeholder="Type exact operational answer or script location..."
                        value={answers[q.id] || ''}
                        onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleAnswerSubmit(q.id)}
                        disabled={isSubmitting === q.id || !answers[q.id]?.trim()}
                        className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmitting === q.id ? 'Recording Claim...' : 'Submit Answer'}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Unwritten Workaround Submissions */}
        <div className="space-y-5">
          <div className="bg-white dark:bg-[#10182E] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs transition-colors">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Disclose Undocumented Workaround</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Have a script, cron job, or manual override you use when services lock up? Disclose it here so your successor knows what to do.
            </p>

            <form onSubmit={handleWorkaroundSubmit} className="space-y-3">
              <textarea
                rows={4}
                required
                placeholder="e.g. 'When Stripe fails with 429 on black friday, run script/flush-dlq.py with API key located at...'"
                value={workaroundText}
                onChange={(e) => setWorkaroundText(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish Runbook Workaround</span>
              </button>
            </form>

            {workaroundSubmitted && (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Workaround successfully recorded in Handover Pack #401!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
