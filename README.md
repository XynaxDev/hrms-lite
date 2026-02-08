<div align="center">

# `👨‍💼 HRMS Lite | Enterprise Intelligent Workforce Management`
![landing](./frontend/public/landing.png)

![Status](https://img.shields.io/badge/Status-Live-brightgreen)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Railway](https://img.shields.io/badge/Railway-0B0D0E?logo=railway&logoColor=white)](https://railway.app/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)
[![OpenRouter](https://img.shields.io/badge/AI-OpenRouter-8A2BE2)](https://openrouter.ai/)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00)](https://www.sqlalchemy.org/)
[![LangChain](https://img.shields.io/badge/langchain-🦜-00ADD8)](https://www.langchain.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?logo=framer&logoColor=white)](https://www.framer.com/motion/)

**A state-of-the-art, full-stack Human Resource Management System designed for modern, high-growth teams**

[Live Demo](https://hrms-lite-iota-woad.vercel.app/) • 
[Documentation](https://github.com/XynaxDev/hrms-lite#readme) • 
[Report Bug](https://github.com/XynaxDev/hrms-lite/issues/new?labels=bug) • 
[Request Feature](https://github.com/XynaxDev/hrms-lite/issues/new?labels=enhancement)


</div>

### `📑 Table of Contents`

- [Overview](#-overview)
- [Tech Stack](#️-tech-stack)
- [Core Features](#-core-features)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Getting Started](#-getting-started)
- [Production Deployment](#-production-deployment)
- [Limitations & Assumptions](#️-current-limitations--assumptions)
- [Contributing](#-contributing)
- [License](#-license)

### `📚 Modular Documentation`

- Backend: [`backend/README.md`](./backend/README.md)
- Frontend: [`frontend/README.md`](./frontend/README.md)

### `🎯 Overview`

HRMS Lite combines a premium React-based user interface with a FastAPI backend and intelligent data querying powered by **OpenRouter AI**. It's built for modern HR teams who need powerful insights without the complexity of traditional enterprise solutions.

### Key Highlights

- 🤖 **AI-Powered Insights** - Natural language queries for workforce analytics
- ⚡ **Lightning Fast** - Built with modern tech stack for optimal performance
- 🎨 **Beautiful UI** - Executive-grade design with smooth animations
- 🔒 **Production Ready** - Deployed on Railway (backend) and Vercel (frontend)
- 📊 **Data-Driven** - Real-time analytics and actionable insights

### Stats & Metrics

<div align="center">

![GitHub stars](https://img.shields.io/github/stars/XynaxDev/hrms-lite?style=social)
![GitHub forks](https://img.shields.io/github/forks/XynaxDev/hrms-lite?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/XynaxDev/hrms-lite?style=social)
![GitHub contributors](https://img.shields.io/github/contributors/XynaxDev/hrms-lite)
![GitHub last commit](https://img.shields.io/github/last-commit/XynaxDev/hrms-lite)
![GitHub repo size](https://img.shields.io/github/repo-size/XynaxDev/hrms-lite)

</div>

### `⚡ Quick Start`

Get up and running in 5 minutes:

```bash
# Clone the repository
git clone https://github.com/XynaxDev/hrms-lite.git
cd hrms-lite

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env  # Configure your environment variables
uvicorn app.main:app --reload

# Frontend setup (in a new terminal)
cd frontend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev
```

Visit `http://localhost:5173` and you're ready to go! 🚀

</div>

### `🛠️ Tech Stack`

**Frontend**
- ⚛️ **React 18** + **TypeScript** - Modern UI framework with type safety
- ⚡ **Vite** - Lightning-fast build tool and dev server
- 🎨 **Tailwind CSS** - Utility-first styling with executive aesthetic
- 🎭 **Framer Motion** - Smooth animations and transitions

**Backend**
- 🚀 **FastAPI** (Python 3.12+) - High-performance async API framework
- 🔗 **SQLAlchemy 2.0** - Powerful Python ORM
- 🤖 **LangChain** - AI orchestration framework
- 🧠 **OpenRouter** - Multi-model AI intelligence layer

**Infrastructure**
- 🗄️ **PostgreSQL** (via Supabase) - Robust relational database
- 🚂 **Railway** - Backend deployment platform
- ▲ **Vercel** - Frontend hosting with edge network

### `✨ Core Features`

### 🤖 Intelligent HR Assistant
Production-ready conversational UI powered by OpenRouter AI that understands natural language queries about your workforce.

- 💬 Chat-based interface with persistent history
- 📊 Executive summaries and actionable insights
- 🔍 Natural language queries over employees, attendance, and metrics
- 📈 Leave trends analysis and headcount signals
- 🛡️ Network-hardened with timeout protection and error handling

### 👥 Employee Management
Complete CRUD operations for your workforce with intuitive filtering and search.

- ➕ Add, edit, and delete employee records
- 🏢 Department-based organization
- 🔄 Status management and filtering
- 📤 Bulk operations support
- 🔎 Advanced search and filtering

### 📊 Attendance Tracking
Streamlined attendance management with historical data and analytics.

- ✅ Quick daily attendance marking
- ✏️ Edit existing attendance entries
- 💾 Persistent database storage
- 📥 CSV export functionality
- 📈 Analytics dashboard with insights

### 🎨 Modern UI/UX
Beautiful, responsive interface built with modern design principles.

- 🪟 Glassy navbar with smooth transitions
- 📱 Fully responsive layout (mobile, tablet, desktop)
- ✨ Framer Motion animations
- 🌙 Clean, executive aesthetic
- ⚡ Fast and intuitive navigation 

### 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python** 3.12 or higher - [Download](https://www.python.org/downloads/)
- **Node.js** 18 or higher - [Download](https://nodejs.org/)
- **PostgreSQL** - Local installation or [Supabase](https://supabase.com/) account
- **Git** - [Download](https://git-scm.com/)

> **💡 Quick Check:** Run `python --version`, `node --version`, and `git --version` to verify installations

### `🚀 Getting Started`

### Step 1: Clone the Repository

```bash
git clone https://github.com/XynaxDev/hrms-lite.git
cd hrms-lite
```

### Step 2: Backend Setup (FastAPI)

#### Navigate to Backend Directory

```bash
cd backend
```

#### Create Virtual Environment

```bash
python -m venv venv
```

#### Activate Virtual Environment

**Windows (PowerShell)**
```powershell
venv\Scripts\Activate.ps1
```

**macOS/Linux**
```bash
source venv/bin/activate
```

#### Install Dependencies

```bash
pip install -r requirements.txt
```

#### Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME
OPENROUTER_API_KEY=YOUR_OPENROUTER_KEY
SECRET_KEY=CHANGE_ME_TO_A_LONG_RANDOM_STRING
OPENROUTER_MODEL=arcee-ai/trinity-large-preview:free
DEBUG=true
API_KEY=CHANGE_ME_MATCHES_FRONTEND
```

> **⚠️ Important:** Never commit `.env` files to version control

#### Start the Backend Server

```bash
uvicorn app.main:app --reload
```

✅ **Backend is now running at:**
- API: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`

### Step 3: Frontend Setup (React + Vite)

#### Navigate to Frontend Directory

```bash
cd ../frontend
```

#### Install Dependencies

```bash
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_API_KEY=CHANGE_ME_MATCHES_BACKEND
```

> **📝 Note:** The `VITE_API_KEY` must match the backend `API_KEY`

#### Start the Development Server

```bash
npm run dev
```

✅ **Frontend is now running at:** `http://localhost:5173`

### `🌐 Production Deployment`

### Backend Deployment on Railway

**1. Push to GitHub**
```bash
git push -u origin main
```

**2. Create Railway Project**
- Go to [Railway](https://railway.app/) and create a new project
- Connect your GitHub repository

**3. Configure Service**
- **Root Directory:** `backend`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**4. Set Environment Variables**
```env
DATABASE_URL=<your-supabase-connection-string>
OPENROUTER_API_KEY=<your-openrouter-key>
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
ALLOWED_ORIGINS=https://<your-vercel-app>.vercel.app
API_KEY=<must-match-frontend-key>
```

**5. Deploy & Copy URL**

### Frontend Deployment on Vercel

**1. Create Vercel Project**
- Go to [Vercel](https://vercel.com/) and import your repository

**2. Configure Project**
- **Framework Preset:** Vite
- **Root Directory:** `frontend`

**3. Set Environment Variables**
```env
VITE_API_URL=https://<your-railway-backend>/api/v1
VITE_API_KEY=<must-match-backend-key>
```

> **🔑 Important:** The `VITE_API_KEY` must match your backend `API_KEY`

**4. Deploy**

## 🔧 Environment Variables Reference

### Backend (.env)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes | `postgresql://user:pass@host:5432/db` |
| `OPENROUTER_API_KEY` | OpenRouter API key for AI | ✅ Yes | `sk-or-v1-...` |
| `SECRET_KEY` | Secret key for security | ✅ Yes | `your-secret-key-here` |
| `API_KEY` | API key for frontend auth | ✅ Yes | `your-api-key` |
| `OPENROUTER_MODEL` | AI model to use | ❌ No | `arcee-ai/trinity-large-preview:free` |
| `DEBUG` | Enable debug mode | ❌ No | `true` |
| `DEMO_ISOLATION_ENABLED` | Enable device isolation | ❌ No | `true` |
| `DEMO_ISOLATION_MODE` | Isolation mode | ❌ No | `device` or `ip` |

### Frontend (.env)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API base URL | ✅ Yes | `http://localhost:8000/api/v1` |
| `VITE_API_KEY` | API key (matches backend) | ✅ Yes | `your-api-key` |

### `🐛 Troubleshooting`

### Common Issues

**Issue: Backend won't start**
```bash
# Solution: Check if port 8000 is already in use
lsof -ti:8000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :8000    # Windows
```

**Issue: Frontend can't connect to backend**
- Verify `VITE_API_URL` in frontend `.env` matches your backend URL
- Check if backend is running: `curl http://localhost:8000/health`
- Ensure `VITE_API_KEY` matches backend `API_KEY`

**Issue: Database connection error**
- Verify `DATABASE_URL` format is correct
- Check Supabase instance is running
- Ensure IP is whitelisted in Supabase dashboard

**Issue: AI queries not working**
- Verify `OPENROUTER_API_KEY` is valid
- Check you have credits in OpenRouter account
- Ensure `OPENROUTER_BASE_URL` is set correctly

**Issue: CORS errors**
- Add your frontend URL to `ALLOWED_ORIGINS` in backend `.env`
- Clear browser cache and cookies
- Check browser console for specific CORS errors

### `⚠️ Current Limitations & Assumptions`

### Demo Mode Constraints

**Authentication & Access**
- ❌ No user authentication system - uses device isolation instead
- ❌ Data scoped per device/browser session via `X-Device-Id` header
- ❌ Not suitable for production multi-user environments

**Architecture**
- ❌ Single-tenant design - one organization only
- ❌ No multi-company data separation
- ❌ Basic role management - all users have full access
- ❌ Limited audit trail and compliance logging

### Assumptions

This project is built with the following assumptions:

- 🎯 Demo environment with trusted users
- 👥 Small to medium team size (< 500 employees)
- 🌍 Single geographic region (no timezone complexity)
- 📋 Basic HR workflows without complex compliance requirements

### Production Migration Path

For production deployment, you'll need to implement:

1. **Authentication System** - JWT/OAuth with secure session management
2. **Multi-tenancy** - Company-based data isolation with RLS
3. **RBAC** - Role-based permissions (Admin, Manager, Employee)
4. **Audit Logging** - Comprehensive compliance and change tracking
5. **Advanced Features** - Timezone support, complex workflows, reporting

### `❓ FAQ`

<details>
<summary><b>Is this production-ready?</b></summary>
<br>
The application is production-ready in terms of architecture and code quality. However, it lacks authentication and is designed for demo/MVP use. For production, you'll need to implement proper authentication, RBAC, and multi-tenancy.
</details>

<details>
<summary><b>Can I use this for my company?</b></summary>
<br>
Yes! HRMS Lite is MIT licensed. You can use, modify, and deploy it for commercial purposes. Just remember to add authentication for production use.
</details>

<details>
<summary><b>How do I add new features?</b></summary>
<br>
The codebase is well-structured and easy to extend. Check out the <a href="#-contributing">Contributing</a> section for guidelines. The backend uses FastAPI and the frontend uses React - both have extensive documentation.
</details>

<details>
<summary><b>What AI models are supported?</b></summary>
<br>
HRMS Lite uses OpenRouter, which supports multiple AI models. The default is <code>arcee-ai/trinity-large-preview:free</code>, but you can configure any OpenRouter-supported model via the <code>OPENROUTER_MODEL</code> environment variable.
</details>

<details>
<summary><b>How much does it cost to run?</b></summary>
<br>
- <b>Frontend (Vercel):</b> Free tier available
- <b>Backend (Railway):</b> ~$5-20/month depending on usage
- <b>Database (Supabase):</b> Free tier available (500MB)
- <b>AI (OpenRouter):</b> Pay-per-use, ~$0.10-0.50 per day for normal usage
</details>

<details>
<summary><b>Can I self-host everything?</b></summary>
<br>
Absolutely! You can host the backend on any VPS, use a self-hosted PostgreSQL instance, and deploy the frontend on any static hosting service. The only external dependency is OpenRouter for AI features.
</details>

<details>
<summary><b>Does it support multiple companies/tenants?</b></summary>
<br>
Not yet. The current version is single-tenant. Multi-tenancy is in progress.
</details>

### `🧪 Testing & Quality`

### Frontend Build Check

```bash
cd frontend
npm run build
```

### Backend Syntax Check

```bash
python -m compileall backend/app
```

### `🤝 Contributing`
We love contributions! Whether it's bug fixes, feature additions, or documentation improvements - all PRs are welcome.

### How to Contribute

1. **Fork the repository**
2. **Create your feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and conventions
- Write clear commit messages
- Add tests for new features
- Update documentation as needed

### `📄 License`

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

### `🙏 Acknowledgments`

- [FastAPI](https://fastapi.tiangolo.com/) - Amazing Python web framework
- [React](https://react.dev/) - The library for web and native user interfaces
- [OpenRouter](https://openrouter.ai/) - AI model routing and orchestration
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [Railway](https://railway.app/) & [Vercel](https://vercel.com/) - Deployment platforms
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

### `📞 Support & Contact`
Having trouble? We're here to help!

- 🐛 **Bug Reports:** [Open an issue](https://github.com/XynaxDev/hrms-lite/issues)
- 💡 **Feature Requests:** [Start a discussion](https://github.com/XynaxDev/hrms-lite/discussions)
- 📧 **Email:** akashkumar.cs27@gmail.com
- 💬 **Discussions:** [GitHub Discussions](https://github.com/XynaxDev/hrms-lite/discussions)


If you find this project useful, please consider:


<div align="center">

### `👨‍💻 Author`

**Built with ❤️ by Akash**

Making HR management intelligent and effortless for modern teams.

If you find HRMS Lite useful, please consider supporting it:

</div>
<div align="center">

**⭐ Star this repo** • **🔀 Fork and contribute** • **📢 Share with others**

</div>

<!-- ## 🌟 Stargazers

<div align="center">

[![Stargazers repo roster for @XynaxDev/hrms-lite](https://reporoster.com/stars/XynaxDev/hrms-lite)](https://github.com/XynaxDev/hrms-lite/stargazers)

</div> -->

<div align="center">

**[⬆ Back to Top](#-hrms-lite--enterprise-intelligent-workforce-management)**

Made with ❤️ using React, FastAPI, and AI • © 2026 Akash

![Visitor Count](https://visitor-badge.laobi.icu/badge?page_id=XynaxDev.hrms-lite)
[![Star on GitHub](https://img.shields.io/github/stars/XynaxDev/hrms-lite?style=social)](https://github.com/XynaxDev/hrms-lite)
![GitHub Repo Size](https://img.shields.io/github/repo-size/XynaxDev/hrms-lite)
<!-- ![Lines of Code](https://img.shields.io/tokei/lines/github/XynaxDev/hrms-lite) -->

</div>