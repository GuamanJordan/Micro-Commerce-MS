const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/reports', reportRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'reports-service' });
});

module.exports = app;
