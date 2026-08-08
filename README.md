# 🤖 AI Review Reply (ReplyAI)

> **Automated & Intelligent Review Response SaaS Platform for Mobile App Developers**  
> *Seamlessly connect Google Play Store & Apple App Store reviews with Google Gemini & OpenAI LLMs to automate user feedback management.*

---

![AI Review Reply Banner](assets/banner.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-8E44AD?logo=google&logoColor=white)](https://ai.google.dev/)
[![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)

---

## 🌟 Developer Skills & Highlights

This project serves as a showcase of production-ready full-stack software development skills:

- **⚡ Modern Full-Stack Architecture**: Built with React 19, Vite, Node.js 22, Express 5, and Prisma ORM targeting high performance and maintainability.
- **🧠 Generative AI Integration**: Hands-on integration of LLMs (**Google Gemini 1.5/2.0 Flash** & **OpenAI GPT-4o-mini**), supporting prompt engineering, custom brand tone, and multi-provider fallbacks.
- **🔒 Enterprise Security Engineering**: Implemented field-level **AES-256-GCM encryption** for app store credentials & API keys, **Argon2** password hashing, and stateful JWT authentication.
- **⏱️ Automated Asynchronous Processing**: Architected background workers using `node-cron` to continuously poll store APIs, generate AI replies, and auto-publish responses without blocking main server threads.
- **🎨 Glassmorphism & Modern UI Design**: Designed a sleek, dark-mode dashboard using custom CSS design tokens, smooth micro-interactions, responsive layouts, and intuitive state management.
- **📐 Database Modeling & Optimization**: Structured clean relational data schemas in MySQL using Prisma ORM with indexing, compound unique constraints, and cascade delete rules.

---

## 🚀 Overview & Project Use Case

Managing app store reviews at scale is time-consuming for mobile app developers and support teams. **AI Review Reply** solves this bottleneck by acting as an intelligent middleware between app stores and Generative AI providers.

### Key Use Cases:
1. **Automated Review Handling (AUTO Mode)**: Background cron jobs regularly fetch unhandled reviews from Google Play Store & Apple App Store, feed them into customized AI models, and automatically publish empathetic, professional responses.
2. **Semi-Automated Review Workflow (MANUAL Mode)**: App owners review AI-drafted responses inside an intuitive Inbox dashboard, refine tone if necessary, and publish with a single click.
3. **Brand Tone Customization**: Define per-app instruction prompts (e.g., *"Be warm, apologetic for bugs, offer support email support@app.com, and keep under 50 words"*).
4. **Bring Your Own Key (BYOK) or System Defaults**: Users can supply their own Gemini or OpenAI API keys (securely encrypted) or rely on server-level default keys.

---

## 🛠️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend (React 19 + Vite)"]
        UI["Glassmorphism Dashboard UI"]
        AuthCtx["Auth Context & Router"]
        Inbox["Review Inbox & App Config"]
    end

    subgraph Server ["Backend API (Node.js + Express 5)"]
        Routes["Express Modular Routes"]
        Crypto["AES-256-GCM Encryption"]
        Cron["Node-Cron Background Engine"]
    end

    subgraph AI ["AI Services"]
        Gemini["Google Gemini 1.5/2.0 Flash"]
        OpenAI["OpenAI GPT-4o-mini"]
    end

    subgraph Stores ["App Stores"]
        PlayStore["Google Play Store API"]
        AppStore["Apple App Store Connect API"]
    end

    subgraph DB ["Database (MySQL)"]
        Prisma["Prisma ORM"]
    end

    UI -->|HTTPS / REST| Routes
    Routes -->|Authenticate & Validate| Crypto
    Routes -->|Query / Mutate| Prisma
    Cron -->|Fetch Auto Apps| Prisma
    Cron -->|Scrape / Poll Reviews| Stores
    Cron -->|Generate Response| Gemini
    Cron -->|Generate Response| OpenAI
    Cron -->|Auto Publish Reply| Stores
    Inbox -->|1-Click Manual Reply| Gemini
```

---

## 💻 Tech Stack Breakdown

| Layer | Technology | Usage & Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, React Router 7, Axios | Responsive Single Page Application (SPA) with modular structure |
| **Styling** | Custom Vanilla CSS (Glassmorphism) | Dark theme with CSS variables, smooth transitions & modern layout |
| **Backend** | Node.js 22, Express 5 | RESTful API server with dynamic module loading & global error handling |
| **Database** | MySQL, Prisma ORM 6 | Schema modeling, migrations, type-safe queries, indexed lookups |
| **AI Integration** | `@google/generative-ai`, `openai` | Context-aware AI response generation based on user instructions |
| **Security** | `argon2`, `jsonwebtoken`, `crypto` | AES-256-GCM field encryption for credentials & API keys |
| **Scheduler** | `node-cron` | Asynchronous review scraping and automated reply publishing |

---

## ⚡ Quick Start & Setup Guide

### Prerequisites
- **Node.js**: `v18.x` or higher (`v22.x` recommended)
- **MySQL**: Running MySQL instance (local or hosted)
- **API Keys**: Google Gemini API key or OpenAI API key

---

### 1. Clone & Project Directory
```bash
git clone git@github.com:parthm56/aiReviewReply.git
cd aiReviewReply
```

---

### 2. Backend Setup (`/server`)

```bash
cd server
npm install
```

Create a `.env` file inside the `server/` directory:
```env
PORT=3000
DATABASE_URL="mysql://root:password@localhost:3306/aireviewreply"
JWT_SECRET="your_super_secret_jwt_key_here"
ENCRYPTION_KEY="32_byte_hex_or_string_encryption_key"

# AI Provider Credentials
AI_PROVIDER="GEMINI"
GEMINI_API_KEY="your_google_gemini_api_key"
OPENAI_API_KEY="your_openai_api_key"
```

Initialize the database schema with Prisma:
```bash
npx prisma db push
# Or run migrations
npx prisma migrate dev --name init
```

Start the backend development server:
```bash
npm run dev
```
*Server runs on `http://localhost:3000` and starts the background cron worker.*

---

### 3. Frontend Setup (`/client`)

Open a new terminal tab and navigate to `client/`:
```bash
cd client
npm install
```

Create a `.env` file inside the `client/` directory (optional):
```env
VITE_API_BASE_URL="http://localhost:3000"
```

Start the frontend development server:
```bash
npm run dev
```
*Client application runs on `http://localhost:5173`.*

---

## 📡 API Reference Overview

### Auth Endpoints (`/auth`)
- `POST /auth/register` — Register a new developer account.
- `POST /auth/login` — Authenticate and receive JWT session token.

### App Management (`/apps`)
- `GET /apps` — List all registered mobile applications.
- `POST /apps` — Add new Play Store / App Store application with encrypted credentials.
- `PATCH /apps/:id` — Update prompt instructions or toggle mode (`AUTO` / `MANUAL`).
- `DELETE /apps/:id` — Remove an application and its review history.

### Review Management (`/apps/:id/reviews`)
- `GET /apps/:id/reviews` — Fetch stored reviews with rating filters & publishing status.
- `POST /apps/:id/reviews/fetch` — Manually trigger review fetch from store.
- `POST /apps/:id/reviews/:reviewId/generate` — Generate AI reply draft.
- `POST /apps/:id/reviews/:reviewId/publish` — Publish reply to app store.

### AI Configuration (`/ai-config`)
- `GET /ai-config` — Get user's AI provider settings.
- `PUT /ai-config` — Update AI provider (Gemini / OpenAI) and encrypted custom API key.

---

## 📂 Project Structure

```
aiReviewReply/
├── assets/
│   └── banner.png                # High-res project showcase banner
├── client/                       # React 19 Frontend Application
│   ├── src/
│   │   ├── components/           # Reusable UI components (Modals, Badges, Cards)
│   │   ├── context/              # Auth & Global state context
│   │   ├── layouts/              # Main Dashboard & Auth Layouts
│   │   ├── modules/              # Feature modules (ai-config, apps, auth, dashboard)
│   │   ├── routers/              # Application Routing definitions
│   │   ├── services/             # Axios API Client service methods
│   │   ├── App.jsx               # Root App component
│   │   └── index.css             # Design Tokens & Glassmorphism Global CSS
│   ├── package.json
│   └── vite.config.js
└── server/                       # Node.js + Express 5 Backend API
    ├── prisma/
    │   └── schema.prisma         # Database schema (User, App, Review, UserAiConfig)
    ├── src/
    │   ├── apps/                 # Apps & Reviews Module (Controllers, Routes)
    │   ├── auth/                 # Authentication Module
    │   ├── shared/               # Core Utilities (crypto, AI providers, cron, error handler)
    │   ├── validator/            # Input validation middlewares
    │   ├── modules.config.js     # Modular route auto-loader
    │   └── server.js             # HTTP server entry point
    └── package.json
```

---

## 🛡️ Security Best Practices

- **AES-256-GCM Encryption**: Store authentication credentials (service account JSONs, App Store Connect keys) and custom user API keys are encrypted at rest using AES-256-GCM with unique initialization vectors (IV) and authentication tags.
- **Argon2 Password Hashing**: Passwords are hashed using Argon2id, providing high protection against GPU-accelerated cracking attempts.
- **JWT Authentication**: Stateless, signed JSON Web Tokens for API request authorization.

---

## 👤 Author & Developer

**Parth**  
- GitHub: [@parthm56](https://github.com/parthm56)  
- Project Repository: [parthm56/aiReviewReply](https://github.com/parthm56/aiReviewReply)

---

## 📜 License

This project is released under the [MIT License](LICENSE).
