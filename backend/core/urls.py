from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'departments', views.DepartmentViewSet)
router.register(r'positions', views.PositionViewSet)
router.register(r'referrers', views.ReferrerViewSet)
router.register(r'candidates', views.CandidateViewSet)
router.register(r'referrals', views.ReferralViewSet)
router.register(r'interviews', views.InterviewViewSet)
router.register(r'reward-rules', views.RewardRuleViewSet)
router.register(r'rewards', views.RewardViewSet)
router.register(r'dashboard', views.DashboardStatsViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
]
