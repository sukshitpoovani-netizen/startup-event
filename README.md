# Startup Expo 2026 – Event Management Platform

A complete, reusable full-stack event management website built for **Startup Expo 2026**.

Designed so that college students with little or no programming experience can deploy it using only GitHub + Vercel (no terminal required).

---

## What is included (Current Version)

### Working Features
- Public multi-page event website (Home + Registration)
- Dynamic ticket categories from database
- Open registration with validation & duplicate prevention
- Unique Registration ID + Ticket Number
- Secure QR code generation for every ticket
- Confirmation email via Resend (with QR + SPOC details)
- Database schema for Event, Tickets, Registrations, Speakers, Sponsors, Exhibitors, Stalls, Investors, Mentors, SPOCs, Email, Reminders, RBAC, Audit logs
- Role-based access control foundation (SUPER_ADMIN, EVENT_MANAGER, CHECKIN_STAFF)
- One-time browser setup endpoint (`/api/setup`)
- Vercel Cron configuration for reminders
- Vercel Blob ready for image uploads
- Student-friendly deployment flow

### Coming in next iterations
- Full Admin Dashboard UI (CRUD for all modules)
- Dynamic form builder
- QR scanner / check-in interface
- Agenda, Speakers, Exhibitors, Sponsors public pages
- Invitation-only & RSVP modes
- Email campaign composer
- Reminder scheduler UI
- Reports & CSV export
- Full SPOC assignment UI

---

## Student Deployment Guide (No Terminal Required)

### Step 1 – Download & Extract
Download the project ZIP and extract it on your computer.

### Step 2 – Create GitHub Repository
1. Go to [github.com](https://github.com) and sign in.
2. Click **New repository**.
3. Name it something like `startup-expo-2026`.
4. Keep it **Public**.
5. Do **not** initialize with README.
6. Click **Create repository**.
7. On the next page, click **uploading an existing file**.
8. Drag **all** the extracted project files and folders into the browser.
9. Click **Commit changes**.

### Step 3 – Create Neon Database
1. Go to [console.neon.tech](https://console.neon.tech) and create a free account.
2. Create a new project.
3. Copy the **connection string** (it looks like `postgresql://...`).

### Step 4 – Create Resend Account
1. Go to [resend.com](https://resend.com) and create a free account.
2. Create an API key.
3. (Optional but recommended) Verify a domain for better deliverability. For testing you can use `onboarding@resend.dev`.

### Step 5 – Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New Project**.
3. Import the GitHub repository you just created.
4. Framework Preset: **Next.js** (auto-detected).
5. Click **Environment Variables** and add the following:

| Name | Value | Notes |
|------|-------|-------|
| `DATABASE_URL` | your Neon connection string | Required |
| `NEXTAUTH_SECRET` | long random string | Required (min 32 characters) |
| `AUTH_SECRET` | same as above | Required |
| `NEXT_PUBLIC_APP_URL` | `https://your-project.vercel.app` | Update after first deploy |
| `RESEND_API_KEY` | your Resend key | Required for emails |
| `RESEND_FROM_EMAIL` | `Startup Expo <onboarding@resend.dev>` | Or your verified domain |
| `CRON_SECRET` | long random string | Required |
| `SETUP_SECRET` | long random string | Same as CRON_SECRET is fine |
| `BLOB_READ_WRITE_TOKEN` | from Vercel Blob | Optional for now |

6. Click **Deploy**.

### Step 6 – Initialize the Database
After the first successful deploy:

1. Visit:  
   `https://your-project.vercel.app/api/setup?secret=YOUR_SETUP_SECRET`
2. You should see a success message with the default admin credentials.

### Step 7 – Login to Admin
1. Go to `https://your-project.vercel.app/admin/login`
2. Email: `admin@startupexpo.com`
3. Password: `Admin@12345`
4. **Change the password immediately**.

### Step 8 – Update Environment Variable
In Vercel → Project → Settings → Environment Variables, update:

```
NEXT_PUBLIC_APP_URL=https://your-actual-domain.vercel.app
```

Then redeploy (Deployments → … → Redeploy).

---

## Default Admin Credentials

```
Email:    admin@startupexpo.com
Password: Admin@12345
```

**Change this password as soon as you log in.**

---

## Local Development (Optional – for developers)

```bash
npm install
cp .env.example .env
# fill in DATABASE_URL etc.
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

---

## Project Structure

```
event-management-platform/
├── prisma/
│   ├── schema.prisma      # Full database schema
│   └── seed.ts            # Initial data + Super Admin
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/           # Serverless API routes
│   │   ├── register/      # Public registration
│   │   ├── admin/         # Admin area
│   │   └── page.tsx       # Homepage
│   ├── lib/               # Shared utilities
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── email.ts
│   │   ├── qr.ts
│   │   └── utils.ts
│   └── ...
├── .env.example
├── vercel.json            # Cron jobs
├── package.json
└── README.md
```

---

## Security Notes

- All secrets must be set in Vercel Environment Variables.
- Never commit `.env` files.
- The `/api/setup` endpoint is protected by `SETUP_SECRET`.
- QR codes contain only a secure random token (no personal data).
- Registration is protected against duplicates per email + ticket category.
- Passwords are hashed with bcrypt.

---

## Support & Next Steps

This is a production-ready foundation. The database schema already supports the full feature set described in the original specification (speakers, sponsors, exhibitors, stalls, investors, pitch competition, B2B meetings, communication calendar, etc.).

The next development phase will add the complete Admin Dashboard UI and the remaining public pages.

---

Built for student organizers who need a real, deployable event platform without DevOps complexity.
