const app = require('./src/app');
const connectDB = require('./src/config/database');
require('dotenv').config();

const PORT = process.env.PORT || 3002;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Products Service corriendo en puerto ${PORT}`);
    });
});