from rest_framework import serializers
# Tambahkan CommissionIssueSummary ke daftar import
from .models import Report, Issue, KeyPoint, Stakeholder, Tag, CommissionIssueSummary

# Serializer untuk KeyPoint
class KeyPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = KeyPoint
        fields = ['text', 'sentiment']

# Serializer untuk Stakeholder
class StakeholderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stakeholder
        fields = ['name']

# Serializer untuk Tag
class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['name']

# Serializer untuk Issue (detail)
class IssueSerializer(serializers.ModelSerializer):
    key_points = KeyPointSerializer(many=True, read_only=True)
    stakeholders = StakeholderSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Issue
        fields = ['issue_number', 'title', 'stakeholders', 'key_points', 'tags']

# Serializer untuk daftar Report (ringkas)
class ReportListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['id', 'title', 'start_date', 'end_date']

# --- SERIALIZER BARU UNTUK RINGKASAN KOMISI ---
class CommissionIssueSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = CommissionIssueSummary
        # Hanya sertakan field yang dibutuhkan oleh frontend accordion
        fields = ['commission_name', 'issue_1_title', 'issue_2_title']

# Serializer untuk Report (detail, termasuk isu dan ringkasan komisi)
class ReportSerializer(serializers.ModelSerializer):
    issues = IssueSerializer(many=True, read_only=True)
    # Kita tambahkan juga ringkasan komisi ke detail laporan
    commission_summaries = CommissionIssueSummarySerializer(many=True, read_only=True)

    class Meta:
        model = Report
        fields = ['id', 'title', 'start_date', 'end_date', 'issues', 'commission_summaries'] # Tambahkan commission_summaries