const express = require('express');
const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const app = express();
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
        defaultValue: 'customer' // customer, seller, admin
    }
}, {
    // --- PERBAIKAN PENTING DI SINI ---
    tableName: 'users', // Memaksa nama tabel menjadi huruf kecil 'users'
    timestamps: false   // Menghilangkan kolom createdAt & updatedAt (opsional, biar simpel)
});

// 2. Sinkronisasi Database
const initDb = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to PostgreSQL');
        
        // 'alter: true' akan menyesuaikan tabel jika ada perubahan struktur
        await sequelize.sync({ alter: true }); 
        console.log('✅ User Table Synced (Table name: users)');
    } catch (error) {
        console.error('❌ Unable to connect to PostgreSQL:', error);
    }
};

initDb();

// --- ROUTES ---

// GET ALL USERS
app.get('/users', async (req, res) => {
    try {
        const users = await User.findAll();
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 User Service running on port ${PORT}`);
});