# Huntr AI - AI-Powered Trading Signal Platform

Huntr AI is a complete full-stack application that analyzes trading chart images using Gemini 2.5 Pro and provides real-time trading signals with entry points, take profits, and stop losses.

## 🚀 Features

### User Features
- **AI Chart Analysis**: Advanced image analysis using Gemini 2.5 Pro
- **Real-time Web Search**: Enhanced analysis with current market data via Serper.dev
- **Trading Signals**: BUY/SELL/HOLD signals with specific entry/exit points
- **Responsive Design**: Desktop sidebar navigation, mobile bottom tabs
- **Premium Subscriptions**: Daily analysis limits (1 free, 5 premium)
- **Analysis History**: Track and manage past analyses with filtering
- **Privacy Controls**: Opt-out of data training with granular settings
- **Popup Notifications**: Receive customized announcements from admins

### Admin Features
- **WhatsApp-Style Admin Panel**: Quick action header with dropdown menu
- **User Management**: View, manage, and monitor all users
- **Payment Configuration**: Set premium pricing, limits, and bank details
- **Popup Message System**: Send customized announcements with live preview
- **Site Configuration**: Manage logos, contact info, and blog content
- **Analytics Dashboard**: Track usage statistics and revenue
- **Database Management**: Initialize and manage database connections

### Technical Features
- **Triple Database Architecture**: Separate databases for users, training data, and media
- **Mobile-First Design**: React Native with web support via Expo
- **SVG Icon System**: Professional icons throughout (no emojis)
- **Automatic Subscription Management**: Auto-downgrade expired premium users

## 🛠 Tech Stack

### Backend
- **Node.js** with Express
- **MongoDB** (triple database: users, training, media)
- **Gemini 2.5 Pro API** for AI analysis
- **Serper.dev API** for web search
- **JWT Authentication** with role-based access
- **Multer** for file uploads
- **Sharp** for image processing
- **Notification System** for user alerts

### Frontend
- **React Native** with Expo (iOS, Android, Web)
- **TypeScript** for type safety
- **React Navigation** for routing
- **Context API** for state management
- **Responsive Navigation**: Sidebar (desktop) + Bottom tabs (mobile)
- **Linear Gradient** for UI effects
- **Async Storage** for persistence
- **SVG Icons** for professional UI

### Deployment
- **Vercel** for full-stack deployment
- **MongoDB Atlas** for cloud databases

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas account (3 databases)
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
   MONGODB_URI_USERS=mongodb+srv://username:password@cluster.mongodb.net/users
   MONGODB_URI_TRAINING=mongodb+srv://username:password@cluster.mongodb.net/training
   MONGODB_URI_MEDIA=mongodb+srv://username:password@cluster.mongodb.net/media

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d

   # API Keys
   GEMINI_API_KEY=your-gemini-api-key-here
   SERPER_API_KEY=your-serper-api-key-here

   # Application Configuration
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   PORT=3001
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

1. **Create MongoDB Atlas databases**:
   - `users` - User accounts, profiles, settings, popup messages, payment config
   - `training` - AI analysis data, training datasets
   - `media` - Logos, images, blog content

2. **Configure network access** to allow Vercel IPs

3. **Set up indexes** for optimal performance:
   ```javascript
   // Users database
   db.users.createIndex({ email: 1 }, { unique: true })
   db.users.createIndex({ username: 1 }, { unique: true })
   db.users.createIndex({ role: 1 })
   db.popupmessages.createIndex({ isActive: 1 })
   db.popupmessages.createIndex({ createdAt: -1 })
   
   // Training database
   db.trainingdatas.createIndex({ imageHash: 1 }, { unique: true })
   db.trainingdatas.createIndex({ "source.userId": 1 })
   db.trainingdatas.createIndex({ createdAt: -1 })
   
   // Media database
   db.logos.createIndex({ type: 1 })
   db.blogs.createIndex({ createdAt: -1 })
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
- `DELETE /api/auth/account` - Delete account

### Analysis
- `POST /api/analysis/chart` - Analyze chart image (v1)
- `POST /api/analysisv2/chart` - Analyze chart image (v2)
- `GET /api/analysis/history` - Get analysis history
- `GET /api/analysis/statistics` - Get user statistics
- `GET /api/analysis/usage` - Get usage limits
- `POST /api/analysis/feedback/:id` - Submit feedback

### Payment
- `GET /api/payment/config` - Get payment configuration
- `POST /api/payment/verify` - Verify payment
- `GET /api/payment/subscription` - Get subscription status

### Popup Messages
- `GET /api/popup-messages/active` - Get active unseen message
- `POST /api/popup-messages/seen/:id` - Mark message as seen
- `GET /api/popup-messages/admin/all` - Get all messages (admin)
- `POST /api/popup-messages/admin/create` - Create message (admin)
- `DELETE /api/popup-messages/admin/:id` - Delete message (admin)
- `PATCH /api/popup-messages/admin/:id/toggle` - Toggle active status (admin)

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Get platform statistics
- `POST /api/admin/payment-config` - Update payment config
- `GET /api/admin/payment-config` - Get payment config
- `POST /api/admin/contact-config` - Update contact config
- `GET /api/admin/contact-config` - Get contact config

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

- **Responsive Navigation**: Desktop sidebar (collapsible) + mobile bottom tabs
- **Dynamic Theming**: Light/dark mode support
- **Touch Optimized**: Mobile-first interaction design
- **Professional SVG Icons**: No emojis, clean icon system
- **WhatsApp-Style Admin**: Quick action header with dropdown menu
- **Live Preview**: Real-time customization preview for popup messages
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
- **Usage Limits**: Daily analysis limits (1 free, 5 premium)
- **Automatic Resets**: Daily analysis counter resets at midnight
- **Subscription Management**: Auto-downgrade expired premium users
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
   - Verify MongoDB URI format for all 3 databases
   - Check network access settings
   - Ensure database names are correct (users, training, media)

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