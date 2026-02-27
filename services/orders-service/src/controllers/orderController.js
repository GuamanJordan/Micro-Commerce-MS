const Order = require('../models/Order');
const axios = require('axios');

const CART_URL = process.env.CART_SERVICE_URL || 'http://localhost:3003';
const PRODUCTS_URL = process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3002';
const REPORTS_URL = process.env.REPORTS_SERVICE_URL || 'http://localhost:3005';

// Generar número de orden único
const generateOrderNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
};

// POST /api/orders (Crear pedido desde carrito)
exports.createOrder = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const { shippingAddress } = req.body;

        // 1. Obtener carrito
        const { data: cart } = await axios.get(`${CART_URL}/api/cart`, {
            headers: { 'x-user-id': userId }
        });

        if (!cart.items || cart.items.length === 0) {
            return res.status(400).json({ message: 'El carrito está vacío.' });
        }

        // 2. Descontar stock de cada producto
        for (const item of cart.items) {
            await axios.put(`${PRODUCTS_URL}/api/products/${item.productId}/stock`, {
                quantity: item.quantity
            });
        }

        // 3. Crear orden
        const order = new Order({
            userId,
            orderNumber: generateOrderNumber(),
            items: cart.items,
            totalAmount: cart.totalPrice,
            shippingAddress,
            paymentStatus: 'pagado' // Simulado
        });

        await order.save();

        // 4. Vaciar carrito
        await axios.delete(`${CART_URL}/api/cart`, {
            headers: { 'x-user-id': userId }
        });

        // 5. Sincronizar con Reports (no bloquear si falla)
        try {
            await axios.post(`${REPORTS_URL}/api/reports/sync`, {
                order: {
                    orderId: order._id,
                    userId: order.userId,
                    items: order.items,
                    totalAmount: order.totalAmount,
                    orderDate: order.createdAt
                }
            });
        } catch (syncError) {
            console.log('⚠️ Error sincronizando con Reports:', syncError.message);
        }

        res.status(201).json({
            message: 'Pedido creado exitosamente.',
            orderNumber: order.orderNumber,
            order
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear pedido.', error: error.message });
    }
};

// GET /api/orders/my-orders
exports.getMyOrders = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener pedidos.', error: error.message });
    }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener pedido.', error: error.message });
    }
};

// GET /api/orders (Admin - todos los pedidos)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener pedidos.', error: error.message });
    }
};

// PUT /api/orders/:id/status (Admin)
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!order) {
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }
        res.json({ message: 'Estado actualizado.', order });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar estado.', error: error.message });
    }
};
