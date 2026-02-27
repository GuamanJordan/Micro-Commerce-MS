const Cart = require('../models/Cart');
const axios = require('axios');

const PRODUCTS_URL = process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3002';

// GET /api/cart
exports.getCart = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
            await cart.save();
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener carrito.', error: error.message });
    }
};

// POST /api/cart/add
exports.addItem = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const { productId, quantity } = req.body;

        // Validar producto y stock
        const { data: product } = await axios.get(`${PRODUCTS_URL}/api/products/${productId}`);

        if (product.stock < quantity) {
            return res.status(400).json({ message: 'Stock insuficiente.' });
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        // Verificar si ya existe el producto en el carrito
        const existingItem = cart.items.find(item => item.productId === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
            existingItem.subtotal = existingItem.price * existingItem.quantity;
        } else {
            cart.items.push({
                productId,
                name: product.name,
                price: product.price,
                quantity,
                subtotal: product.price * quantity
            });
        }

        await cart.save();
        res.json({ message: 'Producto agregado al carrito.', cart });
    } catch (error) {
        res.status(500).json({ message: 'Error al agregar al carrito.', error: error.message });
    }
};

// PUT /api/cart/item/:productId
exports.updateItem = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const { productId } = req.params;
        const { quantity } = req.body;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado.' });
        }

        const item = cart.items.find(i => i.productId === productId);
        if (!item) {
            return res.status(404).json({ message: 'Producto no encontrado en el carrito.' });
        }

        item.quantity = quantity;
        item.subtotal = item.price * quantity;

        await cart.save();
        res.json({ message: 'Cantidad actualizada.', cart });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar item.', error: error.message });
    }
};

// DELETE /api/cart/item/:productId
exports.removeItem = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const { productId } = req.params;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado.' });
        }

        cart.items = cart.items.filter(i => i.productId !== productId);
        await cart.save();
        res.json({ message: 'Producto eliminado del carrito.', cart });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar item.', error: error.message });
    }
};

// DELETE /api/cart
exports.clearCart = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const cart = await Cart.findOne({ userId });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.json({ message: 'Carrito vaciado.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al vaciar carrito.', error: error.message });
    }
};