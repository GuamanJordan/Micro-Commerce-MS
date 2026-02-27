const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Ì≥¶ MongoDB conectado - Users Service');
  } catch (error) {
    console.error('‚ùå Error conectando MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
