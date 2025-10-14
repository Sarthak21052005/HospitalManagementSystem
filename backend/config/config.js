// config/config.js
require('dotenv').config();

module.exports = {
  server: {
    port: process.env.PORT || 5000,
    environment: process.env.NODE_ENV || 'development'
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
  },
  
  session: {
    secret: process.env.SESSION_SECRET || 'hospital-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' // true in production
    }
  },
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password@123',
    database: process.env.DB_NAME || 'HospitalManagement'
  }
};
