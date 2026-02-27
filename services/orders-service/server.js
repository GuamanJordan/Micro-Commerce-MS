const app = require('./src/app');
const connectDB = require('./src/config/database');
require('dotenv').config();

const PORT = process.env.PORT || 3004;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Orders Service corriendo en puerto ${PORT}`);
    });
});
