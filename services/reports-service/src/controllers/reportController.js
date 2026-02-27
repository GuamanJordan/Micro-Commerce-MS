const Sale = require('../models/Sale');
const ProductSummary = require('../models/ProductSummary');
const { sequelize } = require('../config/database');

// POST /api/reports/sync (recibe datos de Orders Service)
exports.syncOrder = async (req, res) => {
    try {
        const { order } = req.body;

        // Guardar cada item como venta individual
        for (const item of order.items) {
            await Sale.create({
                order_id: order.orderId,
                user_id: order.userId,
                product_name: item.name,
                quantity: item.quantity,
                unit_price: item.price,
                total_amount: item.subtotal,
                order_date: order.orderDate || new Date()
            });

            // Actualizar resumen de producto
            const [summary, created] = await ProductSummary.findOrCreate({
                where: { product_id: item.productId },
                defaults: {
                    product_name: item.name,
                    total_sold: item.quantity,
                    total_revenue: item.subtotal
                }
            });

            if (!created) {
                summary.total_sold += item.quantity;
                summary.total_revenue = parseFloat(summary.total_revenue) + item.subtotal;
                summary.last_updated = new Date();
                await summary.save();
            }
        }

        res.json({ message: 'Datos sincronizados exitosamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al sincronizar.', error: error.message });
    }
};

// GET /api/reports/sales
exports.getSalesReport = async (req, res) => {
    try {
        const sales = await Sale.findAll({ order: [['order_date', 'DESC']], limit: 100 });
        const totalRevenue = await Sale.sum('total_amount');
        const totalOrders = await Sale.count({ distinct: true, col: 'order_id' });

        res.json({ sales, totalRevenue: totalRevenue || 0, totalOrders });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener reporte.', error: error.message });
    }
};

// GET /api/reports/top-products
exports.getTopProducts = async (req, res) => {
    try {
        const products = await ProductSummary.findAll({
            order: [['total_sold', 'DESC']],
            limit: 10
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener top productos.', error: error.message });
    }
};

// GET /api/reports/revenue
exports.getTotalRevenue = async (req, res) => {
    try {
        const totalRevenue = await Sale.sum('total_amount');
        const totalSales = await Sale.count();
        res.json({ totalRevenue: totalRevenue || 0, totalSales });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener ingresos.', error: error.message });
    }
};
