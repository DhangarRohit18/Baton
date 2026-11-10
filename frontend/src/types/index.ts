export interface User {
  id: number;
  organization_id: number;
  email: string;
  full_name: string;
  role: 'owner' | 'admin' | 'auditor' | 'member' | 'successor' | 'reviewer';
  is_active: boolean;
  created_at: string;
}

export interface Organization {
  id: number;
  name: string;
  slug: string;
  plan: string;
  created_at: string;
}

export interface Project {
  id: number;
  organization_id: number;
  name: string;
  description: string;
  lead_name: string;
  lead_email: string;
  status: 'active' | 'transitioning' | 'handed_over' | 'archived';
  bus_factor_risk: number;
  created_at: string;
  document_count: number;
  claim_count: number;
  gap_count: number;
}

export interface DocumentItem {
  id: number;
  project_id: number;
  title: string;
  source_type: 'upload' | 'github' | 'chrome_extension' | 'browser_extension' | 'manual';
  source_url: string;
  char_count: number;
  created_at: string;
}

export interface EvidenceLink {
  id: number;
  evidence_id: number;
  overlap_ratio: number;
  match_method: string;
  snippet: string;
  document_title?: string;
}

export interface Claim {
  id: number;
  project_id: number;
  document_id?: number;
  title: string;
  statement: string;
  category: 'architecture' | 'operational' | 'credentials' | 'risk' | 'unfinished' | 'business_logic';
  confidence_score: number;
  grounding_score: number;
  grounding_status: 'grounded' | 'unverified' | 'contradicted' | 'hallucination_detected';
  status: 'extracted' | 'verified' | 'approved' | 'disputed' | 'rejected';
  reviewer_notes?: string;
  created_at: string;
  evidence_links: EvidenceLink[];
}

export interface KnowledgeGap {
  id: number;
  project_id: number;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  status: 'open' | 'interview_prompted' | 'resolved';
  suggested_question: string;
  resolved_notes?: string;
  created_at: string;
}

export interface Contradiction {
  id: number;
  project_id: number;
  claim_a_id: number;
  claim_b_id: number;
  claim_a_statement?: string;
  claim_b_statement?: string;
  conflict_summary: string;
  status: string;
  created_at: string;
}

export interface Dependency {
  id: number;
  project_id: number;
  source_entity: string;
  target_entity: string;
  dependency_type: string;
  criticality: 'low' | 'medium' | 'high' | 'fatal';
  description: string;
  created_at: string;
}

export interface InterviewResponse {
  id: number;
  interview_id: number;
  gap_id?: number;
  prompt_question: string;
  category: string;
  answer_text: string;
  is_critical: boolean;
}

export interface ExitInterview {
  id: number;
  project_id: number;
  departing_user_name: string;
  departing_user_email: string;
  role_title: string;
  status: 'draft' | 'in_progress' | 'completed';
  completion_percentage: number;
  created_at: string;
  questions_count?: number;
  responses?: InterviewResponse[];
}

export interface Handover {
  id: number;
  project_id: number;
  title: string;
  executive_summary: string;
  architecture_overview: string;
  key_decisions: string;
  unfinished_work: string;
  pitfalls_and_risks: string;
  operational_runbook: string;
  verified_claims_count: number;
  readiness_score: number;
  status: string;
  created_at: string;
}

export interface QRBridge {
  id: number;
  handover_id: number;
  signed_token: string;
  qr_data_url: string;
  has_passphrase: boolean;
  max_uses: number;
  current_uses: number;
  is_revoked: boolean;
  expires_at: string;
  created_at: string;
}

export interface RiskFactor {
  category: string;
  score: number;
  risk_level: string;
  explanation: string;
}

export interface RadarOverview {
  overall_readiness_score: number;
  overall_risk_score: number;
  bus_factor_alert_count: number;
  unresolved_gaps_count: number;
  unverified_claims_count: number;
  active_handovers_count: number;
  risk_breakdown: RiskFactor[];
  project_risk_matrix: Array<{
    project_id: number;
    project_name: string;
    status: string;
    risk_score: number;
    readiness_score: number;
    total_claims: number;
    unverified_claims_count: number;
    open_gaps_count: number;
    critical_gaps_count: number;
  }>;
}

export interface AuditLogItem {
  id: number;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details_json: string;
  created_at: string;
}
