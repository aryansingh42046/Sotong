# 🌍 World Platform

A spatial social platform with a 3D globe for world discovery and 2D isometric spaces for interaction.

## Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in .env values (Neon DB, Upstash Redis, etc.)
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Environment Variables

**Backend `.env`:**
```
DATABASE_URL=postgresql://...       # Neon PostgreSQL
REDIS_URL=redis://...               # Upstash Redis
JWT_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-refresh-secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
RESEND_API_KEY=re_...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=world-platform-assets
FRONTEND_URL=http://localhost:5173
```

**Frontend `.env`:**
```
VITE_API_URL=/api
VITE_SOCKET_URL=
```

## Architecture

```
world-platform/
├── backend/
│   ├── prisma/schema.prisma      # Full DB schema
│   ├── src/
│   │   ├── server.js             # Express + Socket.io
│   │   ├── routes/               # REST API endpoints
│   │   ├── services/             # Business logic
│   │   ├── middleware/           # Auth, permissions
│   │   ├── socket/handlers/      # Real-time events
│   │   └── lib/                  # Prisma, Redis clients
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── globe/            # Three.js 3D globe
    │   │   ├── avatar/           # Pixel art avatar creator
    │   │   ├── game/             # Phaser 2D world
    │   │   └── chat/             # Real-time chat
    │   ├── pages/                # Route pages
    │   ├── stores/               # Zustand state
    │   └── lib/                  # API, socket clients
```

## Features Built (Phase 1–3)

- ✅ Email registration + JWT auth
- ✅ 3D interactive globe (Three.js) with world pins
- ✅ Globe color customization
- ✅ Pixel art avatar creator (skin, hair, clothes, accessories)
- ✅ World creation with globe position
- ✅ 2D world editor with rooms, furniture & portals
- ✅ Phaser 2D isometric world rendering
- ✅ WASD movement + E-key interaction
- ✅ Real-time player sync (Socket.io)
- ✅ Room + world chat
- ✅ Friends system
- ✅ Role-based permissions schema

## Deployment

| Service      | Platform      | Notes                        |
|--------------|---------------|------------------------------|
| Frontend     | Vercel        | `npm run build` → auto-deploy |
| Backend      | Render        | Node 18+, free tier          |
| Database     | Neon          | PostgreSQL, free 0.5GB       |
| Cache        | Upstash Redis | 10k commands/day free        |
| Email        | Resend        | 100 emails/day free          |
| Storage      | AWS S3        | 5GB free tier                |
