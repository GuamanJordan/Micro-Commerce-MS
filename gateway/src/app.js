const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { authMiddleware } = require('./middlewares/auth');
require('dotenv').config();

const app = express();

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100
});

app.use(cors());
app.use(morgan('dev'));
app.use(limiter);
app.use(express.json());

// ==================== PROXY ROUTES ====================

// Users Service - Rutas públicas (register, login)
app.use('/api/users/register', createProxyMiddleware({
    target: process.env.USERS_SERVICE_URL,
    changeOrigin: true
}));

app.use('/api/users/login', createProxyMiddleware({
    target: process.env.USERS_SERVICE_URL,
    changeOrigin: true
}));

// Users Service - Rutas protegidas
app.use('/api/users', authMiddleware, (req, res, next) => {
    // Inyectar user info en headers para los servicios
    req.headers['x-user-id'] = req.user.id;
    req.headers['x-user-role'] = req.user.role;
    next();
}, createProxyMiddleware({
    target: process.env.USERS_SERVICE_URL,
    changeOrigin: true
}));

// Products Service - Rutas públicas (GET)
app.use('/api/products', (req, res, next) => {
    if (req.method === 'GET') {
        return next();
    }
    // POST, PUT, DELETE requieren auth
    authMiddleware(req, res, () => {
        req.headers['x-user-id'] = req.user.id;
        req.headers['x-user-role'] = req.user.role;
        next();
    });
}, createProxyMiddleware({
    target: process.env.PRODUCTS_SERVICE_URL,
    changeOrigin: true
}));

// Cart Service - Todo protegido
app.use('/api/cart', authMiddleware, (req, res, next) => {
    req.headers['x-user-id'] = req.user.id;
    next();
}, createProxyMiddleware({
    target: process.env.CART_SERVICE_URL,
    changeOrigin: true
}));

// Orders Service - Todo protegido
app.use('/api/orders', authMiddleware, (req, res, next) => {
    req.headers['x-user-id'] = req.user.id;
    req.headers['x-user-role'] = req.user.role;
    next();
}, createProxyMiddleware({
    target: process.env.ORDERS_SERVICE_URL,
    changeOrigin: true
}));

// Reports Service - Solo admin
app.use('/api/reports', authMiddleware, (req, res, next) => {
    if (req.user.role !== 'admin' && req.method === 'GET') {
        return res.status(403).json({ message: 'Solo administradores.' });
    }
    next();
}, createProxyMiddleware({
    target: process.env.REPORTS_SERVICE_URL,
    changeOrigin: true
}));

// Health check del Gateway
app.get('/health', async (req, res) => {
    res.json({
        status: 'OK',
        service: 'api-gateway',
        timestamp: new Date().toISOString()
    });
});

module.exports = app;
