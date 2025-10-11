# api/views.py

from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Report
from .serializers import ReportSerializer

import re
from collections import Counter
from nltk.corpus import stopwords

class ReportViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint yang memungkinkan laporan untuk dilihat.
    Menyediakan aksi `list` dan `retrieve`.
    """
    queryset = Report.objects.all().order_by('-start_date')
    serializer_class = ReportSerializer

class WordCloudDataView(APIView):
    def get(self, request, report_pk=None, format=None):
        try:
            report = Report.objects.get(pk=report_pk)
            
            all_text = []
            for issue in report.issues.all():
                all_text.append(issue.title)
                for point in issue.key_points.all():
                    all_text.append(point.text)
            
            full_text = ' '.join(all_text).lower()

            stop_words = set(stopwords.words('indonesian'))
            additional_stop_words = {'isu', 'dan', 'di', 'ke', 'ini', 'itu', 'untuk', 'dari', 'yang', 'rp'}
            stop_words.update(additional_stop_words)

            words = re.findall(r'\b\w+\b', full_text)
            cleaned_words = [word for word in words if word not in stop_words and not word.isdigit()]

            word_counts = Counter(cleaned_words)
            
            wordcloud_data = [{'text': word, 'value': count} for word, count in word_counts.most_common(50)]

            return Response(wordcloud_data)

        except Report.DoesNotExist:
            return Response({"error": "Report not found"}, status=404)

class StakeholderFrequencyView(APIView):
    def get(self, request, report_pk=None, format=None):
        try:
            report = Report.objects.get(pk=report_pk)
            
            stakeholder_list = []
            for issue in report.issues.all():
                for stakeholder in issue.stakeholders.all():
                    stakeholder_list.append(stakeholder.name)
            
            stakeholder_counts = Counter(stakeholder_list)
            
            frequency_data = [{'name': name, 'count': count} for name, count in stakeholder_counts.items()]
            frequency_data = sorted(frequency_data, key=lambda x: x['count'], reverse=True)

            return Response(frequency_data)

        except Report.DoesNotExist:
            return Response({"error": "Report not found"}, status=404)

class TagFrequencyView(APIView):
    def get(self, request, report_pk=None, format=None):
        try:
            report = Report.objects.get(pk=report_pk)

            tag_list = []
            for issue in report.issues.all():
                for tag in issue.tags.all():
                    tag_list.append(tag.name)
            
            tag_counts = Counter(tag_list)
            
            frequency_data = [{'name': name, 'count': count} for name, count in tag_counts.items()]
            frequency_data = sorted(frequency_data, key=lambda x: x['count'], reverse=True)

            return Response(frequency_data)

        except Report.DoesNotExist:
            return Response({"error": "Report not found"}, status=404)