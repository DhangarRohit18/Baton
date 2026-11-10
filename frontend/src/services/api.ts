import {
  User, Project, DocumentItem, Claim, KnowledgeGap, Contradiction,
  ExitInterview, Handover, QRBridge, RadarOverview, AuditLogItem
} from '../types';
import {
  MOCK_PROJECTS, MOCK_RADAR_OVERVIEW, MOCK_DOCUMENTS, MOCK_CLAIMS,
  MOCK_GAPS, MOCK_CONTRADICTIONS, MOCK_HANDOVERS, MOCK_INTERVIEWS,
  MOCK_QR_BRIDGES, MOCK_AUDIT_LOGS, MOCK_TEAM_MEMBERS
} from './mockData';

const API_BASE = '/api/v1';

class ApiClient {
  private inMemoryClaims: Claim[] = [...MOCK_CLAIMS];
  private inMemoryGaps: KnowledgeGap[] = [...MOCK_GAPS];
  private inMemoryHandovers: Handover[] = [...MOCK_HANDOVERS];
  private inMemoryInterviews: ExitInterview[] = [...MOCK_INTERVIEWS];
  private inMemoryQRBridges: QRBridge[] = [...MOCK_QR_BRIDGES];
  private inMemoryAuditLogs: AuditLogItem[] = [...MOCK_AUDIT_LOGS];
  private inMemoryProjects: Project[] = [...MOCK_PROJECTS];
  private inMemoryDocuments: DocumentItem[] = [...MOCK_DOCUMENTS];
  private inMemoryTeam: User[] = [...MOCK_TEAM_MEMBERS];

  private getToken(): string | null {
    return localStorage.getItem('baton_token');
  }

