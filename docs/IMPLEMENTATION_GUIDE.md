# Desi Panel - Implementation Guide

## Project Overview
Desi Panel is a full-featured hosting control panel designed to provide a user-friendly interface for managing web hosting services. This document serves as a comprehensive guide to the current implementation and architecture.

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Module Reference](#module-reference)
3. [API Documentation](#api-documentation)
4. [Development Setup](#development-setup)
5. [Deployment Guide](#deployment-guide)
6. [Troubleshooting](#troubleshooting)

## System Architecture

### Backend (Node.js/Express)
- **Framework**: Express.js
- **Database**: PostgreSQL (production) / SQLite (development)
- **Authentication**: JWT with refresh tokens
- **File Storage**: Local filesystem with path traversal protection
- **API**: RESTful endpoints with JSON responses

### Frontend (React)
- **Framework**: React 18 with React Router
- **State Management**: React Context + Zustand
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Icons**: Lucide

## Module Reference

### 1. Authentication System
- JWT-based authentication
- Email/password login
- Account management
- Password reset flow

### 2. File Manager
- File/folder operations (create, delete, rename, move, copy)
- Upload/download files
- Path traversal protection
- Breadcrumb navigation

### 3. Domain Management
- Addon domains
- Subdomains
- Parked domains
- DNS zone management (basic)

### 4. FTP Accounts
- Account management (CRUD)
- Status toggling
- Password reset
- Development stubs for system operations

### 5. SSL Certificates
- Self-signed certificate generation
- Certificate management
- Development stubs for Let's Encrypt

### 6. Database Management
- MySQL/MariaDB database management
- User management
- Development stubs for system operations

### 7. Email Services
- Mailbox management
- Forwarders
- Development stubs for Postfix/Dovecot

## API Documentation

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/logout` - Invalidate token

### Files
- `GET /api/files/*` - List directory contents
- `POST /api/files/upload` - Upload file
- `POST /api/files/rename` - Rename file/folder
- `POST /api/files/move` - Move file/folder
- `POST /api/files/copy` - Copy file/folder
- `GET /api/files/download/*` - Download file
- `DELETE /api/files/*` - Delete file/folder
- `POST /api/files/mkdir` - Create directory

### Domains
- `GET /api/domains` - List domains
- `POST /api/domains` - Add domain
- `DELETE /api/domains/:id` - Remove domain

### FTP
- `GET /api/ftp` - List FTP accounts
- `POST /api/ftp` - Create FTP account
- `PATCH /api/ftp/:id/status` - Toggle account status
- `POST /api/ftp/:id/reset-password` - Reset password
- `DELETE /api/ftp/:id` - Delete account

### SSL
- `GET /api/ssl/domains` - List domains with SSL
- `POST /api/ssl/issue` - Issue certificate
- `POST /api/ssl/:id/revoke` - Revoke certificate
- `DELETE /api/ssl/:id` - Delete certificate

### Databases
- `GET /api/db` - List databases
- `POST /api/db` - Create database
- `DELETE /api/db/:id` - Delete database
- `POST /api/db/:id/users` - Add database user
- `POST /api/db/users/:userId/reset-password` - Reset user password
- `DELETE /api/db/users/:userId` - Remove user

### Email
- `GET /api/email/accounts` - List mailboxes
- `POST /api/email/accounts` - Create mailbox
- `PATCH /api/email/accounts/:id/status` - Toggle status
- `POST /api/email/accounts/:id/reset-password` - Reset password
- `DELETE /api/email/accounts/:id` - Delete mailbox
- `GET /api/email/forwarders` - List forwarders
- `POST /api/email/forwarders` - Create forwarder
- `DELETE /api/email/forwarders/:id` - Delete forwarder

## Development Setup

### Prerequisites
- Node.js v16+
- npm or yarn
- PostgreSQL (for production)
- Git

### Backend Setup
1. Clone the repository
2. Install dependencies: `cd backend && npm install`
3. Copy `.env.example` to `.env` and configure
4. Run migrations: `npx sequelize-cli db:migrate`
5. Start server: `npm run dev`

### Frontend Setup
1. Navigate to frontend: `cd frontend`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure
4. Start dev server: `npm run dev`

## Deployment Guide

### Production Requirements
- Linux server (Ubuntu 20.04+ recommended)
- Node.js v16+
- PostgreSQL
- Nginx (reverse proxy)
- PM2 (process manager)

### Installation Steps
1. Clone repository on server
2. Run `./install.sh` and follow prompts
3. Configure Nginx as reverse proxy
4. Set up SSL with Let's Encrypt
5. Start services with PM2

## Troubleshooting

### Common Issues
1. **Database connection failed**
   - Verify database is running
   - Check `.env` configuration
   - Ensure user has proper permissions

2. **File permission errors**
   - Check user permissions on storage directory
   - Verify `FILES_ROOT` is writable

3. **JWT errors**
   - Ensure `JWT_SECRET` is set
   - Check token expiration

4. **Frontend not connecting to backend**
   - Verify `VITE_API_URL` in frontend `.env`
   - Check CORS settings in backend

## Support
For issues and feature requests, please open an issue on our GitHub repository.

## License
[Specify license here]
