Project Overview & Tech Stack
Project Overview
Build a full-stack web-based platform called College Complaint Management System (CampusResolve) that allows students to report campus issues (hostels, infrastructure, Wi-Fi, academics, cleanliness) and track their resolution status in real time. The platform must process raw complaint submissions, auto-classify and assign them to the correct department using an AI categorization engine, manage administrative workflows (Under Review \rightarrow Assigned \rightarrow In Progress \rightarrow Resolved \rightarrow Closed), store attached evidence files, emit timeline tracking updates, and provide actionable analytics for department heads.
Tech Stack
 * Frontend: Next.js (Pages Router), React 19, Tailwind CSS, Zustand, Axios, Socket.IO client, Lucide-React icons, and Recharts.
 * Backend: Node.js, Express, MongoDB, Mongoose, JSON Web Tokens (JWT), Socket.IO, Helmet, Morgan, Compression, Express-Validator, and Bcryptjs.
 * AI Integration: OpenRouter API or Google Generative AI SDK (Gemini) for automatic complaint classification, sentiment priority assessment, and summary generation.
 * File Storage: Cloudinary or AWS S3 / Local Multer storage for complaint evidence image attachments.
Authentication, Workflows, and Administrative Layer
Authentication
The authentication system must support dual-role login (Student and Admin/Staff), JWT-based session handling, protected routes (ProtectedRoute), an /api/auth/me profile endpoint, password hashing with bcrypt at cost factor 12, and persistent authentication state on the client using Zustand.
Student Complaint Workflow
Students must be able to register, log in, submit detailed complaints with mandatory fields (Title, Category, Location, Detailed Description, Priority Level), attach images, view an interactive history of their submitted complaints, inspect detailed status timelines, add follow-up comments, and provide satisfaction ratings/feedback once an issue is marked as Resolved.
Admin & Department Management
Administrators must be able to view an aggregated management dashboard, search and filter complaints by status, category, or priority, manually reassign complaints to specific departments or staff members, update resolution statuses with mandatory resolution details, post official status notes, and trigger automated status change notifications.
Integrations, Executions, AI Generation, and Real-Time Layer
AI Categorization & Triage Engine
When a student submits a complaint, the system must invoke an AI classification pipeline. The engine passes the raw text description to OpenRouter or Google Gemini to automatically infer:
 * Department Category (e.g., Infrastructure, IT & Wi-Fi, Hostel, Library, Transport, Cleanliness).
 * Suggested Priority Level (Low, Medium, High, Critical).
 * Short Summary for quick admin review.
If the AI API key is unconfigured or unavailable, the system must fall back to a deterministic keyword-matching rule builder to ensure zero system downtime.
Real-Time Layer & Notifications
The Socket.IO server must broadcast status updates (e.g., status changed from "Assigned" to "In Progress") to subscribed student clients in real time. When an admin updates a complaint, a notification row is generated and rendered instantly in the student's notification drawer.
Frontend Pages
The application uses the Next.js Pages Router. The root / page redirects authenticated users based on their role (student \rightarrow /dashboard, admin \rightarrow /admin/dashboard).
 * / – Landing page featuring campus support portal overview, submission quick-guide, and responsive layout.
 * /login – Form for email/password authentication with JWT handling, Zustand persistence, validation, and error states.
 * /register – Student registration form with password validation, student ID validation, and error handling.
 * /dashboard – Student console displaying personal complaint statistics, active complaint tracking cards, recent history, and real-time status alerts.
 * /complaints/new – Complaint submission form featuring dynamic category selectors, location fields, file upload dropzone, and live AI category suggestion preview.
 * /complaints/[id] – Full complaint detail page showing issue timeline, image attachments, department assignment details, admin comment feed, and resolution feedback form.
 * /admin/dashboard – Admin console with campus metrics (MetricGrid), department workload stats, SLA breach warnings, filtering tools, and bulk action controls.
 * /admin/complaints/[id] – Admin processing page to reassign staff, update status, add resolution notes, and trigger student alerts.
 * /settings – Profile management, user role details, security controls, and theme settings.
Backend Architecture & Database Collections
Backend Architecture
 * Routes: Handles HTTP routing, request validation via express-validator, and middleware composition (auth, role-check, validation, error handler).
 * Controllers: Request parsing and response shaping only (never talks directly to MongoDB).
 * Services: Business logic ownership (complaint CRUD, status transition lifecycle, AI categorization service, image upload service, notification aggregation).
 * AI Layer: Encapsulates prompt wrappers for OpenRouter and Gemini fallback engines.
 * Config Layer: Centralizes environment variables, MongoDB connection (with in-memory fallback), and Socket.IO setup.
Database Collections
 * Users: Stores authenticated users (name, email, password with select: false, role: student | admin | staff, department, studentId).
 * Complaints: Stores issue entries (title, description, category: hostel | wifi | infrastructure | academics | other, location, attachments: [String], status: submitted | under_review | assigned | in_progress | resolved | closed, priority: low | medium | high | critical, assignedTo, studentId, aiSummary, rating, feedback).
 * ComplaintLogs: Stores granular timeline events (complaintId, actionBy, previousStatus, newStatus, comment, timestamp).
 * Notifications: Stores alerts (owner, complaintId, type, title, message, isRead).
