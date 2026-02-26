# 🚀 Guía de Implementación - NexaCommerce

## Estructura Final del Proyecto

```
Micro-Commerce-MS/
├── docker-compose.yml
├── .env
├── docs/
├── frontend/                  # Vue.js 3 + Vite (:5173)
├── gateway/                   # API Gateway (:3000)
├── services/
│   ├── users-service/         # :3001 - MongoDB
│   ├── products-service/      # :3002 - MongoDB
│   ├── cart-service/          # :3003 - MongoDB
│   ├── orders-service/        # :3004 - MongoDB
│   └── reports-service/       # :3005 - MySQL
└── README.md
```

---

## FASE 1: Estructura de Carpetas y Configuración Base

### Paso 1.1 — Crear todas las carpetas

Abre la terminal en la raíz del proyecto (`Micro-Commerce-MS/`) y ejecuta:

```bash
mkdir gateway
mkdir services
mkdir services/users-service
mkdir services/products-service
mkdir services/cart-service
mkdir services/orders-service
mkdir services/reports-service
```

### Paso 1.2 — Archivo `.env` en la raíz

📁 **Archivo:** `Micro-Commerce-MS/.env`

```env
# === MONGODB ===
MONGO_URI=mongodb://localhost:27017

# === MYSQL ===
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=root123
MYSQL_DATABASE=nexacommerce_reports

# === JWT ===
JWT_SECRET=nexacommerce_super_secret_key_2024

# === PUERTOS ===
GATEWAY_PORT=3000
USERS_PORT=3001
PRODUCTS_PORT=3002
CART_PORT=3003
ORDERS_PORT=3004
REPORTS_PORT=3005
FRONTEND_PORT=5173

# === URLs DE SERVICIOS (para el Gateway) ===
USERS_SERVICE_URL=http://localhost:3001
PRODUCTS_SERVICE_URL=http://localhost:3002
CART_SERVICE_URL=http://localhost:3003
ORDERS_SERVICE_URL=http://localhost:3004
REPORTS_SERVICE_URL=http://localhost:3005
```

---

## FASE 2: Users Service (Puerto 3001)

### Paso 2.1 — Inicializar proyecto

```bash
cd services/users-service
npm init -y
npm install express mongoose bcryptjs jsonwebtoken dotenv cors morgan
npm install --save-dev nodemon
```

### Paso 2.2 — Estructura de carpetas

```
services/users-service/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── userRoutes.js
│   ├── controllers/
│   │   └── userController.js
│   ├── middlewares/
│   │   └── authMiddleware.js
│   └── app.js
├── .env
├── package.json
└── server.js
```

### Paso 2.3 — Archivos del Users Service

📁 **`services/users-service/.env`**

```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/nexacommerce_users
JWT_SECRET=nexacommerce_super_secret_key_2024
```

📁 **`services/users-service/server.js`**

```javascript
const app = require('./src/app');
const connectDB = require('./src/config/database');
require('dotenv').config();

const PORT = process.env.PORT || 3001;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Users Service corriendo en puerto ${PORT}`);
  });
});
```

📁 **`services/users-service/src/config/database.js`**

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 MongoDB conectado - Users Service');
  } catch (error) {
    console.error('❌ Error conectando MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

📁 **`services/users-service/src/models/User.js`**

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['cliente', 'admin'],
    default: 'cliente'
  },
  phone: {
    type: String,
    default: ''
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
```

📁 **`services/users-service/src/middlewares/authMiddleware.js`**

```javascript
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso solo para administradores.' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
```

📁 **`services/users-service/src/controllers/userController.js`**

```javascript
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST /api/users/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validar email único
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado.' });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone
    });

    await user.save();

    res.status(201).json({
      message: 'Usuario registrado exitosamente.',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar usuario.', error: error.message });
  }
};

// POST /api/users/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login exitoso.',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión.', error: error.message });
  }
};

// GET /api/users/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener perfil.', error: error.message });
  }
};

// PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, address },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Perfil actualizado.', user });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar perfil.', error: error.message });
  }
};

// GET /api/users (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios.', error: error.message });
  }
};

// DELETE /api/users/:id (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    res.json({ message: 'Usuario eliminado exitosamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar usuario.', error: error.message });
  }
};
```

