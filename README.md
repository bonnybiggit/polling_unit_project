# Polling Unit Backend

Production-ready backend for the Smart Electronic Voting System.

## Architecture

- `config/` — environment, database, logging
- `controllers/` — request handlers for REST endpoints
- `models/` — Mongoose schemas for Admin, Voter, Candidate, Vote, Election, Position, PollingUnit, AuditLog
- `routes/` — Express routers for API resources
- `middlewares/` — authentication, authorization, error handling
- `services/` — business logic, face verification, voting rules, audit logging
- `utils/` — helper classes and async wrappers
- `scripts/` — seed and bootstrap utilities
- `uploads/` — persistent storage for face model assets and uploads
- `logs/` — runtime logs

## Features

- JWT-based admin authentication
- Role-based access control for admin users
- Voter card verification with status and duplicate vote prevention
- Secure ballot submission with position uniqueness enforcement
- Face verification via `@vladmandic/face-api` and TensorFlow.js
- Audit logs for security and election operations
- Election management, candidate management, and live result APIs
- Pagination, search, and filtering support
- Robust security middleware: Helmet, rate limiting, input sanitization, centralized error handling

## Getting Started

### Install dependencies

```bash
cd backend
npm install
```

### Environment

Copy `.env.example` to `.env` and adjust values:

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/polling-unit
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=2h
ADMIN_PASSWORD=SecureAdminPassword123!
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=80
```

### Download face models

The face verification service expects models in `backend/uploads/face-models`:

- `ssd_mobilenetv1_model-weights_manifest.json`
- `face_landmark_68_model-weights_manifest.json`
- `face_recognition_model-weights_manifest.json`

You can download the Node-compatible face-api models from the official repository and place them in that directory.

### Seed sample data

```bash
npm run seed
```

### Run the server

```bash
npm start
```

For local development with auto-reload:

```bash
npm run dev
```

## API Overview

### Auth
- `POST /api/auth/login` — Admin login returns JWT
- `GET /api/auth/me` — Get authenticated admin profile

### Voter
- `POST /api/voters/verify` — Verify voter card number
- `GET /api/voters` — List voters (admin)
- `GET /api/voters/:id` — Get voter details (admin)
- `PATCH /api/voters/:id/status` — Update voter status (admin)

### Face
- `POST /api/face/verify` — Submit live face image for biometric verification

### Vote
- `POST /api/votes` — Submit ballot selections

### Candidate
- `GET /api/candidates` — List candidates
- `POST /api/candidates` — Create candidate (admin)
- `PATCH /api/candidates/:id` — Update candidate (admin)
- `DELETE /api/candidates/:id` — Delete candidate (super-admin)

### Election
- `GET /api/elections` — List elections (admin)
- `POST /api/elections` — Create election (super-admin)
- `PATCH /api/elections/:id` — Update election (super-admin)
- `GET /api/elections/positions` — List election positions

### Results
- `GET /api/results/aggregate` — Aggregated vote results (admin)
- `GET /api/results/stats` — Live vote statistics (admin)

### Admin
- `GET /api/admin/dashboard` — Admin dashboard summary
- `GET /api/admin/audits` — Audit logs (super-admin)
- `GET /api/admin/users` — List admin users (super-admin)

## Deployment

1. Set environment variables securely in your deployment environment.
2. Ensure MongoDB has strong authentication and network rules.
3. Install dependencies and run migrations/seed scripts.
4. Use a process manager such as PM2 or Docker for production.
5. Configure HTTPS and secure cookie handling.

## Notes

- This backend is designed to work with a secure frontend client that handles voting workflows and biometric capture.
- The face verification service is implemented for server-side comparison and must be seeded with face descriptors for each voter.
