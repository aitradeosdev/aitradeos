# Huntr AI Deployment Guide

This guide covers the complete deployment process for Huntr AI on Vercel with MongoDB Atlas.

## 🚀 Quick Deployment Checklist

### Prerequisites
- [ ] MongoDB Atlas account with 2 clusters created
- [ ] Gemini API key obtained
- [ ] Serper.dev API key obtained
- [ ] Vercel account connected to GitHub
- [ ] Node.js 18+ installed locally

### Step 1: Database Setup

1. **Create MongoDB Atlas Clusters**
   ```
   Cluster 1: huntr-users
   - Purpose: User accounts, profiles, settings, analysis history
   
   Cluster 2: huntr-training  
   - Purpose: AI training data, performance metrics
   ```

2. **Configure Network Access**
   - Add `0.0.0.0/0` for Vercel deployment
   - Or add specific Vercel IP ranges for better security

3. **Create Database Users**
   ```
   Username: huntr-api
   Password: [Generate strong password]
   Roles: readWrite on both databases
   ```

4. **Get Connection Strings**
   ```
   MONGODB_URI_USERS=mongodb+srv://huntr-api:[password]@cluster0.mongodb.net/huntr-users
   MONGODB_URI_TRAINING=mongodb+srv://huntr-api:[password]@cluster1.mongodb.net/huntr-training
   ```

### Step 2: API Keys Setup

1. **Google AI Studio (Gemini)**
   - Go to https://aistudio.google.com/
   - Create new API key
   - Copy key for `GEMINI_API_KEY`

2. **Serper.dev**
   - Sign up at https://serper.dev/
   - Get free API key (2,500 searches/month)
   - Copy key for `SERPER_API_KEY`

### Step 3: Local Development Setup

1. **Clone and Install**
   ```bash
   git clone [your-repo-url]
   cd huntr-ai
   npm run install-all
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your values:
   ```env
   # Database Configuration
   MONGODB_URI_USERS=mongodb+srv://huntr-api:[password]@cluster0.mongodb.net/huntr-users
   MONGODB_URI_TRAINING=mongodb+srv://huntr-api:[password]@cluster1.mongodb.net/huntr-training

   # JWT Configuration (Generate strong random string)
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
   JWT_EXPIRES_IN=7d

   # API Keys
   GEMINI_API_KEY=your-gemini-api-key-here
   SERPER_API_KEY=your-serper-api-key-here

   # Application Configuration
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

3. **Test Local Development**
   ```bash
   # Terminal 1: Backend
   cd api && npm run dev

   # Terminal 2: Frontend
   cd mobile && npm start
   ```

### Step 4: Vercel Deployment

1. **Connect Repository to Vercel**
   - Push code to GitHub
   - Import project in Vercel dashboard
   - Connect to your repository

2. **Configure Build Settings**
   ```
   Framework Preset: Other
   Build Command: npm run build
   Output Directory: mobile/web-build
   Install Command: npm run install-all
   ```

3. **Set Environment Variables in Vercel**
   ```
   MONGODB_URI_USERS=[your-users-db-uri]
   MONGODB_URI_TRAINING=[your-training-db-uri]
   JWT_SECRET=[your-jwt-secret]
   JWT_EXPIRES_IN=7d
   GEMINI_API_KEY=[your-gemini-key]
   SERPER_API_KEY=[your-serper-key]
   NODE_ENV=production
   FRONTEND_URL=[your-vercel-domain]
   ```

4. **Deploy**
   ```bash
   # Via Vercel CLI (optional)
   npx vercel --prod
   
   # Or push to main branch for automatic deployment
   git push origin main
   ```

### Step 5: Post-Deployment Configuration

1. **Update Frontend URL**
   - After first deployment, get Vercel domain
   - Update `FRONTEND_URL` environment variable
   - Redeploy if needed

2. **Test API Endpoints**
   ```bash
   curl https://your-domain.vercel.app/api/health
   ```

