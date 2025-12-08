# AI Gym Trainer

A full-stack AI-powered gym trainer application.

## Tech Stack
- **Frontend**: React (Vite)
- **Backend**: Node.js, Express
- **Database**: MongoDB (via Prisma)
- **Queue**: BullMQ + Redis
- **AI**: Gemini (or OpenAI) for Diet Generation

## Prerequisites
1.  **Node.js** installed.
2.  **Docker** (for Redis) or a local Redis instance.
3.  **MongoDB** connection string (Atlas or Local).

## Setup Instructions

### 1. Start Redis
If you have Docker:
```bash
docker run -d --name redis-stack -p 6379:6379 redis/redis-stack:latest
```

### 2. Backend Setup
```bash
cd backend
# Install dependencies
npm install

# Configure Environment
# Rename .env.example to .env and fill in your details:
# - DATABASE_URL (MongoDB connection string)
# - GOOGLE_API_KEY (for AI features)
```

**Database Push:**
```bash
npx prisma generate
npx prisma db push
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

## Running the App

You need to run three processes (in separate terminals):

1.  **Backend API**:
    ```bash
    cd backend
    npm run dev
    # (Ensure you added "dev": "node server.js" or similar to package.json, otherwise use `node server.js`)
    ```

2.  **Worker Process** (for AI Diet Generation):
    ```bash
    cd backend
    node worker.js
    ```

3.  **Frontend**:
    ```bash
    cd frontend
    npm run dev
    ```

## Usage
1.  Open http://localhost:5173 (or the port Vite shows).
2.  **Signup** for an account.
3.  Go to **Diet Plan**, fill out your profile, and click "Generate".
4.  Go to **Workout**, select a muscle group, and follow the video guide.
