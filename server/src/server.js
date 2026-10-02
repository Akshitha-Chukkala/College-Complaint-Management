const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const config = require('./config/env');
const { connectDB } = require('./config/db');
const { initSocket } = require('./config/socket');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');

const app = express();
const httpServer = http.createServer(app);

// Initialize Socket.IO
const io = initSocket(httpServer, config.CLIENT_URL);
// Make io accessible on req if needed
app.set('io', io);

// Security & utility middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: config.CLIENT_URL,
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiting for auth routes to prevent brute-force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

// Ensure local uploads directory exists
const uploadsDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// System Health Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'CampusResolve API',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV
  });
});

// Mount Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/complaints', complaintRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start Server after connecting to Database
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed default accounts if database is empty
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Database] Database is empty. Auto-seeding demo accounts...');
      await User.create([
        {
          name: 'Chief Campus Administrator',
          email: 'admin@campusresolve.edu',
          password: 'Admin@123',
          role: 'admin',
          department: 'Campus Administration',
          studentId: ''
        },
        {
          name: 'Alex Johnson',
          email: 'student@campusresolve.edu',
          password: 'Student@123',
          role: 'student',
          department: 'Computer Science',
          studentId: 'STU-2026-001'
        },
        {
          name: 'Michael Davis',
          email: 'hostel.staff@campusresolve.edu',
          password: 'Staff@123',
          role: 'staff',
          department: 'Hostel Affairs',
          studentId: ''
        }
      ]);
      console.log('[Database] Demo accounts auto-seeded: admin@campusresolve.edu, student@campusresolve.edu, hostel.staff@campusresolve.edu');
    }

    httpServer.listen(config.PORT, () => {
      console.log(`\n==================================================`);
      console.log(`🚀 CampusResolve API Server running on port ${config.PORT}`);
      console.log(`📡 Environment: ${config.NODE_ENV}`);
      console.log(`🌐 Allowed Client URL: ${config.CLIENT_URL}`);
      console.log(`==================================================\n`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, httpServer };
