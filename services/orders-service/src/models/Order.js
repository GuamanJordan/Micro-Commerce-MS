const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    subtotal: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    orderNumber: { type: String, required: true, unique: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'],
        default: 'pendiente'
    },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String
    },
    paymentStatus: {
        type: String,
        enum: ['pendiente', 'pagado', 'fallido'],
        default: 'pendiente'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