📁 **`services/users-service/src/routes/userRoutes.js`**

```javascript
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

// Rutas públicas
router.post('/register', userController.register);
router.post('/login', userController.login);

// Rutas protegidas (requieren token)
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);

// Rutas admin
router.get('/', authMiddleware, adminMiddleware, userController.getAllUsers);
router.delete('/:id', authMiddleware, adminMiddleware, userController.deleteUser);

module.exports = router;
```

📁 **`services/users-service/src/app.js`**

```javascript
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Rutas
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'users-service' });
});

module.exports = app;
```

📁 **Agregar en `package.json`** (en la sección `"scripts"`):

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

### Paso 2.4 — Probar Users Service

```bash
cd services/users-service
npm run dev
```

Deberías ver:

```
📦 MongoDB conectado - Users Service
✅ Users Service corriendo en puerto 3001
```

---

## FASE 3: Products Service (Puerto 3002)

### Paso 3.1 — Inicializar

```bash
cd services/products-service
npm init -y
npm install express mongoose dotenv cors morgan
npm install --save-dev nodemon
```

### Paso 3.2 — Estructura

```
services/products-service/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   └── Product.js
│   ├── routes/
│   │   └── productRoutes.js
│   ├── controllers/
│   │   └── productController.js
│   └── app.js
├── .env
├── package.json
└── server.js
```

### Paso 3.3 — Archivos

📁 **`services/products-service/.env`**

```env
PORT=3002
MONGO_URI=mongodb://localhost:27017/nexacommerce_products
```

📁 **`services/products-service/server.js`**

```javascript
const app = require('./src/app');
const connectDB = require('./src/config/database');
require('dotenv').config();

const PORT = process.env.PORT || 3002;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Products Service corriendo en puerto ${PORT}`);
  });
});
```

📁 **`services/products-service/src/config/database.js`**

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 MongoDB conectado - Products Service');
  } catch (error) {
    console.error('❌ Error conectando MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

📁 **`services/products-service/src/models/Product.js`**

```javascript
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La descripción es obligatoria']
  },
  price: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  category: {
    type: String,
    required: true,
    enum: ['electronica', 'ropa', 'hogar', 'deportes', 'libros', 'juguetes', 'alimentos', 'otros']
  },
  stock: {
    type: Number,
    required: true,
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  brand: {
    type: String,
    default: ''
  },
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  imageUrl: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
```

📁 **`services/products-service/src/controllers/productController.js`**

```javascript
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
```

📁 **`services/products-service/src/routes/productRoutes.js`**

```javascript
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Rutas públicas
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Rutas admin (la auth la maneja el Gateway)
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

// Ruta interna (para otros servicios)
router.put('/:id/stock', productController.updateStock);

module.exports = router;
```

📁 **`services/products-service/src/app.js`**

```javascript
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const productRoutes = require('./routes/productRoutes');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/products', productRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'products-service' });
});

module.exports = app;
```

📁 **`package.json` scripts:**

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

---

## FASE 4: Cart Service (Puerto 3003)

### Paso 4.1 — Inicializar

```bash
cd services/cart-service
npm init -y
npm install express mongoose axios dotenv cors morgan
npm install --save-dev nodemon
```

### Paso 4.2 — Estructura

```
services/cart-service/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   └── Cart.js
│   ├── routes/
│   │   └── cartRoutes.js
│   ├── controllers/
│   │   └── cartController.js
│   └── app.js
├── .env
├── package.json
└── server.js
```

### Paso 4.3 — Archivos

📁 **`services/cart-service/.env`**

```env
PORT=3003
MONGO_URI=mongodb://localhost:27017/nexacommerce_cart
PRODUCTS_SERVICE_URL=http://localhost:3002
```

📁 **`services/cart-service/server.js`**

```javascript
const app = require('./src/app');
const connectDB = require('./src/config/database');
require('dotenv').config();

