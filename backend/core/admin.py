from django.contrib import admin
from .models import (
    Department, Position, Referrer, Candidate, Referral,
    Interview, RewardRule, Reward, ReferralStatusHistory, DashboardStats
)


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'parent', 'created_at']
    search_fields = ['name', 'code']
    list_filter = ['created_at']


@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ['title', 'code', 'department', 'employment_type', 'status', 'headcount', 'created_at']
    list_filter = ['status', 'employment_type', 'department', 'created_at']
    search_fields = ['title', 'code', 'description']
    date_hierarchy = 'created_at'


@admin.register(Referrer)
class ReferrerAdmin(admin.ModelAdmin):
    list_display = ['name', 'employee_id', 'department', 'total_referrals', 'successful_referrals', 'total_rewards', 'is_active']
    list_filter = ['is_active', 'department', 'created_at']
    search_fields = ['name', 'employee_id', 'email']


@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'gender', 'education', 'work_experience_years', 'current_company']
    list_filter = ['gender', 'education', 'created_at']
    search_fields = ['name', 'email', 'phone', 'current_company']


@admin.register(Referral)
class ReferralAdmin(admin.ModelAdmin):
    list_display = ['referral_code', 'candidate', 'position', 'referrer', 'status', 'source', 'submitted_at']
    list_filter = ['status', 'source', 'submitted_at']
    search_fields = ['referral_code', 'candidate__name', 'referrer__name']
    date_hierarchy = 'submitted_at'


@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    list_display = ['referral', 'interview_type', 'round_number', 'scheduled_at', 'result', 'score']
    list_filter = ['interview_type', 'result', 'scheduled_at']


@admin.register(RewardRule)
class RewardRuleAdmin(admin.ModelAdmin):
    list_display = ['name', 'reward_type', 'trigger_event', 'is_active', 'created_at']
    list_filter = ['reward_type', 'trigger_event', 'is_active']
    search_fields = ['name', 'description']


@admin.register(Reward)
class RewardAdmin(admin.ModelAdmin):
    list_display = ['reward_code', 'referral', 'amount', 'status', 'payment_method', 'payment_date']
    list_filter = ['status', 'payment_method', 'created_at']
    search_fields = ['reward_code', 'referral__referrer__name']


@admin.register(ReferralStatusHistory)
class ReferralStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ['referral', 'from_status', 'to_status', 'changed_by', 'created_at']
    list_filter = ['created_at']


@admin.register(DashboardStats)
class DashboardStatsAdmin(admin.ModelAdmin):
    list_display = ['date', 'total_referrals', 'hired_count', 'total_rewards', 'conversion_rate']
    date_hierarchy = 'date'
