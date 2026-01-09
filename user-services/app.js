const express = require('express');
const { DataTypes } = require('sequelize');
const sequelize = require('./database');
const cors = require('cors'); // Tambahan agar aman di Browser

const app = express();

// Middleware
app.use(cors()); // Izinkan akses dari mana saja (PENTING untuk Flutter Web)
app.use(express.json());

// 1. Definisikan Model User
const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'customer'
    }
}, {
    tableName: 'users',
    timestamps: false
});

// 2. Sinkronisasi Database
const initDb = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to PostgreSQL');
        await sequelize.sync({ alter: true });
        console.log('✅ User Table Synced');
    } catch (error) {
        console.error('❌ Unable to connect to PostgreSQL:', error);
    }
};

initDb();

// --- ROUTES ---

// GET ALL USERS
app.get('/users', async (req, res) => {
    try {
        const users = await User.findAll({ 
            order: [['id', 'ASC']] // Biar urutannya rapi
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET USER BY ID
app.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (user) res.json(user);
        else res.status(404).json({ message: 'User not found' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST CREATE USER
app.post('/users', async (req, res) => {
    try {
        const { name, email, role } = req.body;
        const newUser = await User.create({ name, email, role });
        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- PERBAIKAN: ROUTES DELETE (YANG HILANG TADI) ---
app.delete('/users/:id', async (req, res) => {
    try {
        const id = req.params.id;
        
        // Perintah Sequelize untuk menghapus berdasarkan ID
        const deleted = await User.destroy({
            where: { id: id }
        });

        if (deleted) {
            // Jika berhasil (1 baris terhapus)
            res.status(200).json({ message: 'User deleted successfully' });
        } else {
            // Jika ID tidak ditemukan (0 baris terhapus)
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 User Service running on port ${PORT}`);
});