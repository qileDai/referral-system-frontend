import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { message } from 'antd';
import {
  User, Department, Position, Referrer, Candidate, Referral,
  Interview, RewardRule, Reward, DashboardSummary, RecentActivity,
  LoginCredentials, AuthResponse, ApiResponse
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Token ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          message.error('登录已过期，请重新登录');
        } else if (error.response?.status === 403) {
          message.error('没有权限执行此操作');
        } else if (error.response?.data?.detail) {
          message.error(error.response.data.detail);
        } else {
          message.error('操作失败，请稍后重试');
        }
        return Promise.reject(error);
      }
    );
  }

  // 认证相关
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login/', credentials);
    const { token } = response.data;
    localStorage.setItem('token', token);
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/auth/user/');
    return response.data;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // 部门管理
  async getDepartments(params?: Record<string, any>): Promise<ApiResponse<Department>> {
    const response = await this.client.get<ApiResponse<Department>>('/departments/', { params });
    return response.data;
  }

  async getDepartment(id: number): Promise<Department> {
    const response = await this.client.get<Department>(`/departments/${id}/`);
    return response.data;
  }

  async createDepartment(data: Partial<Department>): Promise<Department> {
    const response = await this.client.post<Department>('/departments/', data);
    return response.data;
  }

  async updateDepartment(id: number, data: Partial<Department>): Promise<Department> {
    const response = await this.client.put<Department>(`/departments/${id}/`, data);
    return response.data;
  }

  async deleteDepartment(id: number): Promise<void> {
    await this.client.delete(`/departments/${id}/`);
  }

  // 岗位管理
  async getPositions(params?: Record<string, any>): Promise<ApiResponse<Position>> {
    const response = await this.client.get<ApiResponse<Position>>('/positions/', { params });
    return response.data;
  }

  async getPosition(id: number): Promise<Position> {
    const response = await this.client.get<Position>(`/positions/${id}/`);
    return response.data;
  }

  async createPosition(data: Partial<Position>): Promise<Position> {
    const response = await this.client.post<Position>('/positions/', data);
    return response.data;
  }

  async updatePosition(id: number, data: Partial<Position>): Promise<Position> {
    const response = await this.client.put<Position>(`/positions/${id}/`, data);
    return response.data;
  }

  async deletePosition(id: number): Promise<void> {
    await this.client.delete(`/positions/${id}/`);
  }

  async getActivePositions(): Promise<Position[]> {
    const response = await this.client.get<Position[]>('/positions/active/');
    return response.data;
  }

  // 内推人管理
  async getReferrers(params?: Record<string, any>): Promise<ApiResponse<Referrer>> {
    const response = await this.client.get<ApiResponse<Referrer>>('/referrers/', { params });
    return response.data;
  }

  async getReferrer(id: number): Promise<Referrer> {
    const response = await this.client.get<Referrer>(`/referrers/${id}/`);
    return response.data;
  }

  async createReferrer(data: Partial<Referrer>): Promise<Referrer> {
    const response = await this.client.post<Referrer>('/referrers/', data);
    return response.data;
  }

  async updateReferrer(id: number, data: Partial<Referrer>): Promise<Referrer> {
    const response = await this.client.put<Referrer>(`/referrers/${id}/`, data);
    return response.data;
  }

  async deleteReferrer(id: number): Promise<void> {
    await this.client.delete(`/referrers/${id}/`);
  }

  async getTopReferrers(): Promise<Referrer[]> {
    const response = await this.client.get<Referrer[]>('/referrers/top/');
    return response.data;
  }

  async getReferrerStats(id: number): Promise<any> {
    const response = await this.client.get(`/referrers/${id}/stats/`);
    return response.data;
  }

  // 候选人管理
  async getCandidates(params?: Record<string, any>): Promise<ApiResponse<Candidate>> {
    const response = await this.client.get<ApiResponse<Candidate>>('/candidates/', { params });
    return response.data;
  }

  async getCandidate(id: number): Promise<Candidate> {
    const response = await this.client.get<Candidate>(`/candidates/${id}/`);
    return response.data;
  }

  async createCandidate(data: Partial<Candidate>): Promise<Candidate> {
    const response = await this.client.post<Candidate>('/candidates/', data);
    return response.data;
  }

  async updateCandidate(id: number, data: Partial<Candidate>): Promise<Candidate> {
    const response = await this.client.put<Candidate>(`/candidates/${id}/`, data);
    return response.data;
  }

  async deleteCandidate(id: number): Promise<void> {
    await this.client.delete(`/candidates/${id}/`);
  }

  // 内推记录管理
  async getReferrals(params?: Record<string, any>): Promise<ApiResponse<Referral>> {
    const response = await this.client.get<ApiResponse<Referral>>('/referrals/', { params });
    return response.data;
  }

  async getReferral(id: number): Promise<Referral> {
    const response = await this.client.get<Referral>(`/referrals/${id}/`);
    return response.data;
  }

  async createReferral(data: Partial<Referral>): Promise<Referral> {
    const response = await this.client.post<Referral>('/referrals/', data);
    return response.data;
  }

  async updateReferral(id: number, data: Partial<Referral>): Promise<Referral> {
    const response = await this.client.put<Referral>(`/referrals/${id}/`, data);
    return response.data;
  }

  async deleteReferral(id: number): Promise<void> {
    await this.client.delete(`/referrals/${id}/`);
  }

  async updateReferralStatus(id: number, status: string, notes?: string): Promise<Referral> {
    const response = await this.client.post<Referral>(`/referrals/${id}/update_status/`, {
      status,
      notes,
    });
    return response.data;
  }

  async getReferralHistory(id: number): Promise<any[]> {
    const response = await this.client.get(`/referrals/${id}/history/`);
    return response.data;
  }

  async createInterview(id: number, data: Partial<Interview>): Promise<Interview> {
    const response = await this.client.post<Interview>(`/referrals/${id}/create_interview/`, data);
    return response.data;
  }

  async createReward(id: number, data: Partial<Reward>): Promise<Reward> {
    const response = await this.client.post<Reward>(`/referrals/${id}/create_reward/`, data);
    return response.data;
  }

  // 面试管理
  async getInterviews(params?: Record<string, any>): Promise<ApiResponse<Interview>> {
    const response = await this.client.get<ApiResponse<Interview>>('/interviews/', { params });
    return response.data;
  }

  async getInterview(id: number): Promise<Interview> {
    const response = await this.client.get<Interview>(`/interviews/${id}/`);
    return response.data;
  }

  async updateInterview(id: number, data: Partial<Interview>): Promise<Interview> {
    const response = await this.client.put<Interview>(`/interviews/${id}/`, data);
    return response.data;
  }

  async updateInterviewResult(id: number, result: string, feedback?: string, score?: number): Promise<Interview> {
    const response = await this.client.post<Interview>(`/interviews/${id}/update_result/`, {
      result,
      feedback,
      score,
    });
    return response.data;
  }

  // 奖励规则管理
  async getRewardRules(params?: Record<string, any>): Promise<ApiResponse<RewardRule>> {
    const response = await this.client.get<ApiResponse<RewardRule>>('/reward-rules/', { params });
    return response.data;
  }

  async getRewardRule(id: number): Promise<RewardRule> {
    const response = await this.client.get<RewardRule>(`/reward-rules/${id}/`);
    return response.data;
  }

  async createRewardRule(data: Partial<RewardRule>): Promise<RewardRule> {
    const response = await this.client.post<RewardRule>('/reward-rules/', data);
    return response.data;
  }

  async updateRewardRule(id: number, data: Partial<RewardRule>): Promise<RewardRule> {
    const response = await this.client.put<RewardRule>(`/reward-rules/${id}/`, data);
    return response.data;
  }

  async deleteRewardRule(id: number): Promise<void> {
    await this.client.delete(`/reward-rules/${id}/`);
  }

  async getActiveRewardRules(): Promise<RewardRule[]> {
    const response = await this.client.get<RewardRule[]>('/reward-rules/active/');
    return response.data;
  }

  // 奖励发放管理
  async getRewards(params?: Record<string, any>): Promise<ApiResponse<Reward>> {
    const response = await this.client.get<ApiResponse<Reward>>('/rewards/', { params });
    return response.data;
  }

  async getReward(id: number): Promise<Reward> {
    const response = await this.client.get<Reward>(`/rewards/${id}/`);
    return response.data;
  }

  async createRewardDirect(data: Partial<Reward>): Promise<Reward> {
    const response = await this.client.post<Reward>('/rewards/', data);
    return response.data;
  }

  async updateReward(id: number, data: Partial<Reward>): Promise<Reward> {
    const response = await this.client.put<Reward>(`/rewards/${id}/`, data);
    return response.data;
  }

  async processPayment(id: number, data: Partial<Reward>): Promise<Reward> {
    const response = await this.client.post<Reward>(`/rewards/${id}/process_payment/`, data);
    return response.data;
  }

  async getPendingRewards(): Promise<Reward[]> {
    const response = await this.client.get<Reward[]>('/rewards/pending/');
    return response.data;
  }

  async getRewardStats(): Promise<any> {
    const response = await this.client.get('/rewards/stats/');
    return response.data;
  }

  // 仪表板统计
  async getDashboardSummary(): Promise<DashboardSummary> {
    const response = await this.client.get<DashboardSummary>('/dashboard/summary/');
    return response.data;
  }

  async getRecentActivity(): Promise<RecentActivity[]> {
    const response = await this.client.get<RecentActivity[]>('/dashboard/recent_activity/');
    return response.data;
  }
}

export const api = new ApiService();
export default api;