API Endpoints
Health and Auth
 * GET /api/health – System heartbeat and status check.
 * POST /api/auth/register – Register a new student account.
 * POST /api/auth/login – Authenticate user and issue JWT.
 * GET /api/auth/me – Fetch current user profile.
Complaints (Student & Admin)
 * GET /api/complaints – List complaints with pagination, category filter, and status filter.
 * POST /api/complaints – Submit a new complaint (triggers auto-AI categorization).
 * GET /api/complaints/:id – Fetch single complaint details with full activity timeline.
 * PUT /api/complaints/:id/status – Update complaint status and attach resolution notes (Admin only).
 * PUT /api/complaints/:id/assign – Assign complaint to a department or staff member (Admin only).
 * POST /api/complaints/:id/feedback – Submit student resolution feedback and rating (Student only).
 * DELETE /api/complaints/:id – Delete or archive a complaint.
Admin Dashboard & Notifications
 * GET /api/admin/stats – Aggregated statistics (total complaints, resolution rate, department breakdown).
 * GET /api/notifications – List user notifications.
 * PUT /api/notifications/:id/read – Mark notification as read.
Folder Structure & Development Phases
Frontend Structure
client/
└── src/
    ├── components/
    │   ├── AppShell/
    │   ├── MetricGrid/
    │   ├── ComplaintCard/
    │   ├── TimelineView/
    │   ├── FileUploader/
    │   └── ProtectedRoute/
    ├── pages/
    │   ├── _app.js
    │   ├── index.js
    │   ├── login.js
    │   ├── register.js
    │   ├── dashboard.js
    │   ├── settings.js
    │   ├── admin/
    │   │   ├── dashboard.js
    │   │   └── complaints/
    │   │       └── [id].js
    │   └── complaints/
    │       ├── new.js
    │       └── [id].js
    ├── store/
    │   ├── authStore.js
    │   └── complaintStore.js
    └── services/
        ├── api.js
        └── socket.js

Backend Structure
server/
└── src/
    ├── config/
    │   ├── env.js
    │   ├── db.js
    │   └── socket.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── complaintRoutes.js
    │   ├── adminRoutes.js
    │   └── notificationRoutes.js
    ├── controllers/
    │   ├── authController.js
    │   ├── complaintController.js
    │   └── adminController.js
    ├── services/
    │   ├── authService.js
    │   ├── complaintService.js
    │   ├── aiService.js
    │   └── notificationService.js
    ├── models/
    │   ├── User.js
    │   ├── Complaint.js
    │   ├── ComplaintLog.js
    │   └── Notification.js
    └── middleware/
        ├── authMiddleware.js
        └── errorMiddleware.js

Development Phases
 * Phase 1: Project setup (Next.js, Express, MongoDB connection, JWT authentication, Zustand auth store, AppShell layout).
 * Phase 2: Complaint submission form, image upload configuration, basic student complaint list, and detail view.
 * Phase 3: AI auto-categorization integration (OpenRouter/Gemini primary, keyword engine fallback).
 * Phase 4: Admin dashboard, status management lifecycle (Submitted \rightarrow Under Review \rightarrow Assigned \rightarrow In Progress \rightarrow Resolved \rightarrow Closed), and staff assignment workflow.
 * Phase 5: Socket.IO real-time notification streaming, activity timeline logging, and student feedback rating system.
 * Phase 6: End-to-end deployment setup (Vercel for frontend, Render for backend, MongoDB Atlas for database).
UI, Security, Outcome, and Codex Instructions
UI and UX Requirements
The UI must use a clean, modern operator-console aesthetic with Tailwind CSS, be fully responsive across mobile and desktop devices, render skeleton loaders during async requests, display visual status badges with distinct colors (Submitted: Gray, In Progress: Blue, Resolved: Green, Critical: Red), render an interactive timeline component for complaint history, and provide a persistent notification drawer accessible from the navigation header.
Security Requirements
The application must hash passwords with bcrypt at cost factor 12, sign and verify JWT tokens using JWT_SECRET, set secure HTTP security headers via Helmet, enforce strict CORS restriction limited to CLIENT_URL, rate-limit authentication endpoints via express-rate-limit, validate all input payloads with express-validator, and sanitize file uploads to prevent unauthorized file execution.
Final Expected Outcome
The completed platform must allow a student to log in, submit a complaint with photo evidence, see AI automatically tag the category and priority, track its step-by-step progress on an active timeline, receive real-time notifications when an admin updates the ticket status, and rate the resolution once closed—all backed by MongoDB persistence and deployed live on Vercel and Render.
Codex & AI Agent Implementation Instructions
The AI coding agent must build the application phase by phase, strictly follow the folder layout, keep controllers thin and delegate logic to service modules, never execute raw database operations inside controllers, wrap external AI calls behind aiService.js, use local/in-memory fallback when MongoDB is unavailable, emit a Socket.IO event on every status update, write a ComplaintLog entry for every status transition, and list all created/modified files at the conclusion of each development phase.