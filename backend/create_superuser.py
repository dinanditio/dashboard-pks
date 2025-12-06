import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dashboard_api.settings")
django.setup()

from django.contrib.auth.models import User

# Ganti password sesuai keinginan
USERNAME = "admin_baru"
EMAIL = "admin@example.com"
PASSWORD = "passwordrahasia123"

if not User.objects.filter(username=USERNAME).exists():
    User.objects.create_superuser(USERNAME, EMAIL, PASSWORD)
    print("Superuser berhasil dibuat!")
else:
    print("Superuser sudah ada.")