Full-Stack Development Context File for Hosting Management Software


Project NAME : Desi Panel
This document serves as a comprehensive guide for the development of a web-based hosting management software. The primary objective is to create a robust, secure, and user-friendly control panel that provides a complete set of tools for managing websites, domains, databases, and emails. The software will be built as a full-stack application with a clear separation between the server-side backend and the client-side frontend.

2. Technology Stack
2.1. Backend
Language: Node.js

Framework: Express.js

Database: PostgreSQL (chosen for its reliability and structured data handling)

Database ORM: Sequelize

Authentication: JWT (JSON Web Tokens) for secure API access

System Interaction: Custom Node.js modules for interacting with the underlying Linux server (e.g., executing shell commands for file management, user creation, etc.)

2.2. Frontend
Framework: React

Styling: Tailwind CSS (for rapid, utility-first styling)

State Management: React Context or Zustand

Icons: Lucide-React for a consistent and professional look

UI Components: Shadcn/ui for pre-styled, accessible components

3. Project Structure
The project will follow a monorepo-style structure, with dedicated directories for the backend, frontend, and shared resources.

/hosting-management-software
├── backend/                  # Server-side application
│   ├── src/
│   │   ├── api/              # API routes and endpoints
│   │   ├── config/           # Configuration files
│   │   ├── controllers/      # Business logic
│   │   ├── models/           # Database schemas
│   │   ├── services/         # Reusable functions (file operations, email)
│   │   └── index.js          # Entry point
│   ├── tests/
│   └── package.json
├── frontend/                 # Client-side application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── pages/            # Page-level components
│   │   ├── services/         # API fetching logic
│   │   ├── styles/           # Tailwind config
│   │   └── App.js            # Main app component
│   └── package.json
├── docs/                     # Project documentation (this file)
└── package.json              # Root package file for managing both applications

4. Feature Roadmap and Modules
The development will be phased, with each module building upon the previous one.

Phase 1: Core User Management
User authentication (registration, login, JWT generation)

User profile management

Dashboard with basic statistics

Phase 2: File and Domain Management
File Manager functionality (CRUD, drag-and-drop)

FTP account creation and management

Domain management (add-on, subdomains, parked domains)

SSL certificate management (Let's Encrypt integration)

Phase 3: Database and Email
MySQL/MariaDB database provisioning

Web-based database management tool (e.g., custom phpMyAdmin)

Email account management

Email forwarders and spam control

Phase 4: Advanced Tools and Analytics
Bandwidth and resource usage monitoring

PHP version selector

Cron job scheduler

Backup and restore functionality

5. API Design (RESTful)
The backend will expose a RESTful API to the frontend. All communication will be stateless and secured with JWT.

Method

Endpoint

Description

POST

/api/auth/register

Registers a new user account

POST

/api/auth/login

Authenticates a user and returns a JWT

GET

/api/account/details

Retrieves user's hosting account details

GET

/api/files/:path*

Lists files and directories

POST

/api/files/upload

Uploads a file

DELETE

/api/files/:path*

Deletes a file or directory

POST

/api/databases

Creates a new database

GET

/api/emails

Lists all email accounts for a domain

6. Database Schema (Conceptual)
The database will be structured to support the core functionality.

Users Table:

id (Primary Key)

email

password_hash

created_at

HostingAccounts Table:

id (Primary Key)

user_id (Foreign Key to Users)

disk_space_limit_mb

bandwidth_limit_gb

created_at

Domains Table:

id (Primary Key)

account_id (Foreign Key to HostingAccounts)

name (e.g., example.com)

type (main, addon, subdomain)

7. Development Workflow
Clone the Repository:

git clone [https://github.com/your-repo/hosting-management.git](https://github.com/your-repo/hosting-management.git)
cd hosting-management

Backend Setup:

cd backend
npm install
# Set up .env file with database credentials
npm run start

Frontend Setup:

cd frontend
npm install
npm run dev

Contribution:

Create a new branch for each feature.

Write unit and integration tests for new code.

Submit a pull request for review.

8. Security Considerations
Authentication: All API endpoints must be protected by JWT.

Input Validation: Sanitize and validate all user inputs on both the frontend and backend to prevent XSS and injection attacks.

Least Privilege: The backend system should interact with the server using a dedicated user account with the minimum necessary permissions. File operations must be sandboxed to the user's home directory.


this software will be installed linux based servers with install.sh file and will be used to manage the hosting accounts of the users. the login credentials should be set while installation on linux terminal, make it whole like the cpanel.