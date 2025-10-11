from django.contrib import admin
from .models import Report, Issue, KeyPoint, Stakeholder, Tag

# This inline allows you to edit KeyPoints directly from the Issue page.
# It now includes the 'sentiment' dropdown.
class KeyPointInline(admin.TabularInline):
    model = KeyPoint
    extra = 1
    fields = ('text', 'sentiment')

@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    # Columns to display in the main issue list
    list_display = ('issue_number', 'title', 'report')

    # This is the new line that makes the columns clickable links
    list_display_links = ('issue_number', 'title')

    # Filters on the right side of the list page
    list_filter = ('report', 'tags', 'stakeholders')

    # Adds a search bar at the top of the list
    search_fields = ('title',)

    # Includes the KeyPoint editor on the Issue change page
    inlines = [KeyPointInline]

    # Provides a better UI for selecting many-to-many fields
    filter_horizontal = ('stakeholders', 'tags')

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'start_date', 'end_date', 'created_at')
    search_fields = ('title',)

# Register the other models to make them visible in the admin panel
admin.site.register(Tag)
admin.site.register(Stakeholder)