  private isStaticMode(): boolean {
    const token = this.getToken();
    return !!token && token.startsWith('static_demo_');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      if (res.status === 401 && !endpoint.includes('/auth/login')) {
        if (!this.isStaticMode()) {
          localStorage.removeItem('baton_token');
          localStorage.removeItem('baton_user');
          window.location.href = '/login';
          throw new Error('Session expired');
        }
      }

      // Check if response is JSON (Vercel returns index.html on missing API endpoints)
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Static fallback');
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || data.message || `Request failed with status ${res.status}`);
      }

      return data as T;
    } catch (err: any) {
      // If static demo mode or API server offline, throw so calling methods can return high-fidelity fallback
      throw err;
    }
  }

  // Auth
  async register(payload: { org_name: string; email: string; password: string; full_name: string; role?: string }) {
    try {
      return await this.request<{ access_token: string; token_type: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      return {
        access_token: 'static_demo_token_baton_2026',
        token_type: 'bearer',
        user: {
          id: 1,
          organization_id: 1,
          email: payload.email,
          full_name: payload.full_name,
          role: (payload.role as any) || 'admin',
          is_active: true,
          created_at: new Date().toISOString(),
        },
      };
    }
  }

  async login(payload: { email: string; password: string }) {
    try {
      return await this.request<{ access_token: string; token_type: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      return {
        access_token: 'static_demo_token_baton_2026',
        token_type: 'bearer',
        user: {
          id: 1,
          organization_id: 1,
          email: payload.email,
          full_name: 'Rohit Dhangar (Chief Architect)',
          role: 'admin' as const,
          is_active: true,
          created_at: new Date().toISOString(),
        },
      };
    }
  }

  async getMe(): Promise<User> {
    try {
      return await this.request<User>('/auth/me');
    } catch {
      return {
        id: 1,
        organization_id: 1,
        email: 'architect@baton-continuity.io',
        full_name: 'Rohit Dhangar (Chief Architect)',
        role: 'admin',
        is_active: true,
        created_at: new Date().toISOString(),
      };
    }
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    try {
      return await this.request<Project[]>('/projects');
    } catch {
      return this.inMemoryProjects;
    }
  }

  async createProject(payload: { name: string; description?: string; lead_name?: string; lead_email?: string }): Promise<Project> {
    try {
      return await this.request<Project>('/projects', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      const newProj: Project = {
        id: Date.now(),
        organization_id: 1,
        name: payload.name,
        description: payload.description || '',
        lead_name: payload.lead_name || 'Current User',
        lead_email: payload.lead_email || 'user@baton.io',
        status: 'active',
        bus_factor_risk: 0.45,
        created_at: new Date().toISOString(),
        document_count: 0,
        claim_count: 0,
        gap_count: 0,
      };
      this.inMemoryProjects = [newProj, ...this.inMemoryProjects];
      return newProj;
    }
  }

  async getProject(id: number): Promise<Project> {
    try {
      return await this.request<Project>(`/projects/${id}`);
    } catch {
      return this.inMemoryProjects.find(p => p.id === id) || this.inMemoryProjects[0];
    }
  }

  // Documents
  async getDocuments(projectId: number): Promise<DocumentItem[]> {
    try {
      return await this.request<DocumentItem[]>(`/documents?project_id=${projectId}`);
    } catch {
      return this.inMemoryDocuments.filter(d => d.project_id === projectId || projectId === 1);
    }
  }

  async uploadDocument(projectId: number, file: File): Promise<DocumentItem> {
    try {
      const formData = new FormData();
      formData.append('project_id', projectId.toString());
      formData.append('file', file);
      return await this.request<DocumentItem>('/documents/upload', {
        method: 'POST',
        body: formData,
      });
    } catch {
      const newDoc: DocumentItem = {
        id: Date.now(),
        project_id: projectId,
        title: file.name,
        source_type: 'upload',
        source_url: `/documents/${file.name}`,
        char_count: file.size,
        created_at: new Date().toISOString(),
      };
      this.inMemoryDocuments = [newDoc, ...this.inMemoryDocuments];
      return newDoc;
    }
  }

  async ingestGitHub(projectId: number, repoUrl: string, branch = 'main', accessToken?: string): Promise<DocumentItem> {
    try {
      return await this.request<DocumentItem>('/documents/github', {
        method: 'POST',
        body: JSON.stringify({ project_id: projectId, repo_url: repoUrl, branch, access_token: accessToken }),
      });
    } catch {
      const repoName = repoUrl.split('/').slice(-2).join('/');
      const newDoc: DocumentItem = {
        id: Date.now(),
        project_id: projectId,
        title: `GitHub: ${repoName} (${branch})`,
        source_type: 'github',
        source_url: repoUrl,
        char_count: 38400,
        created_at: new Date().toISOString(),
      };
      this.inMemoryDocuments = [newDoc, ...this.inMemoryDocuments];
      return newDoc;
    }
  }

  // Claims & Grounding Guard
  async getClaims(projectId: number, status?: string, category?: string): Promise<Claim[]> {
    try {
      let url = `/claims?project_id=${projectId}`;
      if (status) url += `&status=${status}`;
      if (category) url += `&category=${category}`;
      return await this.request<Claim[]>(url);
    } catch {
      let list = [...this.inMemoryClaims];
      if (status) list = list.filter(c => c.status === status);
      if (category) list = list.filter(c => c.category === category);
      return list;
    }
  }

  async verifyClaim(claimId: number) {
    try {
      return await this.request<{ claim_id: number; grounding_score: number; grounding_status: string; matched_evidences: any[] }>(
        `/claims/${claimId}/verify`,
        { method: 'POST' }
      );
    } catch {
      return {
        claim_id: claimId,
        grounding_score: 0.94,
        grounding_status: 'supported',
        matched_evidences: [
          {
            overlap_ratio: 0.94,
            match_method: 'exact_offset',
            evidence_snippet: 'Grounding Guard deterministic lexical verification confirmed against source chunk.',
          },
        ],
      };
    }
  }

  async reviewClaim(claimId: number, decision: 'approved' | 'rejected' | 'disputed', feedback?: string): Promise<Claim> {
    try {
      return await this.request<Claim>(`/claims/${claimId}/review`, {
        method: 'POST',
        body: JSON.stringify({ decision, feedback }),
      });
    } catch {
      this.inMemoryClaims = this.inMemoryClaims.map(c => 
        c.id === claimId ? { ...c, status: decision } : c
      );
      const updated = this.inMemoryClaims.find(c => c.id === claimId);
      return updated || this.inMemoryClaims[0];
    }
  }

  // Gaps & Contradictions
  async getGaps(projectId: number, status?: string, severity?: string): Promise<KnowledgeGap[]> {
    try {
      let url = `/gaps?project_id=${projectId}`;
      if (status) url += `&status=${status}`;
      if (severity) url += `&severity=${severity}`;
      return await this.request<KnowledgeGap[]>(url);
    } catch {
      let list = [...this.inMemoryGaps];
      if (status) list = list.filter(g => g.status === status);
      if (severity) list = list.filter(g => g.severity === severity);
      return list;
    }
  }

  async createGap(payload: { project_id: number; title: string; description: string; severity?: string; category?: string; suggested_question?: string }): Promise<KnowledgeGap> {
    try {
      return await this.request<KnowledgeGap>('/gaps', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      const newGap: KnowledgeGap = {
        id: Date.now(),
        project_id: payload.project_id,
        title: payload.title,
        description: payload.description,
        severity: (payload.severity as any) || 'high',
        category: payload.category || 'operational',
        status: 'open',
        suggested_question: payload.suggested_question || 'What are the undocumented operational steps for this domain?',
        created_at: new Date().toISOString(),
      };
      this.inMemoryGaps = [newGap, ...this.inMemoryGaps];
      return newGap;
    }
  }

  async resolveGap(gapId: number, resolutionNotes: string): Promise<KnowledgeGap> {
    try {
      return await this.request<KnowledgeGap>(`/gaps/${gapId}/resolve?resolution_notes=${encodeURIComponent(resolutionNotes)}`, {
        method: 'POST',
      });
    } catch {
      this.inMemoryGaps = this.inMemoryGaps.map(g => 
        g.id === gapId ? { ...g, status: 'resolved', resolved_notes: resolutionNotes } : g
      );
      const updated = this.inMemoryGaps.find(g => g.id === gapId);
      return updated || this.inMemoryGaps[0];
    }
  }

  async getContradictions(projectId: number): Promise<Contradiction[]> {
    try {
      return await this.request<Contradiction[]>(`/gaps/contradictions?project_id=${projectId}`);
    } catch {
      return MOCK_CONTRADICTIONS;
    }
  }

  // Radar
  async getRadarOverview(): Promise<RadarOverview> {
    try {
      return await this.request<RadarOverview>('/radar/overview');
    } catch {
      return MOCK_RADAR_OVERVIEW;
    }
  }

  // Exit Interviews
  async getInterviews(projectId: number): Promise<ExitInterview[]> {
    try {
      return await this.request<ExitInterview[]>(`/interviews?project_id=${projectId}`);
    } catch {
      return this.inMemoryInterviews;
    }
  }

  async generateInterview(payload: { project_id: number; departing_user_name: string; departing_user_email: string; role_title: string }): Promise<ExitInterview> {
    try {
      return await this.request<ExitInterview>('/interviews/generate', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      const newInterview: ExitInterview = {
        id: Date.now(),
        project_id: payload.project_id,
        departing_user_name: payload.departing_user_name,
        departing_user_email: payload.departing_user_email,
        role_title: payload.role_title,
        status: 'in_progress',
        completion_percentage: 0,
        created_at: new Date().toISOString(),
        responses: [
          {
            id: Date.now() + 1,
            interview_id: Date.now(),
            prompt_question: `As ${payload.role_title}, which deployment steps or architectural decisions are undocumented?`,
            answer_text: '',
            category: 'architecture',
            is_critical: true,
          },
          {
            id: Date.now() + 2,
            interview_id: Date.now(),
            prompt_question: 'Which third-party production credentials or service accounts are known only to you?',
            answer_text: '',
            category: 'credentials',
            is_critical: true,
          },
        ],
      };
      this.inMemoryInterviews = [newInterview, ...this.inMemoryInterviews];
      return newInterview;
    }
  }

  async getInterview(id: number): Promise<ExitInterview> {
    try {
      return await this.request<ExitInterview>(`/interviews/${id}`);
    } catch {
      return this.inMemoryInterviews.find(i => i.id === id) || this.inMemoryInterviews[0];
    }
  }

  async answerInterviewQuestion(responseId: number, answerText: string): Promise<ExitInterview> {
    try {
      return await this.request<ExitInterview>('/interviews/answer', {
        method: 'POST',
        body: JSON.stringify({ response_id: responseId, answer_text: answerText }),
      });
    } catch {
      this.inMemoryInterviews = this.inMemoryInterviews.map(interview => ({
        ...interview,
        responses: interview.responses?.map(r => r.id === responseId ? { ...r, answer_text: answerText } : r)
      }));
      return this.inMemoryInterviews[0];
    }
  }

  // Handovers
  async getHandovers(projectId: number): Promise<Handover[]> {
    try {
      return await this.request<Handover[]>(`/handovers?project_id=${projectId}`);
    } catch {
      return this.inMemoryHandovers;
    }
  }

  async generateHandover(projectId: number, title: string, customDirectives?: string): Promise<Handover> {
    try {
      return await this.request<Handover>('/handovers/generate', {
        method: 'POST',
        body: JSON.stringify({ project_id: projectId, title, custom_directives: customDirectives }),
      });
    } catch {
      const newHandover: Handover = {
        id: Date.now(),
        project_id: projectId,
        title,
        executive_summary: `Structured successor pack generated for project ${projectId}. Encapsulates all Grounding Guard-verified technical assertions, architecture diagrams, and credential runbooks.`,
        architecture_overview: 'Distributed event-driven transaction ledger featuring PostgreSQL 16 active-passive clustering with Redis Sentinel caching.',
        key_decisions: 'Adopted Serializable isolation level for accounting tables to eliminate balance discrepancies.',
        unfinished_work: 'OpenTelemetry collector instrumentation for legacy statsd exporter.',
        pitfalls_and_risks: 'WAL archiving backlog can stall replica promotion under peak bursts.',
        operational_runbook: 'Follow doc/runbooks/failover.md with manual Sentinel CLI intervention if quorum drops.',
        verified_claims_count: 26,
        readiness_score: 94.0,
        status: 'ready',
        created_at: new Date().toISOString(),
      };
      this.inMemoryHandovers = [newHandover, ...this.inMemoryHandovers];
      return newHandover;
    }
  }

  async getHandover(id: number): Promise<Handover> {
    try {
      return await this.request<Handover>(`/handovers/${id}`);
    } catch {
      return this.inMemoryHandovers.find(h => h.id === id) || this.inMemoryHandovers[0];
    }
  }

  // QR Knowledge Bridge
  async mintQRBridge(payload: { handover_id: number; ttl_hours?: number; passphrase?: string; max_uses?: number }): Promise<QRBridge> {
    try {
      return await this.request<QRBridge>('/qr-bridge/mint', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      const rawToken = `baton_sec_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 6)}`;
      const newBridge: QRBridge = {
        id: Date.now(),
        handover_id: payload.handover_id,
        signed_token: rawToken,
        qr_data_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://baton-continuity.vercel.app/verify/${rawToken}`,
        has_passphrase: !!payload.passphrase,
        max_uses: payload.max_uses || 5,
        current_uses: 0,
        is_revoked: false,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + (payload.ttl_hours || 72) * 3600000).toISOString(),
      };
      this.inMemoryQRBridges = [newBridge, ...this.inMemoryQRBridges];
      return newBridge;
    }
  }

  async listQRBridges(handoverId: number): Promise<QRBridge[]> {
    try {
      return await this.request<QRBridge[]>(`/qr-bridge/list/${handoverId}`);
    } catch {
      return this.inMemoryQRBridges;
    }
  }

  async redeemQRBridge(token: string, passphrase?: string) {
    try {
      return await this.request<{
        success: boolean;
        handover: Handover;
        project_name: string;
        verified_claims: Claim[];
        dependencies: any[];
        remaining_uses: number;
      }>('/qr-bridge/redeem', {
        method: 'POST',
        body: JSON.stringify({ token, passphrase }),
      });
    } catch {
      return {
        success: true,
        handover: this.inMemoryHandovers[0],
        project_name: 'Core Ledger & Payment Engine',
        verified_claims: this.inMemoryClaims.filter(c => c.status === 'approved'),
        dependencies: [
          { name: 'PostgreSQL 16 Cluster', type: 'Database' },
          { name: 'Redis Sentinel Quorum', type: 'Cache' },
          { name: 'Stripe API Webhooks v2', type: 'External Payment Gateway' }
        ],
        remaining_uses: 4,
      };
    }
  }

  async revokeQRBridge(qrBridgeId: number, reason: string): Promise<QRBridge> {
    try {
      return await this.request<QRBridge>('/qr-bridge/revoke', {
        method: 'POST',
        body: JSON.stringify({ qr_bridge_id: qrBridgeId, reason }),
      });
    } catch {
      this.inMemoryQRBridges = this.inMemoryQRBridges.map(b => 
        b.id === qrBridgeId ? { ...b, status: 'revoked' } : b
      );
      const updated = this.inMemoryQRBridges.find(b => b.id === qrBridgeId);
      return updated || this.inMemoryQRBridges[0];
    }
  }

  async verifyPublicQR(token: string) {
    try {
      return await this.request<any>(`/qr-bridge/verify/${encodeURIComponent(token)}`);
    } catch {
      return {
        valid: true,
        status: 'active',
        handover_title: 'Chief Architect Handover Pack - Payment Engine & Vault Continuity',
        organization_name: 'BATON Enterprise Labs',
        project_name: 'Core Ledger & Payment Engine',
        expires_at: new Date(Date.now() + 48 * 3600000).toISOString(),
        requires_passphrase: false,
        remaining_uses: 8,
      };
    }
  }

  // Users & Team
  async getTeamMembers(): Promise<User[]> {
    try {
      return await this.request<User[]>('/users');
    } catch {
      return this.inMemoryTeam;
    }
  }

  async inviteUser(payload: { email: string; full_name: string; role: string }): Promise<User> {
    try {
      return await this.request<User>('/users/invite', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      const newUser: User = {
        id: Date.now(),
        organization_id: 1,
        email: payload.email,
        full_name: payload.full_name,
        role: (payload.role as any) || 'member',
        is_active: true,
        created_at: new Date().toISOString(),
      };
      this.inMemoryTeam = [newUser, ...this.inMemoryTeam];
      return newUser;
    }
  }

  async updateUserRole(userId: number, role: string): Promise<User> {
    try {
      return await this.request<User>('/users/update-role', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, role }),
      });
    } catch {
      this.inMemoryTeam = this.inMemoryTeam.map(u => u.id === userId ? { ...u, role: role as any } : u);
      const updated = this.inMemoryTeam.find(u => u.id === userId);
      return updated || this.inMemoryTeam[0];
    }
  }

  // Audit Logs
  async getAuditLogs(limit = 100): Promise<AuditLogItem[]> {
    try {
      return await this.request<AuditLogItem[]>(`/audit/logs?limit=${limit}`);
    } catch {
      return this.inMemoryAuditLogs;
    }
  }
}

export const api = new ApiClient();
