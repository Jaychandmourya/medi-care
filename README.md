# MediCare

A healthcare management application built with React, TypeScript, and Vite.

## Tech Stack

| Technology | Version |
|------------|---------|
| React | 19.2.4 |
| React DOM | 19.2.4 |
| TypeScript | ~5.9.3 |
| Vite | 7.3.1 |
| Tailwind CSS | 4.2.2 |
| Redux Toolkit | 2.11.2 |
| React Router DOM | 7.13.1 |

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Jaychandmourya/medi-care.git
cd medi-care
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory (if required by your configuration).

### 4. Run the Application

**Option A: Run Frontend Only**
```bash
npm run dev
```

**Option B: Run Frontend + Backend Server (Concurrently)**
```bash
npm run dev:full
```

**Option C: Run Backend Server Only**
```bash
npm run server
```

The frontend will be available at `http://localhost:5173` and the backend server at `http://localhost:3001`.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run server` | Start Express backend server |
| `npm run dev:full` | Run both frontend and backend concurrently |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## Project Structure

```
medi-care/
├── src/
│   ├── app/          # Routes, hooks, store
│   ├── assets/       # Images and static assets
│   ├── components/   # React components (admin, auth, debug, etc.)
│   ├── constants/    # Configuration files
│   └── pages/        # Page components
├── public/           # Public assets
├── server.js         # Express backend server
└── package.json
```

## Features

- Role-based access control (Admin, Doctor, Patient)
- OPD management
- Prescription management
- Patient records
- Doctor search with NPI API integration
- Responsive UI with Tailwind CSS

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).
