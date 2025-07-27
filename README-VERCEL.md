# VendorMate - Vercel Deployment Guide

## Prerequisites
1. Vercel account (sign up at vercel.com)
2. PostgreSQL database (Neon, Supabase, or other)
3. GitHub repository with your code

## Deployment Steps

### 1. Prepare Your Database
Set up a PostgreSQL database (recommended: Neon Database):
```bash
# Get your DATABASE_URL from your database provider
# Example: postgresql://username:password@host:5432/database?sslmode=require
```

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel --prod
```

#### Option B: Using Vercel Dashboard
1. Go to vercel.com and connect your GitHub repository
2. Import your project
3. Set build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3. Environment Variables
In your Vercel dashboard, add these environment variables:

- `DATABASE_URL`: Your PostgreSQL connection string
- `NODE_ENV`: `production`

### 4. Push Database Schema
After deployment, run the schema push:
```bash
# Install dependencies locally
npm install

# Set your DATABASE_URL locally
export DATABASE_URL="your_database_url_here"

# Push schema to database
npm run db:push
```

## Important Notes

### Serverless Functions
The app has been restructured for Vercel's serverless architecture:
- API routes are in `/api/` directory
- Each API endpoint is a separate serverless function
- WebSocket functionality will need to be replaced with polling or external service

### Limitations on Vercel
1. **No WebSockets**: Real-time chat will need polling or external service (Pusher, Ably)
2. **Function Timeout**: 10s for Hobby plan, 60s for Pro
3. **Cold Starts**: First request may be slower

### Alternative: Full-Stack Hosting
For full WebSocket support, consider:
- Railway.app
- Render.com
- Fly.io
- DigitalOcean App Platform

## File Structure for Vercel
```
/
├── api/                 # Serverless functions
│   ├── vendors.js      # Vendor management API
│   └── inventory.js    # Inventory management API
├── client/             # React frontend
├── shared/             # Shared schemas
├── dist/               # Built frontend (generated)
├── vercel.json         # Vercel configuration
└── package.json
```

## Testing Deployment
After deployment, test these endpoints:
- `GET /api/vendors/VM1234` - Get vendor info
- `POST /api/vendors/register` - Register new vendor
- `GET /api/vendors/VM1234/inventory` - Get inventory
- `POST /api/vendors/VM1234/inventory` - Add inventory item

Your app will be available at: `https://your-project-name.vercel.app`