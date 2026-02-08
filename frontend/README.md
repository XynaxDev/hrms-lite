# HRMS Lite - Intelligence Frontend

The premium React-based interface for HRMS Lite.

## 🎨 Design Philosophy
- **Executive Aesthetics**: Clean, high-contrast UI using Tailwind CSS.
- **Fluid Motion**: Premium animations using Framer Motion.
- **Component-Driven**: Reusable, atomic components for scalability.

## 🛠️ Setup & Running

1. **Install**: `npm install`
2. **Environment**: Create `.env` based on `.env.example`
3. **Run**: `npm run dev`

## 📦 Deployment
Ready for **Vercel** or **Netlify**.

## 🚀 Detailed Frontend Setup (from root README)

### Prerequisites

- **Node.js** 18 or higher

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_API_KEY=CHANGE_ME_MATCHES_BACKEND
```

### Run

```bash
npm run dev
```

✅ Frontend is now running at: `http://localhost:5173`

## 🌐 Production Deployment Notes (from root README)

### Vercel (example)

- **Framework Preset:** Vite
- **Root Directory:** `frontend`

Environment variables example:

```env
VITE_API_URL=https://<your-railway-backend>/api/v1
VITE_API_KEY=<must-match-backend-key>
```
