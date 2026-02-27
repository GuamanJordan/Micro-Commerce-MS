const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductSummary = sequelize.define('ProductSummary', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    product_id: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    product_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    total_sold: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    total_revenue: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
    },
    last_updated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'product_summary',
    timestamps: false
});

module.exports = ProductSummary;
