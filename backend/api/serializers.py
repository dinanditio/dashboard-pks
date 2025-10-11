# backend/api/serializers.py

from rest_framework import serializers
from .models import Report, Issue, KeyPoint, Stakeholder, Tag

# Serializer untuk KeyPoint, Stakeholder, dan Tag (tidak berubah)
class KeyPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = KeyPoint
        fields = ['text', 'sentiment']

class StakeholderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stakeholder
        fields = ['name']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['name']

# Serializer untuk menampilkan Isu secara detail
class IssueSerializer(serializers.ModelSerializer):
    key_points = KeyPointSerializer(many=True, read_only=True)
    stakeholders = StakeholderSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Issue
        fields = ['issue_number', 'title', 'stakeholders', 'key_points', 'tags']

# --- KODE BARU DIMULAI DI SINI ---

# Serializer untuk daftar laporan (lebih ringan, tidak perlu detail isu)
class ReportListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['id', 'title', 'start_date', 'end_date']

# Serializer untuk menampilkan satu laporan secara lengkap dengan semua isunya
class ReportSerializer(serializers.ModelSerializer):
    issues = IssueSerializer(many=True, read_only=True)

    class Meta:
        model = Report
        fields = ['id', 'title', 'start_date', 'end_date', 'issues']