const PORT = process.env.PORT || 3003;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Cart Service corriendo en puerto ${PORT}`);
  });
});
```

📁 **`services/cart-service/src/config/database.js`** — Mismo patrón que los anteriores, cambiando el mensaje a `Cart Service`.

📁 **`services/cart-service/src/models/Cart.js`**

```javascript
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true }
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalItems: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Recalcular totales antes de guardar
cartSchema.pre('save', function(next) {
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.totalPrice = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  next();
});

module.exports = mongoose.model('Cart', cartSchema);
```

📁 **`services/cart-service/src/controllers/cartController.js`**

```javascript
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
```

📁 **`services/cart-service/src/routes/cartRoutes.js`**

```javascript
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.get('/', cartController.getCart);
router.post('/add', cartController.addItem);
router.put('/item/:productId', cartController.updateItem);
router.delete('/item/:productId', cartController.removeItem);
router.delete('/', cartController.clearCart);

module.exports = router;
```

📁 **`services/cart-service/src/app.js`**

```javascript
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cartRoutes = require('./routes/cartRoutes');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/cart', cartRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'cart-service' });
});

module.exports = app;
```

---

## FASE 5: Orders Service (Puerto 3004)

### Paso 5.1 — Inicializar

```bash
cd services/orders-service
npm init -y
npm install express mongoose axios dotenv cors morgan
npm install --save-dev nodemon
```

### Paso 5.2 — Archivos

📁 **`services/orders-service/.env`**

```env
PORT=3004
MONGO_URI=mongodb://localhost:27017/nexacommerce_orders
CART_SERVICE_URL=http://localhost:3003
PRODUCTS_SERVICE_URL=http://localhost:3002
REPORTS_SERVICE_URL=http://localhost:3005
```

📁 **`services/orders-service/server.js`** — Mismo patrón, puerto 3004, mensaje `Orders Service`.

📁 **`services/orders-service/src/config/database.js`** — Mismo patrón, mensaje `Orders Service`.

📁 **`services/orders-service/src/models/Order.js`**

```javascript
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
```

📁 **`services/orders-service/src/controllers/orderController.js`**

```javascript
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
```

📁 **`services/orders-service/src/routes/orderRoutes.js`**

```javascript
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/', orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);
router.get('/', orderController.getAllOrders);
router.put('/:id/status', orderController.updateStatus);

module.exports = router;
```

📁 **`services/orders-service/src/app.js`**

```javascript
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/orders', orderRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'orders-service' });
});

module.exports = app;
```

---

## FASE 6: Reports Service (Puerto 3005 — MySQL)

### Paso 6.1 — Inicializar

```bash
cd services/reports-service
npm init -y
npm install express mysql2 sequelize dotenv cors morgan
npm install --save-dev nodemon
```

### Paso 6.2 — Archivos

📁 **`services/reports-service/.env`**

```env
PORT=3005
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=root123
MYSQL_DATABASE=nexacommerce_reports
```

📁 **`services/reports-service/server.js`**

```javascript
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
```

📁 **`services/reports-service/src/config/database.js`**

```javascript
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    dialect: 'mysql',
    logging: false
  }
);

module.exports = { sequelize };
```

📁 **`services/reports-service/src/models/Sale.js`**

```javascript
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Sale = sequelize.define('Sale', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  user_id: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  product_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  order_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'sales',
  timestamps: false
});

module.exports = Sale;
```

📁 **`services/reports-service/src/models/ProductSummary.js`**

```javascript
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
```

📁 **`services/reports-service/src/controllers/reportController.js`**

```javascript
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
```

📁 **`services/reports-service/src/routes/reportRoutes.js`**

```javascript
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.post('/sync', reportController.syncOrder);
router.get('/sales', reportController.getSalesReport);
router.get('/top-products', reportController.getTopProducts);
router.get('/revenue', reportController.getTotalRevenue);

module.exports = router;
```

