# api/models.py

from django.db import models

class Stakeholder(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

# --- BARU: Model untuk Tag ---
class Tag(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Report(models.Model):
    title = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Issue(models.Model):
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name='issues')
    title = models.CharField(max_length=255)
    issue_number = models.IntegerField()
    stakeholders = models.ManyToManyField(Stakeholder, related_name='issues')
    # --- BARU: Hubungan ke Model Tag ---
    tags = models.ManyToManyField(Tag, related_name='issues', blank=True)

    def __str__(self):
        return f"ISU #{self.issue_number}: {self.title}"

class KeyPoint(models.Model):
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='key_points')
    text = models.CharField(max_length=255)

    def __str__(self):
        return self.text