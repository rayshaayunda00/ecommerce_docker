const express = require('express');
const cors = require('cors');
const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const app = express();
app.use(cors());
app.use(express.json());
// TAMBAHAN: Middleware untuk membaca data x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); 

// Model Product
const Product = sequelize.define('Product', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
});

// Helper response
const success = (res, message, data = null) =>
    res.status(200).json({ message, data });

const error = (res, status, message) =>
    res.status(status).json({ message });

// Routes

// GET ALL PRODUCTS
app.get('/products', async (req, res) => {
    try {
        const data = await Product.findAll();
        success(res, 'Products retrieved successfully', data);
    } catch (err) {
        console.error('❌ Error fetching products:', err); 
        error(res, 500, `Failed to retrieve products: ${err.message}`);
    }
});

// GET PRODUCT BY ID
app.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return error(res, 404, 'Product not found');
        success(res, 'Product retrieved successfully', product);
    } catch (err) {
        console.error('❌ Error fetching product:', err);
        error(res, 500, `Failed to retrieve product: ${err.message}`);
    }
});

// CREATE PRODUCT
app.post('/products', async (req, res) => {
    try {
        const { name, price, description } = req.body;
        // Validasi
        if (!name || !price) return error(res, 400, 'Name and price are required');

        const product = await Product.create({ name, price, description });
        success(res, 'Product created successfully', product);
    } catch (err) {
        console.error('❌ Error creating product:', err);
        error(res, 500, `Failed to create product: ${err.message}`);
    }
});

// UPDATE PRODUCT
app.put('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return error(res, 404, 'Product not found');

        await product.update(req.body);
        success(res, 'Product updated successfully', product);
    } catch (err) {
        console.error('❌ Error updating product:', err);
        error(res, 500, `Failed to update product: ${err.message}`);
    }
});

// DELETE PRODUCT
app.delete('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return error(res, 404, 'Product not found');

        await product.destroy();
        success(res, 'Product deleted successfully');
    } catch (err) {
        console.error('❌ Error deleting product:', err);
        error(res, 500, `Failed to delete product: ${err.message}`);
    }
});

// Server Start & Database Sync
const startServer = async () => {
    try {
        // Sync database (membuat tabel jika belum ada)
        await sequelize.sync({ alter: true });
        console.log('✅ Database & tables synced successfully');

        const PORT = process.env.PRODUCT_SERVICE_PORT || 3000;
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Product service running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to sync database or start server:', error);
    }
};

startServer();