📁 **`services/reports-service/src/app.js`**

```javascript
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/reports', reportRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'reports-service' });
});

module.exports = app;
```

---

## FASE 7: API Gateway (Puerto 3000)

### Paso 7.1 — Inicializar

```bash
cd gateway
npm init -y
npm install express http-proxy-middleware jsonwebtoken dotenv cors morgan express-rate-limit winston
npm install --save-dev nodemon
```

### Paso 7.2 — Archivos

📁 **`gateway/.env`**

```env
PORT=3000
JWT_SECRET=nexacommerce_super_secret_key_2024
USERS_SERVICE_URL=http://localhost:3001
PRODUCTS_SERVICE_URL=http://localhost:3002
CART_SERVICE_URL=http://localhost:3003
ORDERS_SERVICE_URL=http://localhost:3004
REPORTS_SERVICE_URL=http://localhost:3005
```

📁 **`gateway/server.js`**

```javascript
const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 API Gateway corriendo en puerto ${PORT}`);
});
```

📁 **`gateway/src/app.js`**

```javascript
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { authMiddleware } = require('./middlewares/auth');
require('dotenv').config();

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100
});

app.use(cors());
app.use(morgan('dev'));
app.use(limiter);
app.use(express.json());

// ==================== PROXY ROUTES ====================

// Users Service - Rutas públicas (register, login)
app.use('/api/users/register', createProxyMiddleware({
  target: process.env.USERS_SERVICE_URL,
  changeOrigin: true
}));

app.use('/api/users/login', createProxyMiddleware({
  target: process.env.USERS_SERVICE_URL,
  changeOrigin: true
}));

// Users Service - Rutas protegidas
app.use('/api/users', authMiddleware, (req, res, next) => {
  // Inyectar user info en headers para los servicios
  req.headers['x-user-id'] = req.user.id;
  req.headers['x-user-role'] = req.user.role;
  next();
}, createProxyMiddleware({
  target: process.env.USERS_SERVICE_URL,
  changeOrigin: true
}));

// Products Service - Rutas públicas (GET)
app.use('/api/products', (req, res, next) => {
  if (req.method === 'GET') {
    return next();
  }
  // POST, PUT, DELETE requieren auth
  authMiddleware(req, res, () => {
    req.headers['x-user-id'] = req.user.id;
    req.headers['x-user-role'] = req.user.role;
    next();
  });
}, createProxyMiddleware({
  target: process.env.PRODUCTS_SERVICE_URL,
  changeOrigin: true
}));

// Cart Service - Todo protegido
app.use('/api/cart', authMiddleware, (req, res, next) => {
  req.headers['x-user-id'] = req.user.id;
  next();
}, createProxyMiddleware({
  target: process.env.CART_SERVICE_URL,
  changeOrigin: true
}));

// Orders Service - Todo protegido
app.use('/api/orders', authMiddleware, (req, res, next) => {
  req.headers['x-user-id'] = req.user.id;
  req.headers['x-user-role'] = req.user.role;
  next();
}, createProxyMiddleware({
  target: process.env.ORDERS_SERVICE_URL,
  changeOrigin: true
}));

// Reports Service - Solo admin
app.use('/api/reports', authMiddleware, (req, res, next) => {
  if (req.user.role !== 'admin' && req.method === 'GET') {
    return res.status(403).json({ message: 'Solo administradores.' });
  }
  next();
}, createProxyMiddleware({
  target: process.env.REPORTS_SERVICE_URL,
  changeOrigin: true
}));

