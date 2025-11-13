# Huntr AI - AI-Powered Trading Signal Platform

Huntr AI is a complete full-stack application that analyzes trading chart images using Gemini 2.5 Pro and provides real-time trading signals with entry points, take profits, and stop losses.

## 🚀 Features

- **AI Chart Analysis**: Advanced image analysis using Gemini 2.5 Pro
- **Real-time Web Search**: Enhanced analysis with current market data via Serper.dev
- **Trading Signals**: BUY/SELL/HOLD signals with specific entry/exit points
- **Mobile-First Design**: React Native with web support via Expo
- **User Management**: Complete authentication and profile system
- **Analysis History**: Track and manage past analyses with filtering
- **Privacy Controls**: Opt-out of data training with granular settings
- **Dual Database**: Separate user data and AI training databases

## 🛠 Tech Stack

### Backend
- **Node.js** with Express
- **MongoDB** (dual database setup)
- **Gemini 2.5 Pro API** for AI analysis
- **Serper.dev API** for web search
- **JWT Authentication**
- **Multer** for file uploads
- **Sharp** for image processing

### Frontend
- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for routing
- **Context API** for state management
- **Linear Gradient** for UI effects
- **Async Storage** for persistence

### Deployment
- **Vercel** for full-stack deployment
- **MongoDB Atlas** for cloud databases

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas account (2 databases)
- Gemini API key
- Serper.dev API key

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd huntr-ai
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   # Database Configuration
   MONGODB_URI_USERS=mongodb+srv://username:password@cluster.mongodb.net/huntr-users
   MONGODB_URI_TRAINING=mongodb+srv://username:password@cluster.mongodb.net/huntr-training

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d

   # API Keys
   GEMINI_API_KEY=your-gemini-api-key-here
   SERPER_API_KEY=your-serper-api-key-here

   # Application Configuration
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

4. **Development setup**
   ```bash
   # Start backend
   cd api && npm run dev

   # Start mobile app (new terminal)
   cd mobile && npm start
   ```

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   ```bash
   npx vercel
   ```

2. **Set environment variables** in Vercel dashboard:
   - All variables from `.env.example`
   - Set `NODE_ENV=production`
   - Update `FRONTEND_URL` to your Vercel domain

3. **Deploy**
   ```bash
   npx vercel --prod
   ```

### Database Setup

1. **Create MongoDB Atlas clusters**:
   - `huntr-users` - User accounts, profiles, settings
   - `huntr-training` - AI analysis data, training datasets

2. **Configure network access** to allow Vercel IPs

3. **Set up indexes** for optimal performance:
   ```javascript
   // Users database
   db.users.createIndex({ email: 1 }, { unique: true })
   db.users.createIndex({ username: 1 }, { unique: true })
   
   // Training database
   db.trainingdatas.createIndex({ imageHash: 1 }, { unique: true })
   db.trainingdatas.createIndex({ "source.userId": 1 })
   db.trainingdatas.createIndex({ createdAt: -1 })
   ```

## 📱 Mobile App Configuration

### For Development
```bash
cd mobile
npm start
# Choose your platform: iOS, Android, or Web
```

### For Production Build
```bash
cd mobile
# Web build (for Vercel)
npm run build:web

# Mobile builds
expo build:android
expo build:ios
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/settings` - Update settings

### Analysis
- `POST /api/analysis/chart` - Analyze chart image
- `GET /api/analysis/history` - Get analysis history
- `GET /api/analysis/statistics` - Get user statistics
- `POST /api/analysis/feedback/:id` - Submit feedback

### User Management
- `GET /api/user/analysis-history` - Detailed history
- `DELETE /api/user/clear-history` - Clear all history
- `DELETE /api/auth/account` - Delete account

## 🛡 Security Features

- **Rate Limiting**: Per-user and global rate limits
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Comprehensive request validation
- **File Upload Security**: Type and size restrictions
- **Privacy Controls**: Data training opt-out
- **Secure Deletion**: Complete data removal on account deletion

## 📊 AI Analysis Pipeline

1. **Image Upload**: Secure file handling with validation
2. **Image Processing**: Sharp optimization for AI analysis
3. **Gemini Analysis**: Advanced pattern recognition and technical analysis
4. **Web Search Enhancement**: Real-time market data integration
5. **Signal Generation**: Actionable trading recommendations
6. **Training Data**: Optional contribution to model improvement

## 🎨 UI/UX Features

- **Dynamic Theming**: Light/dark mode support
- **Touch Optimized**: Mobile-first interaction design
- **No Emoji Icons**: Professional icon system using SVG
- **Responsive Design**: Adapts to all screen sizes
- **Smooth Animations**: Linear gradients and transitions
- **Accessibility**: Screen reader compatible

## 🔄 Development Workflow

```bash
# Backend development
cd api && npm run dev

# Mobile development  
cd mobile && npm start

# Full stack testing
npm run dev  # Starts both backend and mobile

# Production build
npm run build
```

## 📈 Performance Optimizations

- **Image Compression**: Automatic optimization for analysis
- **Caching**: MongoDB connection pooling
- **Rate Limiting**: Prevents API abuse
- **Lazy Loading**: Optimized component rendering
- **Error Boundaries**: Graceful error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review environment setup

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify MongoDB URI format
   - Check network access settings
   - Ensure database names are correct

2. **API Key Issues**
   - Verify Gemini API key is valid
   - Check Serper.dev API quota
   - Ensure environment variables are set

3. **Mobile App Issues**
   - Clear Expo cache: `expo r -c`
   - Check Node.js version compatibility
   - Verify package installations

4. **Deployment Issues**
   - Check Vercel environment variables
   - Verify build settings
   - Monitor deployment logs

---

**Huntr AI** - Intelligent trading analysis at your fingertips 🎯