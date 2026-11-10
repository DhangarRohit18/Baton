import {
  User, Project, DocumentItem, Claim, KnowledgeGap, Contradiction,
  ExitInterview, Handover, QRBridge, RadarOverview, AuditLogItem
} from '../types';

const API_BASE = '/api/v1';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('baton_token');
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

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 401 && !endpoint.includes('/auth/login')) {
      localStorage.removeItem('baton_token');
      localStorage.removeItem('baton_user');
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || data.message || `Request failed with status ${res.status}`);
    }

    return data as T;
  }

  // Auth
  async register(payload: { org_name: string; email: string; password: string; full_name: string; role?: string }) {
    return this.request<{ access_token: string; token_type: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async login(payload: { email: string; password: string }) {
    return this.request<{ access_token: string; token_type: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/projects');
  }

  async createProject(payload: { name: string; description?: string; lead_name?: string; lead_email?: string }): Promise<Project> {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getProject(id: number): Promise<Project> {
    return this.request<Project>(`/projects/${id}`);
  }

  // Documents
  async getDocuments(projectId: number): Promise<DocumentItem[]> {
    return this.request<DocumentItem[]>(`/documents?project_id=${projectId}`);
  }

  async uploadDocument(projectId: number, file: File): Promise<DocumentItem> {
    const formData = new FormData();
    formData.append('project_id', projectId.toString());
    formData.append('file', file);

    return this.request<DocumentItem>('/documents/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async ingestGitHub(projectId: number, repoUrl: string, branch = 'main', accessToken?: string): Promise<DocumentItem> {
    return this.request<DocumentItem>('/documents/github', {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId, repo_url: repoUrl, branch, access_token: accessToken }),
    });
  }

  // Claims & Grounding Guard
  async getClaims(projectId: number, status?: string, category?: string): Promise<Claim[]> {
    let url = `/claims?project_id=${projectId}`;
    if (status) url += `&status=${status}`;
    if (category) url += `&category=${category}`;
    return this.request<Claim[]>(url);
  }

  async verifyClaim(claimId: number) {
    return this.request<{ claim_id: number; grounding_score: number; grounding_status: string; matched_evidences: any[] }>(
      `/claims/${claimId}/verify`,
      { method: 'POST' }
    );
  }

  async reviewClaim(claimId: number, decision: 'approved' | 'rejected' | 'disputed', feedback?: string): Promise<Claim> {
    return this.request<Claim>(`/claims/${claimId}/review`, {
      method: 'POST',
      body: JSON.stringify({ decision, feedback }),
    });
  }

  // Gaps & Contradictions
  async getGaps(projectId: number, status?: string, severity?: string): Promise<KnowledgeGap[]> {
    let url = `/gaps?project_id=${projectId}`;
    if (status) url += `&status=${status}`;
    if (severity) url += `&severity=${severity}`;
    return this.request<KnowledgeGap[]>(url);
  }

  async createGap(payload: { project_id: number; title: string; description: string; severity?: string; category?: string; suggested_question?: string }): Promise<KnowledgeGap> {
    return this.request<KnowledgeGap>('/gaps', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async resolveGap(gapId: number, resolutionNotes: string): Promise<KnowledgeGap> {
    return this.request<KnowledgeGap>(`/gaps/${gapId}/resolve?resolution_notes=${encodeURIComponent(resolutionNotes)}`, {
      method: 'POST',
    });
  }

  async getContradictions(projectId: number): Promise<Contradiction[]> {
    return this.request<Contradiction[]>(`/gaps/contradictions?project_id=${projectId}`);
  }

  // Radar
  async getRadarOverview(): Promise<RadarOverview> {
    return this.request<RadarOverview>('/radar/overview');
  }

  // Exit Interviews
  async getInterviews(projectId: number): Promise<ExitInterview[]> {
    return this.request<ExitInterview[]>(`/interviews?project_id=${projectId}`);
  }

  async generateInterview(payload: { project_id: number; departing_user_name: string; departing_user_email: string; role_title: string }): Promise<ExitInterview> {
    return this.request<ExitInterview>('/interviews/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getInterview(id: number): Promise<ExitInterview> {
    return this.request<ExitInterview>(`/interviews/${id}`);
  }

  async answerInterviewQuestion(responseId: number, answerText: string): Promise<ExitInterview> {
    return this.request<ExitInterview>('/interviews/answer', {
      method: 'POST',
      body: JSON.stringify({ response_id: responseId, answer_text: answerText }),
    });
  }

  // Handovers
  async getHandovers(projectId: number): Promise<Handover[]> {
    return this.request<Handover[]>(`/handovers?project_id=${projectId}`);
  }

  async generateHandover(projectId: number, title: string, customDirectives?: string): Promise<Handover> {
    return this.request<Handover>('/handovers/generate', {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId, title, custom_directives: customDirectives }),
    });
  }

  async getHandover(id: number): Promise<Handover> {
    return this.request<Handover>(`/handovers/${id}`);
  }

  // QR Knowledge Bridge
  async mintQRBridge(payload: { handover_id: number; ttl_hours?: number; passphrase?: string; max_uses?: number }): Promise<QRBridge> {
    return this.request<QRBridge>('/qr-bridge/mint', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async listQRBridges(handoverId: number): Promise<QRBridge[]> {
    return this.request<QRBridge[]>(`/qr-bridge/list/${handoverId}`);
  }

  async redeemQRBridge(token: string, passphrase?: string) {
    return this.request<{
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
  }

  async revokeQRBridge(qrBridgeId: number, reason: string): Promise<QRBridge> {
    return this.request<QRBridge>('/qr-bridge/revoke', {
      method: 'POST',
      body: JSON.stringify({ qr_bridge_id: qrBridgeId, reason }),
    });
  }

  async verifyPublicQR(token: string) {
    return this.request<any>(`/qr-bridge/verify/${encodeURIComponent(token)}`);
  }

  // Users & Team
  async getTeamMembers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async inviteUser(payload: { email: string; full_name: string; role: string }): Promise<User> {
    return this.request<User>('/users/invite', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateUserRole(userId: number, role: string): Promise<User> {
    return this.request<User>('/users/update-role', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, role }),
    });
  }

  // Audit Logs
  async getAuditLogs(limit = 100): Promise<AuditLogItem[]> {
    return this.request<AuditLogItem[]>(`/audit/logs?limit=${limit}`);
  }
}

export const api = new ApiClient();
