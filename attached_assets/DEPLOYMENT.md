# Deployment Guide

This guide explains how to deploy the CrossFit community management platform.

## Environment Variables

### Required Variables
- `DATABASE_URL` - PostgreSQL database connection string
- `SESSION_SECRET` - Secret key for session encryption (generate a secure random string)

### Optional Variables (Replit Authentication)
- `REPL_ID` - Replit application ID for OAuth authentication
- `REPLIT_DOMAINS` - Comma-separated list of allowed domains for authentication
- `ISSUER_URL` - OAuth issuer URL (defaults to "https://replit.com/oidc")

### Optional Variables (Email Service)
- `SENDGRID_API_KEY` - SendGrid API key for email verification (if not provided, verification codes will be logged to console)

## Authentication Modes

### 1. Replit Authentication (Recommended for Replit Deployments)
When `REPL_ID` and `REPLIT_DOMAINS` are provided, the application uses Replit's OAuth for user authentication.

Required environment variables:
```
REPL_ID=your-repl-id
REPLIT_DOMAINS=your-app-domain.replit.app,custom-domain.com
SESSION_SECRET=your-secure-session-secret
```

### 2. Guest Mode (Fallback for External Deployments)
When Replit authentication variables are missing, the application automatically falls back to guest mode:
- Users are automatically logged in as "Guest User"
- Full application functionality is available
- No external authentication required
- Suitable for public demos or when setting up custom authentication

Required environment variables:
```
SESSION_SECRET=your-secure-session-secret
```

## Deployment Steps

### 1. On Replit
1. Set the required environment variables in Replit Secrets:
   - `DATABASE_URL` (auto-created if using Replit Database)
   - `SESSION_SECRET`
   - `SENDGRID_API_KEY` (optional, for email verification)
2. Click the "Deploy" button in your Repl
3. The application will automatically detect Replit environment and enable OAuth

### 2. On External Platforms (Cloud Run, Heroku, etc.)
1. Set up a PostgreSQL database
2. Set required environment variables:
   - `DATABASE_URL` - your PostgreSQL connection string
   - `SESSION_SECRET` - secure random string for session encryption
   - `SENDGRID_API_KEY` - your SendGrid API key (optional)
3. Optionally set Replit auth variables if you have them
4. Deploy the application
5. The app will automatically run in guest mode if Replit auth is not configured

## Database Setup

The application uses Drizzle ORM with PostgreSQL. Run the following to set up the database:

```bash
npm run db:push
```

## Port Configuration

The application automatically detects the port from:
1. `PORT` environment variable (for Cloud Run, Heroku, etc.)
2. Falls back to `8080` for local development

## Security Notes

1. Always use a strong, unique `SESSION_SECRET` in production
2. Enable HTTPS in production (handled automatically by most cloud platforms)
3. Guest mode provides full functionality but doesn't provide user isolation
4. For production use with multiple users, consider implementing proper authentication

## Troubleshooting

### "Authentication service not configured" errors
This occurs when:
- Replit auth variables are partially configured (missing either `REPL_ID` or `REPLIT_DOMAINS`)
- The Replit OIDC service is unreachable

**Solution**: Either provide both Replit auth variables or remove them entirely to use guest mode.

### Database connection errors
Ensure your `DATABASE_URL` is correct and the database is accessible from your deployment environment.

### Session issues
If users can't maintain sessions, check that `SESSION_SECRET` is set and consistent across deployments.