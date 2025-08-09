# Deployment Instructions for AthletePro

Your webapp is now ready to deploy to Vercel (free hosting). Follow these steps:

## Prerequisites
1. Create a free Vercel account at [vercel.com](https://vercel.com)
2. Install Vercel CLI: `npm install -g vercel`

## Deployment Steps

### 1. Install Vercel CLI and Login
```bash
npm install -g vercel
vercel login
```

### 2. Deploy to Vercel
From your project root directory, run:
```bash
vercel --prod
```

### 3. Set Environment Variables
After deployment, you need to configure environment variables in Vercel:

Go to your Vercel dashboard → Your Project → Settings → Environment Variables

Add these variables:
- `DATABASE_URL`: `postgresql://neondb_owner:npg_E5IBRZgNxFf8@ep-odd-shape-aft8b8e5-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
- `SESSION_SECRET`: Generate a secure random string (use: `openssl rand -base64 32`)
- `NODE_ENV`: `production`
- `REPL_ID`: `athletepro-production`

### 4. Update Domain References
After deployment, Vercel will give you a domain like `your-app-name.vercel.app`.

Update these environment variables with your actual domain:
- `ISSUER_URL`: `https://your-app-name.vercel.app`
- `REPLIT_DOMAINS`: `your-app-name.vercel.app`

### 5. Redeploy
After setting environment variables, trigger a new deployment:
```bash
vercel --prod
```

## Alternative: Deploy via Git

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Vercel will auto-deploy on every push to main branch

## Database Setup
Your Neon database is already configured. Make sure your database schema is up to date:
```bash
npm run db:push
```

## Free Domain Options

### Vercel (Recommended)
- **Domain**: your-app-name.vercel.app
- **Cost**: Free
- **Features**: Global CDN, automatic HTTPS, instant deployments

### Alternative Free Options

1. **Netlify** - netlify.app subdomain
2. **Railway** - railway.app subdomain  
3. **Render** - render.com subdomain

## Post-Deployment Checklist

- [ ] App loads successfully at your domain
- [ ] Database connection works
- [ ] Authentication flow works
- [ ] All API endpoints respond correctly
- [ ] Static assets load properly

## Troubleshooting

### Common Issues:
1. **Build fails**: Check build logs in Vercel dashboard
2. **Database connection fails**: Verify DATABASE_URL environment variable
3. **404 errors**: Check vercel.json routing configuration
4. **Authentication issues**: Verify all auth-related environment variables

### Environment Variables to Double-Check:
- DATABASE_URL (must match your production Neon database)
- SESSION_SECRET (must be set for production)
- NODE_ENV (must be "production")

Your app should now be live at your Vercel domain! 🚀
