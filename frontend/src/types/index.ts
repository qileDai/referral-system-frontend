export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description: string;
  parent: number | null;
  parent_name?: string;
  created_at: string;
}

export interface Position {
  id: number;
  title: string;
  code: string;
  department: number;
  department_name?: string;
  description: string;
  requirements: string;
  responsibilities: string;
  employment_type: string;
  employment_type_display?: string;
  location: string;
  min_salary: string | null;
  max_salary: string | null;
  headcount: number;
  status: string;
  status_display?: string;
  current_applications?: number;
  created_at: string;
}

export interface Referrer {
  id: number;
  employee_id: string;
  name: string;
  email: string;
  phone: string;
  department: number;
  department_name?: string;
  total_referrals: number;
  successful_referrals: number;
  total_rewards: string;
  is_active: boolean;
  conversion_rate?: number;
  created_at: string;
}

export interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender: string;
  gender_display?: string;
  age: number | null;
  education: string;
  education_display?: string;
  school: string;
  major: string;
  work_experience_years: number;
  current_company: string;
  current_position: string;
  resume_url: string;
  notes: string;
  created_at: string;
}

export interface Interview {
  id: number;
  referral: number;
  interview_type: string;
  interview_type_display?: string;
  round_number: number;
  scheduled_at: string;
  duration_minutes: number;
  interviewer: string;
  interviewer_email: string;
  location: string;
  result: string;
  result_display?: string;
  feedback: string;
  score: number | null;
  created_at: string;
}

export interface Referral {
  id: number;
  referral_code: string;
  position: number;
  position_title?: string;
  referrer: number;
  referrer_name?: string;
  candidate: number;
  candidate_name?: string;
  status: string;
  status_display?: string;
  source: string;
  source_display?: string;
  relationship: string;
  referrer_notes: string;
  hr_notes: string;
  submitted_at: string;
  last_updated: string;
  hired_at: string | null;
  interviews?: Interview[];
  has_reward?: boolean;
}

export interface RewardRule {
  id: number;
  name: string;
  description: string;
  reward_type: string;
  reward_type_display?: string;
  fixed_amount: string | null;
  percentage: string | null;
  min_reward: string | null;
  max_reward: string | null;
  trigger_event: string;
  trigger_event_display?: string;
  delay_days: number;
  is_active: boolean;
  applicable_positions_count?: number;
  applicable_departments_count?: number;
  created_at: string;
}

export interface Reward {
  id: number;
  reward_code: string;
  referral: number;
  rule: number | null;
  amount: string;
  status: string;
  status_display?: string;
  payment_method: string;
  payment_method_display?: string;
  payment_date: string | null;
  payment_reference: string;
  tax_deducted: string;
  net_amount: string;
  notes: string;
  referrer_name?: string;
  candidate_name?: string;
  position_title?: string;
  created_at: string;
}

export interface DashboardSummary {
  total_referrals: number;
  total_hired: number;
  total_rewards: number;
  conversion_rate: number;
  active_positions: number;
  active_referrers: number;
  pending_rewards: number;
  monthly_referrals: Array<{
    month: string;
    count: number;
    hired: number;
  }>;
  status_distribution: Array<{
    status: string;
    status_display: string;
    count: number;
  }>;
  top_referrers: Array<{
    id: number;
    name: string;
    employee_id: string;
    total_referrals: number;
    successful_referrals: number;
    total_rewards: string;
  }>;
}

export interface RecentActivity {
  type: 'referral' | 'reward';
  title: string;
  description: string;
  status: string;
  status_display: string;
  time: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user_id: number;
  username: string;
  email: string;
  is_staff: boolean;
}

export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