3. **Test Mobile App**
   - Update API_BASE_URL in `mobile/src/services/apiService.ts`
   - Test web version at your Vercel domain
   - Test mobile apps with new API endpoint

## 🔧 Advanced Configuration

### Custom Domain Setup

1. **Add Custom Domain in Vercel**
   - Go to Project Settings > Domains
   - Add your custom domain
   - Configure DNS records

2. **Update Environment Variables**
   ```env
   FRONTEND_URL=https://your-custom-domain.com
   ```

### SSL and Security

- SSL is automatically handled by Vercel
- Consider adding custom security headers in `vercel.json`
- Monitor with Vercel Analytics

### Database Optimization

1. **Create Indexes for Better Performance**
   ```javascript
   // Connect to huntr-users database
   db.users.createIndex({ "email": 1 }, { unique: true })
   db.users.createIndex({ "username": 1 }, { unique: true })
   db.users.createIndex({ "createdAt": -1 })
   
   // Connect to huntr-training database  
   db.trainingdatas.createIndex({ "imageHash": 1 }, { unique: true })
   db.trainingdatas.createIndex({ "source.userId": 1 })
   db.trainingdatas.createIndex({ "createdAt": -1 })
   db.trainingdatas.createIndex({ "chartAnalysis.symbol": 1, "chartAnalysis.marketType": 1 })
   ```

2. **Set Up Database Monitoring**
   - Enable MongoDB Atlas monitoring
   - Set up alerts for connection issues
   - Monitor query performance

## 🚨 Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   ```bash
   # Check build logs in Vercel dashboard
   # Common fixes:
   - Ensure all dependencies are in package.json
   - Check Node.js version compatibility
   - Verify environment variables are set
   ```

2. **Database Connection Issues**
   ```bash
   # Symptoms: 500 errors on API calls
   # Fixes:
   - Verify MongoDB Atlas network access
   - Check connection string format
   - Test connection from local environment
   ```

3. **API Key Issues**
   ```bash
   # Symptoms: Analysis fails, search doesn't work
   # Fixes:
   - Verify API keys are correct
   - Check API usage limits
   - Test keys independently
   ```

4. **CORS Issues**
   ```bash
   # Symptoms: Frontend can't connect to API
   # Fixes:
   - Check FRONTEND_URL environment variable
   - Verify CORS configuration in api/index.js
   - Test with browser dev tools
   ```

### Performance Monitoring

1. **Vercel Analytics**
   - Enable in Vercel dashboard
   - Monitor page load times
   - Track user interactions

2. **Database Performance**
   - Use MongoDB Atlas performance advisor
   - Monitor slow queries
   - Check index usage

3. **API Response Times**
   - Monitor Gemini API latency
   - Check Serper.dev response times
   - Implement proper error handling

### Scaling Considerations

1. **Rate Limiting**
   - Current: 100 requests per 15 minutes per IP
   - Adjust based on usage patterns
   - Consider user-based rate limiting

2. **File Upload Limits**
   - Current: 10MB per image
   - Consider CDN for large files
   - Implement image compression

3. **Database Scaling**
   - MongoDB Atlas auto-scaling available
   - Consider read replicas for high traffic
   - Monitor connection pool usage

## 🔐 Security Best Practices

1. **Environment Variables**
   - Never commit secrets to repository
   - Use different keys for development/production
   - Rotate keys regularly

2. **Database Security**
   - Use specific IP allowlists when possible
   - Enable MongoDB Atlas encryption
   - Regular security updates

3. **API Security**
   - Implement proper rate limiting
   - Validate all inputs
   - Monitor for suspicious activity

## 📊 Monitoring and Maintenance

### Regular Tasks
- [ ] Monitor API usage and costs
- [ ] Check database performance metrics
- [ ] Review error logs weekly
- [ ] Update dependencies monthly
- [ ] Backup critical data

### Health Checks
- [ ] API endpoint responsiveness
- [ ] Database connectivity
- [ ] External API availability
- [ ] Mobile app functionality

---

For additional support, refer to the main README.md or create an issue in the repository.