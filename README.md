![Status](https://img.shields.io/badge/status-in%20development-lightgrey)

# Character Certificate System

Character Certificate System is a full-stack web application for managing character certificate requests in an institutional environment. It separates student-facing workflows from administrative operations and maintains an audit trail for security, review, and monitoring.

## Product Scope

Students can:
- Register with OTP verification
- Log in and manage account access
- Submit a character certificate request with supporting documents
- Save drafts and track request status

Admins can:
- Log in through a separate admin interface
- Review audit logs with filtering and pagination
- Monitor system activity across authentication and certificate flows
- Process certificate requests through dedicated admin workflows

## System Design

The repository is organized as two frontend applications and one backend service:

- `frontend/student-dashboard/` contains the student-facing React application
- `frontend/admin-dashboard/` contains the admin-facing React application
- `backend/` contains APIs, models, services, scripts, and admin-specific server logic

This separation keeps student and admin responsibilities isolated at both UI and API levels, which improves maintainability and reduces accidental coupling as the system grows.

## Technology Stack

Backend:
- Node.js + Express
- MongoDB + Mongoose
- JWT-based authentication
- bcrypt / bcryptjs for password hashing
- Redis for OTP and temporary verification state
- BullMQ + Redis planned for background jobs and async processing

Frontend:
- React for the student application
- React for the admin dashboard as a separate app
- Feature-based frontend structure for auth, logs, and workflow pages

Security and operations:
- Append-only `ActivityLog` collection
- Model-layer immutability for audit records
- Rate limiting on authentication endpoints
- Token version strategy for session invalidation
- Admin CLI protected by `ADMIN_CLI_SECRET`

## Repository Structure

```text
/
├── backend/
│   ├── admin/          # Admin auth, audit-log APIs, admin operations docs
│   ├── config/         # Database and backend configuration
│   ├── controllers/    # Student/auth certificate controllers
│   ├── models/         # Student, Certificate, ActivityLog
│   ├── routes/         # Student/auth API routes
│   ├── scripts/        # Operational scripts such as seedAdmin.js, manageAdmin.js
│   ├── services/       # OTP, audit logging, and shared backend services
│   └── utils/          # Hashing, encryption, email, and helper utilities
├── frontend/
│   ├── student-dashboard/
│   └── admin-dashboard/
└── README.md
```

## Getting Started

1. Clone the repository.
2. Install backend dependencies:

```powershell
cd backend
npm install
```

3. Copy `.env.example` to `.env` and fill in the required values. If `.env.example` is not present yet, create `.env` manually from the variables below.
4. Start the backend service:

```powershell
npm run dev
```

If you want to run either frontend application, install dependencies inside its own folder and start it separately.

## Environment Variables

```env
MONGO_URI=
MONGO_URL=
JWT_STUDENT_SECRET=
JWT_ADMIN_SECRET=
JWT_SECRET=
ADMIN_CLI_SECRET=
BCRYPT_SALT_ROUNDS=12
REDIS_URL=
SECRET_KEY=
PORT=5000
```

Note: the current codebase still uses `MONGO_URL` and `JWT_SECRET` in parts of the backend. Split student/admin secrets are the recommended direction for the next security pass.

## Admin Operations

Admin account management is handled through the backend CLI:

```powershell
npm run admin:list
npm run admin:create -- --email x@x.com --role superadmin
npm run admin:deactivate -- --email x@x.com
npm run admin:promote -- --email x@x.com --role superadmin
npm run admin:delete -- --email x@x.com --force
npm run admin:reset-password -- --email x@x.com
```

Detailed operational notes are documented in `backend/admin/README.md`.

## Security Notes

- Audit events are stored in an append-only `ActivityLog` collection and update/delete operations are blocked at the model layer.
- Admin CLI commands require `ADMIN_CLI_SECRET` before any action can run.
- Sensitive CLI actions require interactive confirmation before execution.
- OTP flows use Redis-backed temporary storage with expiry, resend cooldown, and invalid-attempt protection.

## Current Status

Implemented:
- Student registration, login, password reset, dashboard, draft creation, submission flow
- Immutable audit logging foundation
- Admin audit-log APIs and separate admin dashboard foundation
- Secure admin management CLI

In progress:
- Full admin certificate review workflow
- Certificate issuance and verification features
- Stronger token separation and session invalidation alignment

## License

MIT
