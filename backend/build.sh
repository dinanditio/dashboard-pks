#!/usr/bin/env bash
# Exit on error
set -o errexit

# 1. Install all the Python packages
pip install -r requirements.txt

# 2. Run database migrations
python manage.py migrate