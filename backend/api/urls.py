from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ReportViewSet,
    StakeholderFrequencyView,
    TagFrequencyView,
    SentimentAnalysisView,
    CommissionSummaryView # <-- Tambahkan impor view baru
)

router = DefaultRouter()
router.register(r'reports', ReportViewSet, basename='report')

urlpatterns = [
    # Termasuk /api/reports/ dan /api/reports/{id}/
    path('', include(router.urls)),

    # Endpoint untuk semua data chart, sekarang memerlukan report_id
    path('reports/<int:report_id>/stakeholder-frequency/', StakeholderFrequencyView.as_view(), name='stakeholder-frequency'),
    path('reports/<int:report_id>/tag-frequency/', TagFrequencyView.as_view(), name='tag-frequency'),
    path('reports/<int:report_id>/sentiment-analysis/', SentimentAnalysisView.as_view(), name='sentiment-analysis'),

    # --- URL BARU UNTUK RINGKASAN KOMISI ---
    path('reports/<int:report_id>/commission-summary/', CommissionSummaryView.as_view(), name='commission-summary'),
]