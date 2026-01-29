# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies required for Playwright
# We need these so the headless browser works on Linux
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY requirements.txt .

# Install Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright Browsers (Chromium only to save space)
RUN playwright install chromium
RUN playwright install-deps chromium

# Copy the rest of the backend code
COPY . .

# Expose port 5000 (Flask default)
EXPOSE 5000

# Define environment variable for production
ENV FLASK_APP=server.py
ENV FLASK_ENV=production

# Run the application using Gunicorn (Production Server)
# We install gunicorn first just in case
RUN pip install gunicorn

# Command to run the app
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--timeout", "120", "server:app"]