const Product = require('../models/Product');

// GET /api/products
exports.getAllProducts = async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice, sort } = req.query;
        let filter = { isActive: true };

        if (category) filter.category = category;
        if (search) filter.name = { $regex: search, $options: 'i' };
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        let query = Product.find(filter);

        // Ordenamiento
        if (sort === 'price_asc') query = query.sort({ price: 1 });
        else if (sort === 'price_desc') query = query.sort({ price: -1 });
        else if (sort === 'newest') query = query.sort({ createdAt: -1 });
        else query = query.sort({ createdAt: -1 });

        const products = await query;
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener productos.', error: error.message });
    }
};

// GET /api/products/:id
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener producto.', error: error.message });
    }
};

// POST /api/products (Admin)
exports.createProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json({ message: 'Producto creado.', product });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear producto.', error: error.message });
    }
};

// PUT /api/products/:id (Admin)
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        res.json({ message: 'Producto actualizado.', product });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar producto.', error: error.message });
    }
};

// DELETE /api/products/:id (Admin)
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        res.json({ message: 'Producto eliminado.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar producto.', error: error.message });
    }
};

// PUT /api/products/:id/stock (Interno - para Orders)
exports.updateStock = async (req, res) => {
    try {
        const { quantity } = req.body; // cantidad a restar
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ message: 'Stock insuficiente.' });
        }

        product.stock -= quantity;
        await product.save();

        res.json({ message: 'Stock actualizado.', product });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar stock.', error: error.message });
    }
};