# 🚀 Creatify – Creator Marketplace + AI Agent

**Live at:** http://localhost:3000

---

## 📸 Screenshots

````carousel
![Landing Page](/Users/aareen_dakway/.gemini/antigravity/brain/d84bcbe3-bf4f-443f-911e-8d13d9f35ff2/landing_page_1776449421200.png)
<!-- slide -->
![AI Agent Page](/Users/aareen_dakway/.gemini/antigravity/brain/d84bcbe3-bf4f-443f-911e-8d13d9f35ff2/ai_agent_page_1776449466989.png)
<!-- slide -->
![My Gigs](/Users/aareen_dakway/.gemini/antigravity/brain/d84bcbe3-bf4f-443f-911e-8d13d9f35ff2/gigs_page_1776449486743.png)
<!-- slide -->
![Profile Page](/Users/aareen_dakway/.gemini/antigravity/brain/d84bcbe3-bf4f-443f-911e-8d13d9f35ff2/profile_page_1776449507470.png)
````

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Creator | `creator@demo.com` | `demo123` |
| Client | `client@demo.com` | `demo123` |

---

## 🗂️ Project Structure

```
src/
├── app/
│   ├── page.tsx                   # Landing page (auto-redirects if logged in)
│   ├── login/page.tsx             # Login with demo buttons
│   ├── signup/page.tsx            # Multi-step signup (role + niche)
│   ├── forgot-password/page.tsx   # Password reset
│   └── dashboard/
│       ├── layout.tsx             # Auth guard + sidebar layout
│       ├── page.tsx               # Dashboard overview
│       ├── ai-agent/page.tsx      # 🤖 AI Agent (chat + audit + strategy)
│       ├── gigs/page.tsx          # Gig management + AI optimize
│       ├── orders/page.tsx        # Order tracking
│       ├── analytics/page.tsx     # Performance analytics
│       └── profile/page.tsx       # Profile editor
├── components/
│   ├── Sidebar.tsx                # Navigation sidebar
│   └── LandingPage.tsx            # Full landing page
└── lib/
    ├── store.ts                   # Zustand global state (persisted)
    └── ai.ts                      # OpenAI API calls + mock responses
```

---

## ✅ Implemented Features

### 🔐 Authentication
- [x] Signup (email + password, role selection, niche picker)
- [x] Login with demo shortcuts
- [x] Logout
- [x] Forgot password page
- [x] Auth guard on dashboard routes
- [x] Zustand persisted state (localStorage)

### 👤 User Roles
- [x] **Creator** – full dashboard with gigs, analytics, AI agent
- [x] **Client** – browse services, track orders

### 📊 Creator Profile
- [x] Display name, username, bio, niche
- [x] Skills with proficiency levels (beginner/intermediate/expert)
- [x] Portfolio (links with descriptions)
- [x] Social media links (YouTube, Instagram, TikTok, Twitter)
- [x] Analytics input (followers, engagement rate per platform)
- [x] Profile score (0-100%)

### 🤖 AI Agent (Core Feature)
- [x] **AI Chat** – ChatGPT-style conversation with CreatorAI
  - Starter prompts for quick engagement
  - Clear chat / reset
  - Streaming loading indicator
- [x] **Profile Audit** – Animated score circle, strengths/weaknesses, collapsible suggestions
- [x] **Content Strategy** – Weekly content plan, hooks, titles, platform strategies, growth tips, trending topics
- [x] **Gig Optimization** – AI title suggestions, pricing insights, tag recommendations
- [x] Demo mode with rich mock responses (no API key needed)
- [x] OpenAI API key modal (stored locally, never sent to server)
- [x] Rate limiting

### 📦 Gigs
- [x] Create / edit / delete gigs with modal
- [x] 3-tier package system (Basic / Standard / Premium)
- [x] Tags system with keyboard input
- [x] Status management (active / paused / draft)
- [x] AI Optimize button per gig

### 🛒 Orders
- [x] Filter by status (all/pending/in_progress/delivered/completed)
- [x] Search by gig title
- [x] Mark Delivered / Mark Complete actions
- [x] Order status with color-coded badges

### 📈 Analytics
- [x] Revenue bar chart (simulated monthly data)
- [x] Gig performance with progress bars
- [x] Social media analytics display
- [x] Profile completeness breakdown

---

## 🎨 Design System

- **Theme**: Deep dark (#0a0a0f) with glass-morphism cards
- **Colors**: Purple (#7c3aed), Pink (#ec4899), Cyan (#06b6d4), Emerald (#10b981), Amber (#f59e0b)
- **Typography**: Inter font from Google Fonts
- **Effects**: Gradient text, floating orbs, animated score circles, pulse-glow buttons
- **Components**: `.glass-card`, `.btn-primary`, `.btn-secondary`, `.input-field`, `.badge`, `.sidebar-item`, `.tag`, modal overlays, skeleton loading

---

## 🧠 AI Integration

The AI layer ([src/lib/ai.ts](file:///Users/aareen_dakway/.gemini/antigravity/scratch/src/lib/ai.ts)) supports:

| Function | Purpose |
|----------|---------|
| [auditProfile()](file:///Users/aareen_dakway/.gemini/antigravity/scratch/src/lib/ai.ts#61-106) | GPT-4o-mini profile score + suggestions |
| [generateContentStrategy()](file:///Users/aareen_dakway/.gemini/antigravity/scratch/src/lib/ai.ts#107-153) | Weekly plans, hooks, titles, growth tips |
| [optimizeGig()](file:///Users/aareen_dakway/.gemini/antigravity/scratch/src/lib/ai.ts#154-199) | Better titles, tags, pricing for a gig |
| [chatWithAI()](file:///Users/aareen_dakway/.gemini/antigravity/scratch/src/lib/ai.ts#200-241) | Context-aware conversation |
| [getMockAudit()](file:///Users/aareen_dakway/.gemini/antigravity/scratch/src/lib/ai.ts#242-279) | Rich demo response (no API key) |
| [getMockStrategy()](file:///Users/aareen_dakway/.gemini/antigravity/scratch/src/lib/ai.ts#280-340) | Full demo content strategy |

> **To enable live AI:** Click "Add API Key" on the AI Agent page and paste your OpenAI key.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Vanilla CSS + Tailwind CSS |
| State | Zustand with `persist` middleware |
| AI | OpenAI `gpt-4o-mini` API |
| Icons | Lucide React |
| Notifications | react-hot-toast |
| Animations | CSS keyframes |
