# api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReportViewSet, WordCloudDataView, StakeholderFrequencyView, TagFrequencyView

# Buat router dan daftarkan viewset kita
router = DefaultRouter()
router.register(r'reports', ReportViewSet, basename='report')

# URL patterns sekarang mencakup URL yang dibuat oleh router
urlpatterns = [
    path('', include(router.urls)),
    path('reports/<int:report_pk>/wordcloud-data/', WordCloudDataView.as_view(), name='wordcloud-data'),
    path('reports/<int:report_pk>/stakeholder-frequency/', StakeholderFrequencyView.as_view(), name='stakeholder-frequency'),
    path('reports/<int:report_pk>/tag-frequency/', TagFrequencyView.as_view(), name='tag-frequency'),
]