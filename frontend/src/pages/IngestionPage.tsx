import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { api } from '../services/api';
import { DocumentItem } from '../types';
import {
  FolderGit2, UploadCloud, GitBranch, Globe, FileText, CheckCircle2,
  AlertCircle, ArrowRight, RefreshCw, Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const IngestionPage: React.FC = () => {
  const { activeProject, projects } = useProject();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ msg: string; isError: boolean } | null>(null);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // GitHub sync state
  const [ghRepoUrl, setGhRepoUrl] = useState('');
  const [ghBranch, setGhBranch] = useState('main');
  const [ghToken, setGhToken] = useState('');
  const [isSyncingGh, setIsSyncingGh] = useState(false);

  const loadDocuments = async () => {
    if (!activeProject) return;
    setIsLoading(true);
    try {
      const docs = await api.getDocuments(activeProject.id);
      setDocuments(docs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [activeProject]);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !activeProject) return;
    setIsUploading(true);
    setUploadStatus(null);
    try {
      const doc = await api.uploadDocument(activeProject.id, selectedFile);
      setUploadStatus({
        msg: `"${doc.title}" successfully parsed into evidence chunks & grounded!`,
        isError: false,
      });
      setSelectedFile(null);
      await loadDocuments();
    } catch (err: any) {
      setUploadStatus({ msg: err.message || 'File upload failed.', isError: true });
    } finally {
      setIsUploading(false);
    }
  };

  const handleGitHubSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ghRepoUrl.trim() || !activeProject) return;
    setIsSyncingGh(true);
    setUploadStatus(null);
    try {
      const doc = await api.ingestGitHub(activeProject.id, ghRepoUrl.trim(), ghBranch.trim(), ghToken.trim() || undefined);
      setUploadStatus({
        msg: `Repository "${doc.title}" synchronized and parsed into Claim Ledger!`,
        isError: false,
      });
      setGhRepoUrl('');
      await loadDocuments();
    } catch (err: any) {
      setUploadStatus({ msg: err.message || 'GitHub sync failed.', isError: true });
    } finally {
      setIsSyncingGh(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-cyan-400" />
            Multi-Modal Knowledge Ingestion
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Active Project: <strong className="text-slate-200">{activeProject?.name || 'None selected'}</strong>
          </p>
        </div>
        <button
          onClick={loadDocuments}
          className="p-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Sources</span>
        </button>
      </div>

      {uploadStatus && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
            uploadStatus.isError
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}
        >
          {uploadStatus.isError ? (
            <AlertCircle className="w-5 h-5 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          )}
          <span>{uploadStatus.msg}</span>
        </div>
      )}

      {/* Ingestion Channels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Channel 1: Document Upload */}
        <div className="bg-[#10182E] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Document Upload</h3>
              <p className="text-[11px] text-slate-400">PDF, Markdown, DOCX, TXT</p>
            </div>
          </div>

          <form onSubmit={handleFileUpload} className="space-y-3">
            <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-950/40">
              <input
                type="file"
                id="doc-file-input"
                className="hidden"
                accept=".pdf,.md,.markdown,.txt,.docx"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="doc-file-input" className="cursor-pointer space-y-2 block">
                <FileText className="w-8 h-8 text-slate-500 mx-auto" />
                <div className="text-xs text-slate-300 font-semibold">
                  {selectedFile ? selectedFile.name : 'Click to select document'}
                </div>
                <p className="text-[10px] text-slate-500">Auto-chunked with offset preservation</p>
              </label>
            </div>

            <button
              type="submit"
              disabled={!selectedFile || isUploading || !activeProject}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs rounded-lg hover:from-cyan-400 hover:to-teal-400 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
            >
              {isUploading ? 'Chunking & Grounding...' : 'Ingest Document'}
            </button>
          </form>
        </div>

        {/* Channel 2: GitHub Repository Sync */}
        <div className="bg-[#10182E] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">GitHub Connector</h3>
              <p className="text-[11px] text-slate-400">Sync README, Architecture & Commits</p>
            </div>
          </div>

          <form onSubmit={handleGitHubSync} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Repository URL *</label>
              <input
                type="text"
                required
                placeholder="https://github.com/owner/repo"
                value={ghRepoUrl}
                onChange={(e) => setGhRepoUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Branch</label>
                <input
                  type="text"
                  placeholder="main"
                  value={ghBranch}
                  onChange={(e) => setGhBranch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">PAT (Optional)</label>
                <input
                  type="password"
                  placeholder="ghp_••••••••"
                  value={ghToken}
                  onChange={(e) => setGhToken(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!ghRepoUrl.trim() || isSyncingGh || !activeProject}
              className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-xs rounded-lg hover:from-teal-400 hover:to-emerald-400 transition-all shadow-md shadow-teal-500/20 disabled:opacity-50"
            >
              {isSyncingGh ? 'Syncing Commits & Architecture...' : 'Sync Repository'}
            </button>
          </form>
        </div>

        {/* Channel 3: Chrome Extension Capture */}
        <div className="bg-[#10182E] border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Chrome Capture Extension</h3>
                <p className="text-[11px] text-slate-400">Browser Ingestion Manifest V3</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Capture operational documentation, cloud consoles, or internal wiki runs directly from Chrome with one click.
            </p>

            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-1.5 text-[11px]">
              <div className="text-slate-400 font-semibold">Active Webhook Receiver:</div>
              <code className="text-cyan-400 font-mono text-[10px] break-all">
                POST /api/v1/captures
              </code>
            </div>
          </div>

          <div className="pt-2">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="block text-center py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 text-xs font-semibold rounded-lg transition-colors"
            >
              Extension Package Ready in /extension
            </a>
          </div>
        </div>
      </div>

      {/* Ingested Documents List */}
      <div className="bg-[#10182E] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Ingested Knowledge Assets ({documents.length})
            </h3>
            <p className="text-[11px] text-slate-400">Immutable source documents powering the Deterministic Grounding Guard</p>
          </div>
          <Link
            to={`/claims?project_id=${activeProject?.id || ''}`}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
          >
            <span>View Claim Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/40 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-5">Document Title</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Content Size</th>
                <th className="py-3 px-4">Ingested At</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-5 font-semibold text-slate-200">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="truncate max-w-md">{doc.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-mono uppercase bg-slate-800/90 text-cyan-300 px-2 py-0.5 rounded border border-slate-700">
                        {doc.source_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {(doc.char_count / 1000).toFixed(1)}k chars
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/claims?project_id=${doc.project_id}`}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                      >
                        Ledger Claims &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500 text-xs">
                    No documents ingested yet for this domain. Upload a PDF, sync GitHub, or capture from Chrome.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
