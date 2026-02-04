# Use the official Playwright image (includes Python + Browsers + Dependencies)
FROM mcr.microsoft.com/playwright/python:v1.40.0-jammy

# Set working directory
WORKDIR /app

# Install basic system tools (if needed for other libs)
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to cache dependencies
COPY requirements.txt .

# Install Python packages
# (Note: We don't need 'playwright install-deps' because the image has them!)
RUN pip install --no-cache-dir -r requirements.txt

# Install the specific browser binary we need (Chromium)
RUN playwright install chromium

# Copy the rest of the app
COPY . .

# Expose port
EXPOSE 5000

# Start the server
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--timeout", "120", "server:app"]