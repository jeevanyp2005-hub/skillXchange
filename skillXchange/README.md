# SkillXChange

A **Skill Exchange Platform** where users can offer skills they know and request skills they want to learn — connecting people for peer-to-peer learning.

Built with **React (Vite) + Tailwind CSS + React Router + Supabase**.

---

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or later
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
copy .env.example .env.local
```
Edit `.env.local` and fill in your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Initialize the database
1. Go to your [Supabase project](https://supabase.com/dashboard)
2. Open **SQL Editor**
3. Paste and run the entire contents of [`supabase_schema.sql`](./supabase_schema.sql)

This creates:
- `profiles` table — user profiles with social links
- `skills` table — offered and wanted skills
- `exchange_requests` table — skill exchange workflow
- Row Level Security policies
- Auto-create profile trigger on signup

### 4. Start the dev server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Features

| Feature | Details |
|---|---|
| **Authentication** | Supabase Auth — email/password, protected routes |
| **Profile** | Name, bio, location, GitHub (required), LinkedIn (required), website, Twitter |
| **Skills** | Add/remove offered & wanted skills with categories |
| **Browse** | Search users by name/location/bio with live debounced search |
| **Exchange Requests** | Send, accept, decline, complete — full status workflow |
| **Dashboard** | Profile summary, stats, skills overview, pending requests |
| **Responsive** | Mobile-first, works on all screen sizes |

## Project Structure

```
src/
  components/
    EmptyState.jsx
    LoadingSpinner.jsx
    Navbar.jsx
    ProfileCard.jsx
    ProtectedRoute.jsx
    RequestCard.jsx
    SkillBadge.jsx
  hooks/
    useAuth.jsx        # Auth context + session management
    useProfile.js      # Profile fetch hook
  lib/
    supabaseClient.js  # Supabase singleton
  pages/
    Browse.jsx
    Dashboard.jsx
    Login.jsx
    Profile.jsx
    Register.jsx
    Requests.jsx
    UserProfile.jsx
  services/
    exchangeService.js
    profileService.js
    skillsService.js
  App.jsx              # Routes + providers
  main.jsx             # Entry point
  index.css            # Tailwind + design system
supabase_schema.sql    # Database schema + RLS
```

## Tech Stack

- **Frontend**: React 18 + Vite 5
- **Styling**: Tailwind CSS 3
- **Routing**: React Router v6
- **Backend/DB**: Supabase (Auth + PostgreSQL)
- **Icons**: Lucide React
- **Toasts**: React Hot Toast