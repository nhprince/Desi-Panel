# Desi Panel

A full-stack hosting management panel inspired by cPanel, built with Node.js/Express (backend) and React (frontend).

## Overview

Desi Panel is a comprehensive solution for web hosting management, offering a user-friendly interface to control various aspects of your hosting environment. This project is a monorepo containing the backend API and the frontend client.

- **`backend/`**: A robust Node.js and Express-based RESTful API that handles the core logic of the hosting panel. It interacts with the server environment to manage files, databases, domains, and more.
- **`frontend/`**: A modern React-based single-page application (SPA) that provides an intuitive user interface for interacting with the backend API. It's built with Vite for a fast development experience and uses Tailwind CSS for a utility-first styling approach.
- **`docs/`**: This directory contains essential documentation, including architectural diagrams, implementation guides, and future feature roadmaps.

## Features

- **File Management**: A complete file manager with capabilities for creating, deleting, renaming, and moving files and folders. It also includes file upload and download functionality.
- **Domain Management**: Easily manage addon domains, subdomains, and parked domains. It also includes basic DNS zone management.
- **FTP Accounts**: Create and manage FTP accounts with status toggling and password reset functionality.
- **SSL Certificates**: Generate self-signed SSL certificates and manage their lifecycle.
- **Database Management**: Manage MySQL/MariaDB databases and users with full CRUD operations.
- **Email Services**: Create and manage email mailboxes and forwarders.

## System Architecture

### Backend (Node.js/Express)

- **Framework**: Express.js
- **Database**: PostgreSQL for production and SQLite for development
- **Authentication**: JWT-based with refresh tokens
- **File Storage**: Local filesystem with path traversal protection
- **API**: RESTful endpoints with JSON responses

### Frontend (React)

- **Framework**: React 18 with React Router
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js v16+
- npm or yarn
- PostgreSQL (for production)
- Git

### Quick Start (Development)

For the quickest setup during development, the backend supports a SQLite fallback. This requires no external database setup.

1.  **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Create environment files**:

    - Copy `backend/.env.example` to `backend/.env` and set `USE_SQLITE=1`.
    - Copy `frontend/.env.example` to `frontend/.env`.

3.  **Install dependencies**:

    ```bash
    npm install --prefix backend
    npm install --prefix frontend
    ```

4.  **Start the development servers**:

    ```bash
    npm run dev --prefix backend
    npm run dev --prefix frontend
    ```

    The backend will run on `http://localhost:4000`, and the frontend will be available at `http://localhost:5173`.

### Local Database with Docker (Recommended)

For a more robust development environment that mirrors production, you can use Docker to run a PostgreSQL instance.

1.  **Start the database container**:

    ```bash
    docker-compose up -d db
    ```

2.  **Configure the backend**:

    Update your `backend/.env` with the following settings:

    ```
    PORT=4000
    DATABASE_URL=postgres://desi:desi@localhost:5432/desipanel
    JWT_SECRET=dev-secret-change-me
    ADMIN_EMAIL=admin@example.com
    ADMIN_PASSWORD=ChangeMe123!
    FRONTEND_ORIGIN=http://localhost:5173
    NODE_ENV=development
    FILES_ROOT=./storage
    ```

### Production Installation on Linux

Use the `install.sh` script to provision a production environment. This script will guide you through setting up environment variables and creating the initial admin credentials.

```bash
./install.sh
```

## API Documentation

The backend provides a comprehensive RESTful API for managing all aspects of the hosting panel. All protected routes require a valid JWT.

### Authentication

- `POST /api/auth/register`: Register a new user.
- `POST /api/auth/login`: Authenticate a user and receive a JWT.

### Account

- `GET /api/account/details`: Get the current user's account details.
- `PUT /api/account/profile`: Update the current user's email or password.

### File Management

- `GET /api/files/`: List the contents of the root directory.
- `GET /api/files/:path*`: List the contents of a subdirectory.
- `POST /api/files/upload?dir=relative/path`: Upload a file.
- `POST /api/files/mkdir?dir=relative/path`: Create a new directory.
- `DELETE /api/files/:path*`: Delete a file or directory.

### Domain Management

- `GET /api/domains/`: List all domains.
- `POST /api/domains/`: Create a new domain.
- `DELETE /api/domains/:id`: Delete a domain.

### FTP Accounts

- `GET /api/ftp/`: List all FTP accounts.
- `POST /api/ftp/`: Create a new FTP account.
- `PATCH /api/ftp/:id/status`: Update the status of an FTP account.
- `POST /api/ftp/:id/reset-password`: Reset the password for an FTP account.
- `DELETE /api/ftp/:id`: Delete an FTP account.

### SSL Certificates

- `GET /api/ssl/domains`: List domains with their current SSL certificate status.
- `POST /api/ssl/issue`: Issue a self-signed certificate for a domain.
- `POST /api/ssl/:id/revoke`: Revoke a certificate.
- `DELETE /api/ssl/:id`: Delete a certificate record.

### Database Management

- `GET /api/db/`: List all databases.
- `POST /api/db/`: Create a new database.
- `DELETE /api/db/:id`: Delete a database.
- `POST /api/db/:id/users`: Create a new database user.
- `POST /api/db/users/:userId/reset-password`: Reset the password for a database user.
- `DELETE /api/db/users/:userId`: Delete a database user.

### Email Services

- `GET /api/email/accounts`: List all email accounts.
- `POST /api/email/accounts`: Create a new email account.
- `PATCH /api/email/accounts/:id/status`: Update the status of an email account.
- `POST /api/email/accounts/:id/reset-password`: Reset the password for an email account.
- `DELETE /api/email/accounts/:id`: Delete an email account.
- `GET /api/email/forwarders`: List all email forwarders.
- `POST /api/email/forwarders`: Create a new email forwarder.
- `DELETE /api/email/forwarders/:id`: Delete an email forwarder.

## Troubleshooting

- **Database connection failed**: Verify that the database is running and that the credentials in your `.env` file are correct.
- **File permission errors**: Ensure that the user running the application has write permissions on the `FILES_ROOT` directory.
- **JWT errors**: Make sure the `JWT_SECRET` is set correctly in your `.env` file.

## Contributing

Contributions are welcome! Please open an issue on our GitHub repository to discuss any changes or new features.

## License

This project is licensed under the [MIT License](LICENSE).
