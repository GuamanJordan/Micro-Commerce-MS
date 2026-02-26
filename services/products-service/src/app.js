const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const productRoutes = require('./routes/productRoutes');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/products', productRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'products-service' });
});

module.exports = app;