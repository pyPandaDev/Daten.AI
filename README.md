<<<<<<< HEAD
# 🤖 Daten.AI - AI-Powered Data Analysis Platform

<div align="center">

![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

An **AI-powered data analysis platform** that transforms raw data into actionable insights using **Google Gemini AI**. Upload your dataset, let AI suggest analysis tasks, and watch as beautiful visualizations and reports are generated in real-time.

[Quick Start](#-quick-start) • [Features](#-features) • [Documentation](#-documentation) • [API](#-api-endpoints)

</div>

---

## ✨ Features

### 🎯 Core Capabilities
- **🤖 AI-Powered Analysis** - Google Gemini AI understands your data and suggests 8+ relevant analysis tasks
- **⚡ Real-Time Streaming** - Watch analysis progress with Server-Sent Events (SSE)
- **📊 Comprehensive Analysis** - EDA, data cleaning, visualization, feature engineering, and ML modeling
- **📄 Beautiful Reports** - Export to PDF or CSV with professional formatting
- **🔄 Continuous Workflow** - Execute follow-up analyses based on previous results
- **💬 Interactive Chat** - Ask questions about your data and results with AI assistance

### 🛡️ Production-Ready
- **Thread-Safe Architecture** - Supports unlimited concurrent users
- **Error Boundaries** - Graceful error handling prevents app crashes
- **Smart Polling Fallback** - SSE with intelligent polling backup (80% fewer API calls)
- **File Validation** - 50MB limit with type checking (CSV, Excel, JSON)
- **Auto-Retry Logic** - Network failures automatically retry 3x
- **Memory Management** - Automatic cleanup after 1 hour, zero memory leaks

### 🎨 Modern Tech Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Zustand
- **Backend**: FastAPI + Python 3.9+ + Google Gemini AI
- **Data Science**: Pandas, NumPy, Matplotlib, Seaborn, Scikit-learn
- **Real-Time**: Server-Sent Events (SSE) for streaming updates

## 🏗️ Architecture

### Frontend (React + Vite)
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for modern, responsive styling
- **Lucide React** for beautiful icons
- **Axios** for API communication
- **React Dropzone** for drag-and-drop file uploads
- **Server-Sent Events** for real-time updates

### Backend (FastAPI)
- **FastAPI** for high-performance async API
- **Google Gemini AI** for intelligent task planning and code generation
- **Pandas, NumPy, Matplotlib, Seaborn, Scikit-learn** for data analysis
- **ReportLab** for PDF generation
- **Server-Sent Events** for streaming execution progress

## 📋 Prerequisites

Before you begin, ensure you have:

| Requirement | Version | Download |
|-------------|---------|----------|
| **Python** | 3.9 or higher | [python.org](https://www.python.org/downloads/) |
| **Node.js** | 18 or higher | [nodejs.org](https://nodejs.org/) |
| **Google Gemini API Key** | - | [Get API Key](https://makersuite.google.com/app/apikey) |

> **Note**: The API key is **required** for AI-powered analysis. Free tier available with generous limits.

## 🚀 Quick Start

### One-Command Startup (Windows)

```bash
# Navigate to project directory
cd "C:\project\data science"

# Run the automated startup script
start.bat
```

The script will:
1. ✅ Check Python and Node.js installation
2. ✅ Create virtual environment (if needed)
3. ✅ Install all dependencies
4. ✅ Start backend server (http://localhost:8000)
5. ✅ Start frontend dev server (http://localhost:5173)
6. ✅ Open browser automatically

---

### Manual Setup (All Platforms)

#### 1️⃣ Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### 2️⃣ Configure Environment

```bash
# Copy environment template
cp .env.example .env  # Mac/Linux
copy .env.example .env  # Windows
```

**Edit `.env` and add your credentials:**

```env
# REQUIRED: Get from https://makersuite.google.com/app/apikey
GEMINI_API_KEY=AIzaSy..._your_actual_key_here

# OPTIONAL: Advanced Configuration
GEMINI_MODEL=gemini-1.5-flash
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
CORS_ORIGINS=http://localhost:5173
MAX_FILE_SIZE_MB=50
EXECUTION_TIMEOUT_SECONDS=300
```

> ⚠️ **Security**: Never commit `.env` to version control!

#### 3️⃣ Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# (Optional) Create frontend env for custom API URL
echo "VITE_API_URL=http://localhost:8000/api" > .env.local
```

#### 4️⃣ Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate  # Windows
python -m uvicorn app.main:app --reload
```
✅ Backend: http://localhost:8000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
✅ Frontend: http://localhost:5173

**Terminal 3 - Health Check (Optional):**
```bash
curl http://localhost:8000/health
```

---

### 🎉 You're Ready!

Open your browser to **http://localhost:5173** and start analyzing!

---

## 📖 Usage Guide

### 1️⃣ Upload Your Dataset

**Supported Formats:**
- 📄 CSV (`.csv`)
- 📊 Excel (`.xlsx`, `.xls`)
- 📋 JSON (`.json`)
- 📦 Parquet (`.parquet`)

**Limits:**
- Maximum file size: **50 MB**
- Validation: Automatic file type and size checking
- Storage: In-memory with 1-hour auto-cleanup

**How:**
1. Drag & drop your file OR click to browse
2. (Optional) Describe your goal: "Predict sales", "Find outliers", etc.
3. Click "Upload" and watch AI analyze your data

### 2️⃣ Get AI-Powered Suggestions

**What Happens:**
- 🤖 AI analyzes your dataset schema, types, and patterns
- 📋 Suggests 8+ relevant tasks across categories:
  - **EDA**: Statistical summary, outlier detection, distributions
  - **Cleaning**: Missing values, duplicates, data types
  - **Visualization**: Plots, heatmaps, correlations
  - **Feature Engineering**: Date features, interactions, aggregations
  - **Modeling**: Regression, classification, clustering
  - **Statistical Testing**: Hypothesis tests, significance

**Task Information:**
- ✅ Task title and description
- ⏱️ Estimated execution time
- 🎯 Priority level (High/Medium/Low)
- 📊 Category badge

### 3️⃣ Execute Analysis

**Execution Flow:**
1. **Select Task** - Click any suggested task
2. **Review Details** - See description, time estimate, priority
3. **Run Analysis** - Click "Run Analysis" button
4. **Watch Live** - Real-time streaming shows:
   - 📝 Planning phase
   - 💻 Code generation
   - ⚡ Execution progress
   - 📊 Results streaming

**Behind the Scenes:**
- AI generates Python code tailored to YOUR data
- Code executes in isolated environment
- Results parse in real-time (SSE)
- Smart fallback if SSE fails
- Auto-retry on errors (up to 2 attempts)

### 4️⃣ Review Results

**Results Dashboard Includes:**

| Section | What You Get |
|---------|-------------|
| 📋 **Executive Summary** | AI-generated insights and key findings |
| 📝 **Analysis Plan** | Step-by-step breakdown of execution |
| 📊 **Visualizations** | Interactive charts, plots, heatmaps |
| 📑 **Tables** | Summary statistics, data samples |
| 📈 **Metrics** | KPIs, performance indicators |
| 💻 **Python Code** | Full generated code (expandable) |
| 🔄 **Follow-ups** | AI suggests next analysis steps |
| 💬 **Results Chat** | Ask questions about the results |

**Interactive Features:**
- Expand/collapse code sections
- Download visualizations as PNG
- Copy code to clipboard
- Ask AI questions about results
- Execute follow-up analyses

### 5️⃣ Export & Share

**Export Options:**

| Format | What's Included | Use Case |
|--------|-----------------|----------|
| 📄 **PDF Report** | Summary, plots, code, metrics | Share with stakeholders |
| 📊 **CSV Data** | Processed/cleaned dataset | Further analysis |
| 💻 **Code** | Python code (copy-paste) | Reproduce analysis |

**How to Export:**
1. Click **Export** button in results header
2. Choose format (PDF or CSV)
3. File downloads automatically
4. Named with timestamp for easy tracking

---

## 🎯 Example Use Cases

### Exploratory Data Analysis
```
Upload: sales_data.csv
Goal: "Understand sales patterns and trends"
Results: Distribution plots, correlation heatmaps, time series analysis
```

### Missing Data Analysis
```
Upload: customer_data.xlsx
Task: "Analyze Missing Data"
Results: Missing value heatmap, percentage by column, suggestions for imputation
```

### Predictive Modeling
```
Upload: housing_prices.csv
Goal: "Predict house prices"
Results: Feature importance, model performance metrics, prediction accuracy
```

### Outlier Detection
```
Upload: sensor_readings.json
Task: "Identify Outliers"
Results: Box plots, Z-score analysis, flagged anomalies
```

## 🔌 API Endpoints

### Upload Dataset
```http
POST /api/upload
Content-Type: multipart/form-data
```

### Get Task Suggestions
```http
POST /api/suggest
Content-Type: application/json

{
  "file_id": "uuid",
  "dataset_schema": {...},
  "user_goal": "optional goal description"
}
```

### Run Analysis Task
```http
POST /api/run
Content-Type: application/json

{
  "file_id": "uuid",
  "task_id": "task_id",
  "task_title": "Task Title",
  "dataset_schema": {...},
  "parameters": {}
}
```

### Stream Execution Events
```http
GET /api/stream/{task_execution_id}
Accept: text/event-stream
```

### Export to PDF
```http
POST /api/export/pdf
Content-Type: application/json

{
  "task_execution_id": "uuid",
  "export_type": "pdf"
}
```

### Export to CSV
```http
POST /api/export/csv
Content-Type: application/json

{
  "task_execution_id": "uuid",
  "export_type": "csv"
}
```

## 📁 Project Structure

```
project/
├── frontend/                     # React + Vite frontend
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── FileUploader.tsx
│   │   │   ├── TaskSuggestions.tsx
│   │   │   ├── ChatPanel.tsx
│   │   │   ├── ResultViewer.tsx
│   │   │   └── ExportPanel.tsx
│   │   ├── services/
│   │   │   └── api.ts            # API client
│   │   ├── hooks/
│   │   │   └── useStream.ts      # SSE hook
│   │   ├── App.tsx               # Main app component
│   │   ├── main.tsx              # Entry point
│   │   └── index.css             # Global styles
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/                      # FastAPI backend
│   ├── app/
│   │   ├── main.py               # FastAPI app
│   │   ├── routers/              # API routes
│   │   │   ├── upload.py
│   │   │   ├── suggest.py
│   │   │   ├── run.py
│   │   │   ├── stream.py
│   │   │   └── export.py
│   │   ├── services/             # Business logic
│   │   │   ├── gemini_client.py  # Gemini AI integration
│   │   │   ├── code_executor.py  # Safe code execution
│   │   │   ├── planner.py        # Dataset analysis
│   │   │   ├── pdf_service.py    # PDF generation
│   │   │   └── storage.py        # In-memory storage
│   │   ├── models/
│   │   │   └── schemas.py        # Pydantic models
│   │   └── utils/
│   │       └── streaming.py      # SSE utilities
│   └── requirements.txt
│
├── .env.example                  # Environment template
├── .gitignore
└── README.md
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | Required |
| `GEMINI_MODEL` | Gemini model to use | `gemini-1.5-flash` |
| `BACKEND_HOST` | Backend server host | `0.0.0.0` |
| `BACKEND_PORT` | Backend server port | `8000` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:5173` |
| `MAX_FILE_SIZE_MB` | Max upload file size | `50` |
| `EXECUTION_TIMEOUT_SECONDS` | Code execution timeout | `300` |

### Frontend Configuration

Create `frontend/.env.local` for custom API URL:

```env
VITE_API_URL=http://localhost:8000/api
```

## 🛡️ Security Considerations

- Dataset files are stored in memory and automatically cleaned after 1 hour
- Code execution is sandboxed and doesn't allow file system writes or network calls
- All user inputs are validated and sanitized
- API rate limiting should be configured for production use
- CORS is properly configured to allow only specified origins

## 🚀 Deployment

### Backend Deployment

The backend can be deployed to platforms like:
- **Heroku**: Use the included `Procfile`
- **Railway**: Direct Python app deployment
- **Google Cloud Run**: Containerize with Docker
- **AWS Lambda**: Use Mangum adapter for FastAPI

### Frontend Deployment

The frontend can be deployed to:
- **Vercel**: Automatic deployment from Git
- **Netlify**: Connect your repository
- **GitHub Pages**: Build and deploy static files
- **Cloudflare Pages**: Fast global CDN

## 🐛 Troubleshooting

### Backend Issues

**ModuleNotFoundError**
```bash
# Ensure virtual environment is activated
pip install -r requirements.txt
```

**Gemini API Error**
```bash
# Check API key is correct in .env file
# Verify API key has proper permissions
```

### Frontend Issues

**Module not found**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

**CORS Error**
```bash
# Check CORS_ORIGINS in .env includes your frontend URL
```

## 📝 Development

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Code Formatting

```bash
# Backend
black app/
isort app/

# Frontend
npm run lint
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for any purpose.

## 🙏 Acknowledgments

- **Google Gemini AI** for powering intelligent analysis
- **FastAPI** for the excellent web framework
- **React** and **Vite** for modern frontend development
- **Tailwind CSS** for beautiful styling
- All the amazing open-source data science libraries

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review example use cases

---

**Built with ❤️ using AI-powered development tools**
=======
# Daten.AI
>>>>>>> fd3d894143c6adefdefa0d0c90de6f00de35b18f
