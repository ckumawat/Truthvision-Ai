/**
 * Production Configuration
 * Load environment variables and configure application for production
 */

require('dotenv').config();

module.exports = {
    // Server Configuration
    server: {
        port: process.env.PORT || 3002,
        host: process.env.HOST || 'localhost',
        nodeEnv: process.env.NODE_ENV || 'development',
        isProduction: process.env.NODE_ENV === 'production'
    },

    // Database Configuration
    database: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'truthvision',
        port: process.env.DB_PORT || 3306,
        connectionLimit: 10,
        waitForConnections: true,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelayMs: 0
    },

    // Upload Configuration
    upload: {
        directory: process.env.UPLOAD_DIR || './uploads',
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || 52428800), // 50MB
        allowedMimeTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'video/mp4',
            'video/mpeg',
            'video/quicktime'
        ]
    },

    // API Configuration
    api: {
        timeout: parseInt(process.env.API_TIMEOUT || 30000),
        corsOrigin: process.env.CORS_ORIGIN || '*',
        rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
        rateLimitMaxRequests: 100 // per window
    },

    // Logging Configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: './logs/app.log',
        maxSize: '10m',
        maxFiles: 5
    },

    // Session Configuration
    session: {
        secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
        expiryMs: 24 * 60 * 60 * 1000 // 24 hours
    },

    // Security Configuration
    security: {
        enableHSTS: true,
        enableCSRF: true,
        enableCORS: true,
        enableCompression: true,
        enableHelmet: true
    }
};
