from django.contrib import admin
# Tambahkan CommissionIssueSummary ke daftar import
from .models import Report, Issue, KeyPoint, Stakeholder, Tag, CommissionIssueSummary

# Inline untuk KeyPoint di halaman Issue
class KeyPointInline(admin.TabularInline):
    model = KeyPoint
    extra = 1
    fields = ('text', 'sentiment')

@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = ('issue_number', 'title', 'report')
    list_display_links = ('issue_number', 'title')
    list_filter = ('report', 'tags', 'stakeholders')
    search_fields = ('title',)
    inlines = [KeyPointInline]
    filter_horizontal = ('stakeholders', 'tags')

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'start_date', 'end_date', 'created_at')
    search_fields = ('title',)

# --- REGISTRASI BARU UNTUK MODEL KOMISI ---
@admin.register(CommissionIssueSummary)
class CommissionIssueSummaryAdmin(admin.ModelAdmin):
    # Kolom yang ditampilkan di daftar
    list_display = ('commission_name', 'report', 'issue_1_title', 'issue_2_title', 'order')
    # Filter berdasarkan laporan
    list_filter = ('report',)
    # Cari berdasarkan nama komisi atau judul isu
    search_fields = ('commission_name', 'issue_1_title', 'issue_2_title')
    # Memungkinkan Anda mengedit kolom 'order' langsung dari daftar
    list_editable = ('order',)
    # Urutkan berdasarkan order lalu nama
    ordering = ('report', 'order', 'commission_name')

# Registrasi model lainnya
admin.site.register(Tag)
admin.site.register(Stakeholder)