// Health check del Gateway
app.get('/health', async (req, res) => {
  res.json({
    status: 'OK',
    service: 'api-gateway',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
```

📁 **`gateway/src/middlewares/auth.js`**

```javascript
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. Token requerido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};

module.exports = { authMiddleware };
```

---

## FASE 8: Frontend (Vue.js 3 + Vite)

### Paso 8.1 — Crear proyecto Vue

Desde la raíz `Micro-Commerce-MS/`:

```bash
npm create vite@latest frontend -- --template vue
cd frontend
npm install
npm install vue-router@4 pinia axios chart.js vue-chartjs
```

### Paso 8.2 — Estructura del Frontend

```
frontend/src/
├── api/
│   └── axios.js              # Instancia de Axios configurada
├── router/
│   └── index.js              # Vue Router
├── stores/
│   ├── auth.js               # Pinia - autenticación
│   ├── cart.js                # Pinia - carrito
│   └── products.js            # Pinia - productos
├── views/
│   ├── HomeView.vue
│   ├── LoginView.vue
│   ├── RegisterView.vue
│   ├── CatalogView.vue
│   ├── ProductDetailView.vue
│   ├── CartView.vue
│   ├── OrdersView.vue
│   ├── ProfileView.vue
│   └── admin/
│       ├── DashboardView.vue
│       ├── ManageProductsView.vue
│       └── ManageOrdersView.vue
├── components/
│   ├── Navbar.vue
│   ├── ProductCard.vue
│   └── Footer.vue
├── App.vue
└── main.js
```

> **NOTA:** La implementación del frontend es extensa. Una vez que tengas los 5 servicios + gateway funcionando, te guío archivo por archivo del frontend.

---

## FASE 9: Docker Compose (Opcional pero recomendado)

📁 **`Micro-Commerce-MS/docker-compose.yml`**

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    container_name: nexacommerce-mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  mysql:
    image: mysql:8
    container_name: nexacommerce-mysql
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: nexacommerce_reports
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mongo_data:
  mysql_data:
```

---

## ORDEN DE EJECUCIÓN

Para levantar todo el sistema, abre **7 terminales** y ejecuta en orden:

```
Terminal 1: docker-compose up                          (MongoDB + MySQL)
Terminal 2: cd services/users-service && npm run dev   (Puerto 3001)
Terminal 3: cd services/products-service && npm run dev (Puerto 3002)
Terminal 4: cd services/cart-service && npm run dev     (Puerto 3003)
Terminal 5: cd services/orders-service && npm run dev   (Puerto 3004)
Terminal 6: cd services/reports-service && npm run dev  (Puerto 3005)
Terminal 7: cd gateway && npm run dev                   (Puerto 3000)
Terminal 8: cd frontend && npm run dev                  (Puerto 5173)
```

---

## PRUEBAS CON POSTMAN / CURL

Una vez todo esté corriendo, prueba a través del **Gateway** (puerto 3000):

### 1. Registrar usuario

```
POST http://localhost:3000/api/users/register
Body (JSON):
{
  "name": "Jordan Guaman",
  "email": "jordan@test.com",
  "password": "123456",
  "phone": "0991234567"
}
```

### 2. Login

```
POST http://localhost:3000/api/users/login
Body (JSON):
{
  "email": "jordan@test.com",
  "password": "123456"
}
```

→ Copia el `token` de la respuesta

### 3. Crear producto (usa el token como Bearer)

```
POST http://localhost:3000/api/products
Headers: Authorization: Bearer <tu_token>
Body (JSON):
{
  "name": "Laptop ASUS",
  "description": "Laptop gaming RTX 4060",
  "price": 1299.99,
  "category": "electronica",
  "stock": 50,
  "sku": "ASUS-001",
  "brand": "ASUS"
}
```

### 4. Ver catálogo

```
GET http://localhost:3000/api/products
```

### 5. Agregar al carrito

```
POST http://localhost:3000/api/cart/add
Headers: Authorization: Bearer <tu_token>
Body (JSON):
{
  "productId": "<id_del_producto>",
  "quantity": 2
}
```

### 6. Crear pedido

```
POST http://localhost:3000/api/orders
Headers: Authorization: Bearer <tu_token>
Body (JSON):
{
  "shippingAddress": {
    "street": "Av. General Rumiñahui",
    "city": "Sangolquí",
    "state": "Pichincha",
    "zipCode": "171103"
  }
}
```
