"""
URL configuration for referral_system project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.authtoken.views import obtain_auth_token
from core.views import CustomAuthToken, UserInfoView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', CustomAuthToken.as_view(), name='api_token_auth'),
    path('api/auth/user/', UserInfoView.as_view(), name='user_info'),
    path('api/', include('core.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
