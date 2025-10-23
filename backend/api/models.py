from django.db import models

class Tag(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Stakeholder(models.Model):
    name = models.CharField(max_length=200, unique=True)

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
    report = models.ForeignKey(Report, related_name='issues', on_delete=models.CASCADE)
    issue_number = models.PositiveIntegerField()
    title = models.CharField(max_length=255)
    stakeholders = models.ManyToManyField(Stakeholder, related_name='issues')
    tags = models.ManyToManyField(Tag, related_name='issues_tagged')

    class Meta:
        unique_together = ('report', 'issue_number')
        ordering = ['issue_number']

    def __str__(self):
        return f"Isu #{self.issue_number}: {self.title} (Laporan: {self.report.title})"

class KeyPoint(models.Model):
    SENTIMENT_CHOICES = [
        ('POSITIVE', 'Positif'),
        ('NEGATIVE', 'Negatif'),
        ('NEUTRAL', 'Netral'),
    ]

    issue = models.ForeignKey(Issue, related_name='key_points', on_delete=models.CASCADE)
    text = models.TextField()
    sentiment = models.CharField(
        max_length=8,
        choices=SENTIMENT_CHOICES,
        default='NEUTRAL'
    )

    def __str__(self):
        return self.text[:50]

class CommissionIssueSummary(models.Model):
    report = models.ForeignKey(Report, related_name='commission_summaries', on_delete=models.CASCADE)
    commission_name = models.CharField(max_length=100)
    # Fields changed to TextField to allow longer text
    issue_1_title = models.TextField(blank=True, null=True)
    issue_2_title = models.TextField(blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('report', 'commission_name')
        ordering = ['order', 'commission_name']

    def __str__(self):
        return f"{self.commission_name} - {self.report.title}"