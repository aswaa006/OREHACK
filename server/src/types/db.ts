export interface Admin {
  id: string;
  email: string;
  password_hash: string;
  display_name: string | null;
  role: 'developer_admin' | 'hackathon_admin' | 'jury';
  hackathon_slug: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Hackathon {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  theme: string | null;
  start_time: Date;
  duration_hours: number;
  end_time: Date | null;
  eval_round_offsets: number[];
  login_enabled: boolean;
  stage1_active: boolean;
  stage2_active: boolean;
  ps_preview_minutes: number;
  ps_selection_seconds: number;
  ps_result_seconds: number;
  stage3_active: boolean;
  repo_rules_minutes: number;
  stage4_active: boolean;
  engine_running: boolean;
  stage5_active: boolean;
  jury_rounds: number;
  auto_eval_weight: number;
  jury_weight: number;
  status: 'draft' | 'scheduled' | 'live' | 'closed' | 'archived';
  total_teams: number;
  total_submissions: number;
  total_evaluated: number;
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Team {
  id: string;
  hackathon_slug: string;
  team_id: string;
  team_name: string;
  password_hash: string;
  current_stage: number;
  stage1_completed: boolean;
  stage2_completed: boolean;
  stage3_completed: boolean;
  assigned_problem_id: string | null;
  repo_url: string | null;
  repo_submitted_at: Date | null;
  repo_locked: boolean;
  checklist_confirmed: boolean;
  is_active: boolean;
  last_seen_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface Problem {
  id: string;
  hackathon_slug: string;
  ps_number: number;
  title: string;
  description: string;
  domain: string | null;
  slot_limit: number;
  slots_remaining: number;
  queue_position: number | null;
  is_active: boolean;
  released_at: Date | null;
  selection_closed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface ProblemSelection {
  id: string;
  hackathon_slug: string;
  team_id: string;
  problem_id: string;
  selected_at: Date;
}

export interface Submission {
  id: string;
  hackathon_slug: string;
  team_id: string;
  team_name: string;
  problem_id: string | null;
  repository_url: string;
  problem_statement: string | null;
  status: 'queued' | 'running' | 'evaluated' | 'failed';
  final_score: number | null;
  technical_score: number | null;
  max_technical: number;
  innovation_score: number | null;
  max_innovation: number;
  completeness_score: number | null;
  max_completeness: number;
  technical_breakdown: any | null;
  innovation_breakdown: any | null;
  completeness_breakdown: any | null;
  reasoning: string | null;
  eval_round: number | null;
  evaluation_timestamp: Date | null;
  error_message: string | null;
  submitted_at: Date;
  updated_at: Date;
}

export interface EvaluationReport {
  id: string;
  hackathon_slug: string;
  submission_id: string;
  team_id: string;
  eval_round: number;
  report_json: any;
  score: number | null;
  visible_to_team: boolean;
  generated_at: Date;
}

export interface JuryScore {
  id: string;
  hackathon_slug: string;
  team_id: string;
  jury_member_id: string;
  jury_round: number;
  score: number;
  remarks: string | null;
  evaluated_at: Date;
}

export interface FinalResult {
  id: string;
  hackathon_slug: string;
  team_id: string;
  auto_eval_score: number | null;
  jury_score: number | null;
  final_score: number | null;
  auto_eval_weight: number;
  jury_weight: number;
  rank: number | null;
  computed_at: Date;
}

export interface StageEvent {
  id: string;
  hackathon_slug: string;
  event_type: string;
  payload: any | null;
  triggered_by: 'admin' | 'scheduler' | 'system';
  admin_id: string | null;
  created_at: Date;
}
