# 🕵️ ShadowCatch — Shadow API Hunter

A passive API scanner that detects undocumented "Shadow" and "Zombie" API endpoints in real-time.

## Architecture

```
Client (React) ←──Socket.io──→ Server (Express)
                                  │
                              ┌───┴───┐
                              │ Proxy  │──→ Target API
                              └───┬───┘
                                  │
                          ┌───────┴───────┐
                          │ Detection     │
                          │ Engine        │
                          └───────┬───────┘
                                  │
                              MongoDB
```

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB running on `localhost:27017`

### 1. Start the Dummy Target API

```bash
cd server
npm install
npm run dummy-api
```

### 2. Start the ShadowCatch Server

```bash
cd server
npm run dev
```

### 3. Start the Dashboard

```bash
cd client
npm install
npm run dev
```

### 4. Upload a Spec

Open `http://localhost:5173` and upload `server/sample-spec.json`.

### 5. Send Traffic

```bash
# Valid request (green)
curl http://localhost:3001/proxy/api/users

# 🚨 Shadow endpoint (red alert!)
curl http://localhost:3001/proxy/api/admin/secret_backdoor

# 🚨 Method mismatch (amber)
curl -X DELETE http://localhost:3001/proxy/api/users/1

# 🚨 Data leak (purple)
curl "http://localhost:3001/proxy/api/users?password=secret123"
```

## Tech Stack

- **Backend**: Node.js, Express, Socket.io, http-proxy-middleware
- **Frontend**: React, Vite, Socket.io-client
- **Database**: MongoDB + Mongoose
- **Detection**: path-to-regexp, @apidevtools/swagger-parser
