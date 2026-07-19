# DataShield — DPDP Compliance SaaS for Indian Businesses

A SaaS product that helps Indian small and mid-size businesses become compliant with the
Digital Personal Data Protection (DPDP) Act, 2023 — by mapping what personal data they collect,
tracking compliance requirements, and generating the policy documents they need.

## What's built

**Backend** (`/backend`) — Node.js + Express + MongoDB
- Secure authentication: JWT access tokens + rotating refresh tokens (httpOnly cookies), bcrypt
  password hashing, account lockout after repeated failed logins, rate limiting
- Company & user accounts (multi-tenant: each company's data is isolated)
- Data audit API — record what personal data you collect, why, where it's stored
- DPDP compliance checklist — 14 real requirements auto-seeded per company, with a live
  compliance score
- AI-generated policy documents (Privacy Policy, DPA, breach response plan, etc.) using the
  Claude API, grounded in your actual data audit
- Security: Helmet security headers, NoSQL-injection sanitization, input validation, centralized
  error handling that never leaks internals in production

**Frontend** (`/frontend`) — React + Vite + Tailwind CSS v4
- Login / registration
- Dashboard with a compliance score ("seal") and a ledger-style requirements checklist
- Data audit page to record data flows
- Documents page to generate and read AI-drafted compliance documents

## Local setup

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set MONGO_URI, JWT secrets, ANTHROPIC_API_KEY
npm install
npm run dev        # starts on http://localhost:5000
```

You'll need a MongoDB database. The easiest free option is
[MongoDB Atlas](https://www.mongodb.com/cloud/atlas) — create a free cluster, get the
connection string, and paste it into `MONGO_URI`.

Generate strong JWT secrets with:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev         # starts on http://localhost:5173
```

Open `http://localhost:5173`, register a company account, and you're in.

## Deployment (same pattern as your other projects)

- **Backend:** Render or Railway (free tier works for testing). Set the same environment
  variables as `.env` in the host's dashboard.
- **Frontend:** Vercel — set `VITE_API_URL` to your deployed backend URL
  (e.g. `https://your-api.onrender.com/api`).
- **Database:** MongoDB Atlas free tier (M0).

Remember to update `CLIENT_URL` in the backend's environment to your deployed frontend URL,
so CORS and cookies work correctly in production.

## Important honesty notes

- This is a **working MVP**, not a finished commercial product. Test it thoroughly, get real
  businesses to try it, and iterate based on what they actually need.
- The DPDP checklist in `backend/data/dpdpChecklist.js` is a practical starting point, not legal
  advice. Before selling this as a compliance tool, it's worth having an actual lawyer or DPDP
  consultant review the checklist content and the generated document templates.
- AI-generated documents (Privacy Policy, DPA, etc.) should be reviewed by a human before a
  company publishes them — say this explicitly to your users too.
- The full authenticated flow (register → dashboard → checklist → data audit → AI document
  generation) was verified through code review and route-level testing, but a live database
  wasn't available in the build sandbox, so run through the flow yourself once after connecting
  a real MongoDB instance before showing it to anyone.

## Suggested next steps

1. Connect MongoDB Atlas and Claude API key, run through the full flow yourself
2. Deploy backend (Render) + frontend (Vercel) — same pattern as your chat app
3. Get 2-3 real small businesses to try it for free, in exchange for feedback
4. Based on feedback, decide what to charge and what to build next (e.g. team members,
   multi-framework support for GDPR/CCPA, PDF export of documents)
