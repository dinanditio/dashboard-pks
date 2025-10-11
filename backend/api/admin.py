# api/admin.py

from django.contrib import admin
from .models import Report, Issue, KeyPoint, Stakeholder, Tag # BARU: import Tag

class KeyPointInline(admin.TabularInline):
    model = KeyPoint
    extra = 1

@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'report')
    inlines = [KeyPointInline]
    # BARU: Menambahkan filter untuk tags
    filter_horizontal = ('stakeholders', 'tags',)

admin.site.register(Report)
admin.site.register(Stakeholder)
admin.site.register(Tag) # BARU: Mendaftarkan Tag