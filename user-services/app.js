const express = require('express');
const app = express();

app.use(express.json()); // agar bisa parse JSON POST

// Dummy data user
let users = [
    { id: 1, name: 'Andi', email: 'andi@example.com', role: 'customer' },
    { id: 2, name: 'Budi', email: 'budi@example.com', role: 'seller' },
    { id: 3, name: 'Cici', email: 'cici@example.com', role: 'admin' },
];

// ===========================
// GET semua user
// ===========================
app.get('/users', (req, res) => {
    res.json(users);
});

// ===========================
// GET detail user berdasarkan ID
// ===========================
app.get('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'User tidak ditemukan' });
    }
});

// ===========================
// POST tambah user
// ===========================
app.post('/users', (req, res) => {
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
        return res.status(400).json({ message: 'name, email, dan role wajib diisi' });
    }

    const newUser = {
        id: users.length + 1,
        name,
        email,
        role,
    };

    users.push(newUser);
    res.status(201).json(newUser);
});

// Jalankan server di port 4000
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`User Service berjalan di http://0.0.0.0:${PORT}`);
});
