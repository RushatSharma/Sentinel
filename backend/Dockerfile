# Use an official Python runtime
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Install system dependencies required for Playwright (Chromium)
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright Chromium (No Java/ZAP needed!)
RUN playwright install chromium
RUN playwright install-deps chromium

# Copy the rest of the backend code
COPY . .

# Expose port 5000
EXPOSE 5000

# Run the app
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--timeout", "120", "server:app"]