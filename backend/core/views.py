from django.db.models import Count, Sum, Avg, Q, F, DecimalField
from django.db.models.functions import TruncMonth
from django.utils import timezone
from django.contrib.auth.models import User
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from datetime import datetime, timedelta

from .models import (
    Department, Position, Referrer, Candidate, Referral,
    Interview, RewardRule, Reward, ReferralStatusHistory, DashboardStats
)
from .serializers import (
    DepartmentSerializer, PositionListSerializer, PositionDetailSerializer, PositionCreateSerializer,
    ReferrerListSerializer, ReferrerDetailSerializer, ReferrerCreateSerializer,
    CandidateListSerializer, CandidateDetailSerializer, CandidateCreateSerializer,
    ReferralListSerializer, ReferralDetailSerializer, ReferralCreateSerializer, ReferralStatusUpdateSerializer,
    InterviewSerializer, InterviewCreateSerializer,
    RewardRuleSerializer, RewardListSerializer, RewardDetailSerializer, RewardCreateSerializer, RewardUpdateSerializer,
    ReferralStatusHistorySerializer, DashboardStatsSerializer, DashboardSummarySerializer,
    UserSerializer
)


class CustomAuthToken(ObtainAuthToken):
    """自定义登录视图"""
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff,
        })


class UserInfoView(APIView):
    """获取当前用户信息"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class DepartmentViewSet(viewsets.ModelViewSet):
    """部门管理"""
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'code']


class PositionViewSet(viewsets.ModelViewSet):
    """岗位管理"""
    queryset = Position.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'department', 'employment_type']
    search_fields = ['title', 'code', 'description']
    ordering_fields = ['created_at', 'updated_at', 'min_salary', 'max_salary']

    def get_serializer_class(self):
        if self.action == 'list':
            return PositionListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return PositionCreateSerializer
        return PositionDetailSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def active(self, request):
        """获取活跃岗位"""
        positions = self.get_queryset().filter(status='open')
        serializer = PositionListSerializer(positions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def referrals(self, request, pk=None):
        """获取岗位的推荐列表"""
        position = self.get_object()
        referrals = position.referrals.all()
        serializer = ReferralListSerializer(referrals, many=True)
        return Response(serializer.data)


class ReferrerViewSet(viewsets.ModelViewSet):
    """内推人管理"""
    queryset = Referrer.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'is_active']
    search_fields = ['name', 'employee_id', 'email']
    ordering_fields = ['total_referrals', 'successful_referrals', 'total_rewards', 'created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return ReferrerListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ReferrerCreateSerializer
        return ReferrerDetailSerializer

    @action(detail=False, methods=['get'])
    def top(self, request):
        """获取Top内推人"""
        top_referrers = self.get_queryset().order_by('-successful_referrals')[:10]
        serializer = ReferrerListSerializer(top_referrers, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def referrals(self, request, pk=None):
        """获取内推人的推荐记录"""
        referrer = self.get_object()
        referrals = referrer.referrals.all()
        serializer = ReferralListSerializer(referrals, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """获取内推人统计"""
        referrer = self.get_object()
        stats = {
            'total_referrals': referrer.total_referrals,
            'successful_referrals': referrer.successful_referrals,
            'conversion_rate': round(referrer.successful_referrals / referrer.total_referrals * 100, 2) if referrer.total_referrals > 0 else 0,
            'total_rewards': str(referrer.total_rewards),
            'pending_referrals': referrer.referrals.filter(status__in=['submitted', 'screening', 'interviewing']).count(),
        }
        return Response(stats)


class CandidateViewSet(viewsets.ModelViewSet):
    """候选人管理"""
    queryset = Candidate.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['gender', 'education']
    search_fields = ['name', 'email', 'phone', 'current_company', 'school']
    ordering_fields = ['created_at', 'work_experience_years', 'age']

    def get_serializer_class(self):
        if self.action == 'list':
            return CandidateListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return CandidateCreateSerializer
        return CandidateDetailSerializer

    @action(detail=True, methods=['get'])
    def referrals(self, request, pk=None):
        """获取候选人的推荐历史"""
        candidate = self.get_object()
        referrals = candidate.referrals.all()
        serializer = ReferralListSerializer(referrals, many=True)
        return Response(serializer.data)


class ReferralViewSet(viewsets.ModelViewSet):
    """内推记录管理"""
    queryset = Referral.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'source', 'position', 'referrer']
    search_fields = ['referral_code', 'candidate__name', 'candidate__email', 'referrer__name']
    ordering_fields = ['submitted_at', 'last_updated']

    def get_serializer_class(self):
        if self.action == 'list':
            return ReferralListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ReferralCreateSerializer
        return ReferralDetailSerializer

    def perform_create(self, serializer):
        referral = serializer.save()
        # 更新内推人统计
        referral.referrer.update_statistics()
        # 记录状态变更历史
        ReferralStatusHistory.objects.create(
            referral=referral,
            to_status=referral.status,
            changed_by=self.request.user,
            notes='创建内推记录'
        )

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """更新内推状态"""
        referral = self.get_object()
        old_status = referral.status
        serializer = ReferralStatusUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            new_status = serializer.validated_data.get('status')
            notes = serializer.validated_data.get('notes', '')
            
            referral.status = new_status
            if new_status == 'hired':
                referral.hired_at = timezone.now()
            referral.save()
            
            # 记录状态变更历史
            ReferralStatusHistory.objects.create(
                referral=referral,
                from_status=old_status,
                to_status=new_status,
                changed_by=request.user,
                notes=notes
            )
            
            # 如果入职，更新内推人统计
            if new_status == 'hired':
                referral.referrer.update_statistics()
            
            return Response(ReferralDetailSerializer(referral).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """获取状态变更历史"""
        referral = self.get_object()
        history = referral.status_history.all()
        serializer = ReferralStatusHistorySerializer(history, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def create_interview(self, request, pk=None):
        """创建面试记录"""
        referral = self.get_object()
        serializer = InterviewCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(referral=referral)
            # 自动更新状态为面试中
            if referral.status == 'screening':
                old_status = referral.status
                referral.status = 'interviewing'
                referral.save()
                ReferralStatusHistory.objects.create(
                    referral=referral,
                    from_status=old_status,
                    to_status='interviewing',
                    changed_by=request.user,
                    notes='创建面试安排'
                )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def create_reward(self, request, pk=None):
        """创建奖励记录"""
        referral = self.get_object()
        
        # 检查是否已有奖励
        if hasattr(referral, 'reward'):
            return Response(
                {'error': '该内推记录已有奖励'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = RewardCreateSerializer(data=request.data)
        if serializer.is_valid():
            reward = serializer.save(referral=referral)
            # 更新内推人总奖励
            referrer = referral.referrer
            referrer.total_rewards += reward.amount
            referrer.save()
            return Response(RewardDetailSerializer(reward).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InterviewViewSet(viewsets.ModelViewSet):
    """面试管理"""
    queryset = Interview.objects.all()
    serializer_class = InterviewSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['interview_type', 'result', 'referral']
    ordering_fields = ['scheduled_at', 'created_at']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return InterviewCreateSerializer
        return InterviewSerializer

    @action(detail=True, methods=['post'])
    def update_result(self, request, pk=None):
        """更新面试结果"""
        interview = self.get_object()
        result = request.data.get('result')
        feedback = request.data.get('feedback', '')
        score = request.data.get('score')
        
        if result in dict(Interview.RESULT_CHOICES).keys():
            interview.result = result
            interview.feedback = feedback
            if score is not None:
                interview.score = score
            interview.save()
            return Response(InterviewSerializer(interview).data)
        return Response(
            {'error': '无效的结果状态'},
            status=status.HTTP_400_BAD_REQUEST
        )


class RewardRuleViewSet(viewsets.ModelViewSet):
    """奖励规则管理"""
    queryset = RewardRule.objects.all()
    serializer_class = RewardRuleSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['reward_type', 'trigger_event', 'is_active']
    search_fields = ['name', 'description']

    @action(detail=False, methods=['get'])
    def active(self, request):
        """获取启用的规则"""
        rules = self.get_queryset().filter(is_active=True)
        serializer = RewardRuleSerializer(rules, many=True)
        return Response(serializer.data)


class RewardViewSet(viewsets.ModelViewSet):
    """奖励发放管理"""
    queryset = Reward.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_method']
    search_fields = ['reward_code', 'referral__referrer__name', 'referral__candidate__name']
    ordering_fields = ['created_at', 'payment_date', 'amount']

    def get_serializer_class(self):
        if self.action == 'list':
            return RewardListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return RewardCreateSerializer
        return RewardDetailSerializer

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """获取待发放的奖励"""
        rewards = self.get_queryset().filter(status='pending')
        serializer = RewardListSerializer(rewards, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def process_payment(self, request, pk=None):
        """处理奖励发放"""
        reward = self.get_object()
        serializer = RewardUpdateSerializer(reward, data=request.data, partial=True)
        
        if serializer.is_valid():
            reward = serializer.save()
            if reward.status == 'paid':
                reward.paid_by = request.user
                reward.paid_at = timezone.now()
                reward.save()
            return Response(RewardDetailSerializer(reward).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """获取奖励统计"""
        stats = {
            'total_rewards': self.get_queryset().filter(status='paid').aggregate(
                total=Sum('amount')
            )['total'] or 0,
            'pending_amount': self.get_queryset().filter(status='pending').aggregate(
                total=Sum('amount')
            )['total'] or 0,
            'total_count': self.get_queryset().count(),
            'paid_count': self.get_queryset().filter(status='paid').count(),
            'pending_count': self.get_queryset().filter(status='pending').count(),
        }
        return Response(stats)


class DashboardStatsViewSet(viewsets.ReadOnlyModelViewSet):
    """仪表板统计"""
    queryset = DashboardStats.objects.all()
    serializer_class = DashboardStatsSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """获取仪表板汇总数据"""
        today = timezone.now().date()
        thirty_days_ago = today - timedelta(days=30)
        
        # 基础统计
        total_referrals = Referral.objects.count()
        total_hired = Referral.objects.filter(status='hired').count()
        total_rewards = Reward.objects.filter(status='paid').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        conversion_rate = round(total_hired / total_referrals * 100, 2) if total_referrals > 0 else 0
        
        # 活跃数据
        active_positions = Position.objects.filter(status='open').count()
        active_referrers = Referrer.objects.filter(is_active=True).count()
        pending_rewards = Reward.objects.filter(status='pending').count()
        
        # 月度趋势（最近6个月）
        six_months_ago = today - timedelta(days=180)
        monthly_referrals = Referral.objects.filter(
            submitted_at__date__gte=six_months_ago
        ).annotate(
            month=TruncMonth('submitted_at')
        ).values('month').annotate(
            count=Count('id'),
            hired=Count('id', filter=Q(status='hired'))
        ).order_by('month')
        
        monthly_data = [
            {
                'month': item['month'].strftime('%Y-%m'),
                'count': item['count'],
                'hired': item['hired']
            }
            for item in monthly_referrals
        ]
        
        # 状态分布
        status_distribution = Referral.objects.values('status').annotate(
            count=Count('id')
        ).order_by('-count')
        
        status_data = [
            {
                'status': item['status'],
                'status_display': dict(Referral.STATUS_CHOICES).get(item['status'], item['status']),
                'count': item['count']
            }
            for item in status_distribution
        ]
        
        # Top内推人
        top_referrers = Referrer.objects.order_by('-successful_referrals')[:5]
        top_referrers_data = [
            {
                'id': r.id,
                'name': r.name,
                'employee_id': r.employee_id,
                'total_referrals': r.total_referrals,
                'successful_referrals': r.successful_referrals,
                'total_rewards': str(r.total_rewards)
            }
            for r in top_referrers
        ]
        
        data = {
            'total_referrals': total_referrals,
            'total_hired': total_hired,
            'total_rewards': total_rewards,
            'conversion_rate': conversion_rate,
            'active_positions': active_positions,
            'active_referrers': active_referrers,
            'pending_rewards': pending_rewards,
            'monthly_referrals': monthly_data,
            'status_distribution': status_data,
            'top_referrers': top_referrers_data,
        }
        
        serializer = DashboardSummarySerializer(data=data)
        serializer.is_valid()
        return Response(serializer.validated_data)

    @action(detail=False, methods=['get'])
    def recent_activity(self, request):
        """获取最近活动"""
        recent_referrals = Referral.objects.order_by('-submitted_at')[:10]
        recent_rewards = Reward.objects.order_by('-created_at')[:10]
        
        activity = []
        
        for referral in recent_referrals:
            activity.append({
                'type': 'referral',
                'title': f"{referral.candidate.name} 被推荐到 {referral.position.title}",
                'description': f"推荐人: {referral.referrer.name}",
                'status': referral.status,
                'status_display': referral.get_status_display(),
                'time': referral.submitted_at,
            })
        
        for reward in recent_rewards:
            activity.append({
                'type': 'reward',
                'title': f"奖励发放 ¥{reward.amount}",
                'description': f"推荐人: {reward.referral.referrer.name}, 候选人: {reward.referral.candidate.name}",
                'status': reward.status,
                'status_display': reward.get_status_display(),
                'time': reward.created_at,
            })
        
        # 按时间排序
        activity.sort(key=lambda x: x['time'], reverse=True)
        
        return Response(activity[:20])
