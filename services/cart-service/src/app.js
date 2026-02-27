const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cartRoutes = require('./routes/cartRoutes');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/cart', cartRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'cart-service' });
});

module.exports = app;