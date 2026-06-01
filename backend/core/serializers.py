from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Department, Position, Referrer, Candidate, Referral,
    Interview, RewardRule, Reward, ReferralStatusHistory, DashboardStats
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff']


class DepartmentSerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source='parent.name', read_only=True)

    class Meta:
        model = Department
        fields = '__all__'


class PositionListSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    current_applications = serializers.IntegerField(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    employment_type_display = serializers.CharField(source='get_employment_type_display', read_only=True)

    class Meta:
        model = Position
        fields = [
            'id', 'title', 'code', 'department', 'department_name',
            'employment_type', 'employment_type_display', 'location',
            'min_salary', 'max_salary', 'headcount', 'status', 'status_display',
            'current_applications', 'created_at'
        ]


class PositionDetailSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    employment_type_display = serializers.CharField(source='get_employment_type_display', read_only=True)

    class Meta:
        model = Position
        fields = '__all__'


class PositionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at']


class ReferrerListSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Referrer
        fields = [
            'id', 'employee_id', 'name', 'email', 'phone',
            'department', 'department_name', 'total_referrals',
            'successful_referrals', 'total_rewards', 'is_active'
        ]


class ReferrerDetailSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    conversion_rate = serializers.SerializerMethodField()

    class Meta:
        model = Referrer
        fields = '__all__'

    def get_conversion_rate(self, obj):
        if obj.total_referrals > 0:
            return round(obj.successful_referrals / obj.total_referrals * 100, 2)
        return 0


class ReferrerCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Referrer
        fields = '__all__'
        read_only_fields = ['total_referrals', 'successful_referrals', 'total_rewards', 'created_at', 'updated_at']


class CandidateListSerializer(serializers.ModelSerializer):
    gender_display = serializers.CharField(source='get_gender_display', read_only=True)
    education_display = serializers.CharField(source='get_education_display', read_only=True)

    class Meta:
        model = Candidate
        fields = [
            'id', 'name', 'email', 'phone', 'gender', 'gender_display',
            'age', 'education', 'education_display', 'work_experience_years',
            'current_company', 'current_position', 'created_at'
        ]


class CandidateDetailSerializer(serializers.ModelSerializer):
    gender_display = serializers.CharField(source='get_gender_display', read_only=True)
    education_display = serializers.CharField(source='get_education_display', read_only=True)

    class Meta:
        model = Candidate
        fields = '__all__'


class CandidateCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidate
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class InterviewSerializer(serializers.ModelSerializer):
    interview_type_display = serializers.CharField(source='get_interview_type_display', read_only=True)
    result_display = serializers.CharField(source='get_result_display', read_only=True)

    class Meta:
        model = Interview
        fields = '__all__'


class InterviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interview
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class ReferralListSerializer(serializers.ModelSerializer):
    position_title = serializers.CharField(source='position.title', read_only=True)
    referrer_name = serializers.CharField(source='referrer.name', read_only=True)
    candidate_name = serializers.CharField(source='candidate.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    source_display = serializers.CharField(source='get_source_display', read_only=True)

    class Meta:
        model = Referral
        fields = [
            'id', 'referral_code', 'position', 'position_title',
            'referrer', 'referrer_name', 'candidate', 'candidate_name',
            'status', 'status_display', 'source', 'source_display',
            'submitted_at', 'last_updated'
        ]


class ReferralDetailSerializer(serializers.ModelSerializer):
    position = PositionListSerializer(read_only=True)
    referrer = ReferrerListSerializer(read_only=True)
    candidate = CandidateDetailSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    source_display = serializers.CharField(source='get_source_display', read_only=True)
    interviews = InterviewSerializer(many=True, read_only=True)
    has_reward = serializers.SerializerMethodField()

    class Meta:
        model = Referral
        fields = '__all__'

    def get_has_reward(self, obj):
        return hasattr(obj, 'reward')


class ReferralCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Referral
        fields = '__all__'
        read_only_fields = ['referral_code', 'submitted_at', 'last_updated', 'hired_at']


class ReferralStatusUpdateSerializer(serializers.ModelSerializer):
    notes = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Referral
        fields = ['status', 'notes']


class RewardRuleSerializer(serializers.ModelSerializer):
    reward_type_display = serializers.CharField(source='get_reward_type_display', read_only=True)
    trigger_event_display = serializers.CharField(source='get_trigger_event_display', read_only=True)
    applicable_positions_count = serializers.SerializerMethodField()
    applicable_departments_count = serializers.SerializerMethodField()

    class Meta:
        model = RewardRule
        fields = '__all__'

    def get_applicable_positions_count(self, obj):
        return obj.applicable_positions.count()

    def get_applicable_departments_count(self, obj):
        return obj.applicable_departments.count()


class RewardListSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    referrer_name = serializers.CharField(source='referral.referrer.name', read_only=True)
    candidate_name = serializers.CharField(source='referral.candidate.name', read_only=True)
    position_title = serializers.CharField(source='referral.position.title', read_only=True)

    class Meta:
        model = Reward
        fields = [
            'id', 'reward_code', 'referrer_name', 'candidate_name', 'position_title',
            'amount', 'status', 'status_display', 'payment_method', 'payment_method_display',
            'payment_date', 'net_amount', 'created_at'
        ]


class RewardDetailSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    referral = ReferralListSerializer(read_only=True)
    rule = RewardRuleSerializer(read_only=True)
    paid_by = UserSerializer(read_only=True)

    class Meta:
        model = Reward
        fields = '__all__'


class RewardCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reward
        fields = '__all__'
        read_only_fields = ['reward_code', 'created_at', 'updated_at', 'paid_at']


class RewardUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reward
        fields = ['status', 'payment_method', 'payment_date', 'payment_reference', 'notes']


class ReferralStatusHistorySerializer(serializers.ModelSerializer):
    from_status_display = serializers.CharField(source='get_from_status_display', read_only=True)
    to_status_display = serializers.CharField(source='get_to_status_display', read_only=True)
    changed_by_name = serializers.CharField(source='changed_by.username', read_only=True)

    class Meta:
        model = ReferralStatusHistory
        fields = '__all__'


class DashboardStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DashboardStats
        fields = '__all__'


class DashboardSummarySerializer(serializers.Serializer):
    total_referrals = serializers.IntegerField()
    total_hired = serializers.IntegerField()
    total_rewards = serializers.DecimalField(max_digits=15, decimal_places=2)
    conversion_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    active_positions = serializers.IntegerField()
    active_referrers = serializers.IntegerField()
    pending_rewards = serializers.IntegerField()
    monthly_referrals = serializers.ListField(child=serializers.DictField())
    status_distribution = serializers.ListField(child=serializers.DictField())
    top_referrers = serializers.ListField(child=serializers.DictField())


class CustomAuthTokenSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(style={'input_type': 'password'})
