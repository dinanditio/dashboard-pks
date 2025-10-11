#!/usr/bin/env bash
# Exit on error
set -o errexit

# 1. Install all the Python packages
pip install -r requirements.txt

# 2. Run database migrations
python manage.py migrate

# 3. Load the initial data from the JSON file
python manage.py loaddata initial_data.json