const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/orders', orderRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'orders-service' });
});

module.exports = app;
