from django.db import models

# --- 1. KONFIGURASI KAMUS SENTIMEN (SANGAT RINGAN) ---
# Daftar kata kunci untuk deteksi sentimen otomatis.
# Bisa ditambahkan sewaktu-waktu tanpa perlu migrasi database.
POSITIVE_WORDS = {
    'dukung', 'sepakat', 'apresiasi', 'bagus', 'baik', 'positif', 'maju', 
    'sejahtera', 'untung', 'manfaat', 'solusi', 'berhasil', 'sukses', 
    'optimis', 'komitmen', 'stabilitas', 'tumbuh', 'kuat', 'setuju',
    'pro', 'membaik', 'efektif', 'efisien', 'sinergi', 'membangun'
}

NEGATIVE_WORDS = {
    'tolak', 'gagal', 'rugi', 'hambat', 'ancam', 'buruk', 'negatif', 
    'mundur', 'sengsara', 'kritik', 'masalah', 'bahaya', 'kecewa', 
    'prihatin', 'lambat', 'lemah', 'korupsi', 'kolusi', 'nepotisme',
    'kontra', 'memburuk', 'boros', 'tidak setuju', 'keberatan', 'defisit',
    'merugikan', 'menolak', 'protes'
}

# --- MODEL DEFINITIONS ---

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
        default='NEUTRAL',
        blank=True  # Kita set blank=True agar di Admin tidak wajib diisi manual
    )

    def __str__(self):
        return self.text[:50]

    # --- LOGIKA SENTIMEN BARU ---
    def analyze_sentiment_indo(self, text):
        """
        Menghitung skor sentimen berdasarkan jumlah kata positif vs negatif.
        Sangat ringan dan cepat.
        """
        text_lower = text.lower()
        score = 0
        
        # Cek kata positif (+1 point)
        for word in POSITIVE_WORDS:
            # Menggunakan spasi agar tidak mendeteksi kata di dalam kata (misal: 'ati' di dalam 'hati')
            # Namun untuk simplifikasi, pengecekan substring sederhana sudah cukup efektif
            if word in text_lower:
                score += 1
        
        # Cek kata negatif (-1 point)
        for word in NEGATIVE_WORDS:
            if word in text_lower:
                score -= 1
        
        # Tentukan label
        if score > 0:
            return 'POSITIVE'
        elif score < 0:
            return 'NEGATIVE'
        else:
            return 'NEUTRAL'

    def save(self, *args, **kwargs):
        # Otomatis isi sentimen jika:
        # 1. Data baru (self.pk is None), ATAU
        # 2. Sentimen saat ini masih 'NEUTRAL' (default)
        if not self.pk or self.sentiment == 'NEUTRAL':
            self.sentiment = self.analyze_sentiment_indo(self.text)
            
        super().save(*args, **kwargs)

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