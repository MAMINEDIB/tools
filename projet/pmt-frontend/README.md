# PMT Frontend

Angular 17 frontend for Project Management Tool with modern professional UI.

## Features

- 🎨 **Modern UI** with Tailwind CSS
- 📱 **Responsive Design**
- 🔐 **Authentication** (Login/Register)
- 📊 **Kanban Board** with drag & drop
- ⚡ **Real-time updates**
- 🎯 **Task Management**
- 👥 **Project Collaboration**

## Prerequisites

- Node.js 18+
- npm 9+

## Installation

```bash
npm install
```

## Development

```bash
npm start
```

Navigate to `http://localhost:4200`

## Build

```bash
npm run build
```

Production build:

```bash
npm run build:prod
```

## Testing

```bash
npm test
```

With coverage:

```bash
npm run test:coverage
```

## Docker

Build:

```bash
docker build -t pmt-frontend .
```

Run:

```bash
docker run -p 80:80 pmt-frontend
```

## Project Structure

```
src/
├── app/
│   ├── auth/              # Authentication components
│   ├── projects/          # Project management
│   ├── tasks/             # Task components
│   ├── shared/            # Shared services & models
│   └── core/              # Guards & interceptors
├── assets/                # Static assets
└── environments/          # Environment configs
```

## Tech Stack

- Angular 17
- Tailwind CSS
- RxJS
- TypeScript
- Angular CDK (Drag & Drop)
