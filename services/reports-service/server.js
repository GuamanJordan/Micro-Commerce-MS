const app = require('./src/app');
const { sequelize } = require('./src/config/database');
require('dotenv').config();

const PORT = process.env.PORT || 3005;

const start = async () => {
    try {
        await sequelize.authenticate();
        console.log('📦 MySQL conectado - Reports Service');
        await sequelize.sync(); // Crea tablas si no existen
        app.listen(PORT, () => {
            console.log(`✅ Reports Service corriendo en puerto ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error conectando MySQL:', error.message);
        process.exit(1);
    }
};

start();
