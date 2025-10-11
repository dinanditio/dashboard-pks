# api/serializers.py

from rest_framework import serializers
from .models import Report, Issue, KeyPoint, Stakeholder, Tag

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['name']

class KeyPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = KeyPoint
        fields = ['text']

class StakeholderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stakeholder
        fields = ['name']

class IssueSerializer(serializers.ModelSerializer):
    key_points = KeyPointSerializer(many=True, read_only=True)
    stakeholders = StakeholderSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Issue
        fields = ['issue_number', 'title', 'stakeholders', 'key_points', 'tags']

class ReportSerializer(serializers.ModelSerializer):
    issues = IssueSerializer(many=True, read_only=True)

    class Meta:
        model = Report
        fields = ['id', 'title', 'start_date', 'end_date', 'issues']