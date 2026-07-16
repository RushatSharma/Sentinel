# Sentinel

Sentinel is an independent, full-stack vulnerability scanner designed to execute both passive and active heuristic web scans. It provides a robust suite of security testing tools, managed through a modern React frontend and powered by a highly concurrent, asynchronous Python backend.

## 🌐 Live Demo

🔗 **Try Sentinel here:** https://sentinel-iota-seven.vercel.app/

---

## 🚀 Key Features

- **Comprehensive Scanning:** Executes deep scans, port scanning, and SSL configuration checks.
- **Reconnaissance Engine:** Automates information gathering and target profiling.
- **API Fuzzer:** Tests API endpoints for unexpected behaviors and vulnerabilities.
- **Vulnerability Knowledge Base:** Cross-references findings with an internal vulnerability database (`vuln_kb`).
- **Quarantine Management:** Isolates and manages identified threats seamlessly.
- **Automated Reporting:** Generates detailed, actionable security reports.
- **Modern Dashboard:** An interactive, responsive UI to monitor scans, view results, and manage infrastructure in real-time.

---

## 🖥️ Page Overview

Here is a quick breakdown of what you can do on each page of the Sentinel application:

- **Landing / Home:** The welcome screen that introduces Sentinel's features and capabilities.
- **Authentication:** The secure login and registration portal to access your tools.
- **Dashboard:** Your central command center. Get a quick overview of recent scans, active threats, and system metrics.
- **Reconnaissance (Recon):** Gather initial intelligence and footprint a target.
- **Normal Scan:** Run quick, standard vulnerability checks.
- **Deep Scan:** Launch a thorough active heuristic scan to discover hidden vulnerabilities.
- **Infrastructure Scanner:** Analyze the underlying network infrastructure and identify exposed or vulnerable ports.
- **API Fuzzer:** Test API endpoints using malformed or unexpected inputs.
- **SSL Scanner:** Verify TLS/SSL certificates for misconfigurations, weak ciphers, and expirations.
- **Scan Results:** View, filter, and analyze completed scan reports.
- **Quarantine:** Manage identified threats and dismiss false positives.
- **Profile:** Manage your account details and preferences.
- **About:** Learn more about Sentinel, its architecture, and technology stack.

---

## 🛠️ Tech Stack

### Frontend

- React.js (TypeScript)
- Vite
- Tailwind CSS
- Appwrite
- Modular UI Components

### Backend

- Python (Asynchronous)
- Docker
- OWASP ZAP

---

## 📁 Project Structure

```text
Sentinel/
├── backend/
│   ├── api_fuzzer.py
│   ├── deep_scanner.py
│   ├── port_scanner.py
│   ├── recon_engine.py
│   ├── ssl_scanner.py
│   ├── quarantine.py
│   ├── reporter.py
│   ├── server.py
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── lib/
│   │   └── App.tsx
│   ├── tailwind.config.ts
│   └── vite.config.ts
├── main.py
└── victim_app.py
```

---

## ⚙️ Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [Python 3.8+](https://www.python.org/)
- [Docker](https://www.docker.com/) *(Optional but recommended)*

### 1. Frontend Setup

Navigate to the frontend directory and start the development server.

```bash
cd frontend
npm install
npm run dev
```

---

### 2. Backend Setup

Create a virtual environment and install the required dependencies.

```bash
cd backend

python -m venv venv

# Linux / macOS
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

Configure the `.env` file inside the `backend` directory before starting the server.

Run the backend:

```bash
python server.py
```

---

### 3. Docker (Alternative)

Run the backend inside Docker.

```bash
cd backend

docker build -t sentinel-backend .

docker run -p 8000:8000 sentinel-backend
```

---

## 👨‍💻 Author

**Rushat Sharma**  
*Sole Creator & Developer*
