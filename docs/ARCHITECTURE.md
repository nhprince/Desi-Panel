# Desi Panel Architecture

## Overview
Desi Panel is a full-stack hosting control panel inspired by cPanel, built with Node.js/Express (backend) and React (frontend). This document outlines the system architecture, components, and data flow.

## System Architecture

### Backend (Node.js/Express)
- **Framework**: Express.js
- **Database**: PostgreSQL (production) / SQLite (development)
- **Authentication**: JWT-based with refresh tokens
- **File Storage**: Local filesystem with path traversal protection
- **API**: RESTful endpoints with JSON responses

Key Components:
- `src/models/`: Sequelize ORM models
- `src/controllers/`: Request handlers
- `src/routes/`: API route definitions
- `src/middleware/`: Auth and validation
- `src/services/`: Business logic (FTP, SSL, DB, Email)
- `src/utils/`: Shared utilities

### Frontend (React)
- **Framework**: React 18 with React Router
- **State Management**: React Context + Zustand
- **UI**: Tailwind CSS with responsive design
- **Build**: Vite

Key Components:
- `src/pages/`: Page components
- `src/components/`: Reusable UI components
- `src/services/`: API client and data fetching
- `src/hooks/`: Custom React hooks

## Data Flow

1. **Authentication**
   - User logs in with email/password
   - Backend verifies credentials and issues JWT
   - Token stored in HTTP-only cookie
   - Protected routes validate token via auth middleware

2. **File Operations**
   - All paths are resolved relative to user's home directory
   - Server enforces path traversal protection
   - File uploads use streaming for memory efficiency

3. **Service Integration**
   - Development mode uses stubs for system operations
   - Production mode integrates with actual services (Postfix, MySQL, etc.)
   - Environment variables control service behavior

## Security Considerations

- **Authentication**: JWT with secure, HTTP-only cookies
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Express-validator for all API endpoints
- **File Operations**: Path traversal protection
- **CORS**: Configured to allow only frontend origin
- **Rate Limiting**: Implemented on auth endpoints

## Deployment

### Development
1. Clone repository
2. Install dependencies: `npm install`
3. Configure `.env` files (see `.env.example`)
4. Start services: `npm run dev` (runs both frontend and backend)

### Production
1. Set up PostgreSQL database
2. Configure environment variables
3. Build frontend: `npm run build`
4. Start backend: `npm start`
5. Use reverse proxy (Nginx/Apache) with HTTPS

## Monitoring and Logging

- **Logging**: Winston for structured logging
- **Error Tracking**: Sentry (optional)
- **Monitoring**: Prometheus metrics (planned)

## Future Considerations

- Containerization with Docker
- Kubernetes orchestration
- Multi-server support
- Plugin system for extensions

## License

[Specify license here]
