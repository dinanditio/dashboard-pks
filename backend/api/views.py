from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from collections import Counter

from .models import Report
from .serializers import ReportSerializer, ReportListSerializer

class ReportViewSet(viewsets.ViewSet):
    """
    ViewSet untuk menampilkan daftar laporan atau satu laporan detail.
    """
    def list(self, request):
        queryset = Report.objects.order_by('-start_date')
        serializer = ReportListSerializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        queryset = Report.objects.all()
        report = get_object_or_404(queryset, pk=pk)
        serializer = ReportSerializer(report)
        return Response(serializer.data)

class StakeholderFrequencyView(APIView):
    """
    API view untuk mendapatkan frekuensi stakeholder untuk laporan SPESIFIK.
    """
    def get(self, request, report_id, format=None):
        try:
            report = Report.objects.get(pk=report_id)
            stakeholder_list = []
            for issue in report.issues.all():
                for stakeholder in issue.stakeholders.all():
                    stakeholder_list.append(stakeholder.name)

            stakeholder_counts = Counter(stakeholder_list)
            top_5 = sorted(stakeholder_counts.items(), key=lambda item: item[1], reverse=True)[:5]
            frequency_data = [{'name': name, 'count': count} for name, count in top_5]
            return Response(frequency_data)
        except Report.DoesNotExist:
            return Response({"error": "Report not found"}, status=404)

class TagFrequencyView(APIView):
    """
    API view untuk mendapatkan frekuensi tag untuk laporan SPESIFIK.
    """
    def get(self, request, report_id, format=None):
        try:
            report = Report.objects.get(pk=report_id)
            tag_list = []
            for issue in report.issues.all():
                for tag in issue.tags.all():
                    tag_list.append(tag.name)

            tag_counts = Counter(tag_list)
            top_5 = sorted(tag_counts.items(), key=lambda item: item[1], reverse=True)[:5]
            frequency_data = [{'name': name, 'count': count} for name, count in top_5]
            return Response(frequency_data)
        except Report.DoesNotExist:
            return Response({"error": "Report not found"}, status=404)

class SentimentAnalysisView(APIView):
    """
    API view untuk mendapatkan data analisis sentimen untuk laporan SPESIFIK.
    """
    def get(self, request, report_id, format=None):
        try:
            report = Report.objects.get(pk=report_id)
            sentiments = []
            for issue in report.issues.all():
                for point in issue.key_points.all():
                    sentiments.append(point.get_sentiment_display())

            sentiment_counts = Counter(sentiments)
            response_data = {
                "labels": list(sentiment_counts.keys()),
                "counts": list(sentiment_counts.values())
            }
            return Response(response_data)
        except Report.DoesNotExist:
            return Response({"error": "Report not found"}, status=404)