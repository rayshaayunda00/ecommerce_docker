<?php

/** @var \Laravel\Lumen\Routing\Router $router */

use Illuminate\Http\Request; // 👈 PENTING: Tambahkan ini untuk membaca request

// Fungsi helper untuk menghitung ulang total
// Kita pakai 'use (&$carts)' agar dia bisa memodifikasi array $carts
$recalculateTotal = function () use (&$carts) {
    $total = 0;
    foreach ($carts['items'] as $item) {
        $total += $item['price'] * $item['quantity'];
    }
    $carts['total'] = $total;
};


$router->get('/cart', function () use ($router) {
    return 'Cart Service is running';
});

## Dummy cart data
$carts = [
    'items' => [
        [
            'id' => 1,
            'name' => 'Product A',
            'quantity' => 2,
            'price' => 50.00
        ],
        [
            'id' => 2,
            'name' => 'Product B',
            'quantity' => 1,
            'price' => 30.00
        ],
        [
            'id' => 3,
            'name' => 'Product C',
            'quantity' => 1,
            'price' => 50.00
        ]
    ],
    'total' => 180.00 // 👈 PERBAIKAN: Total yang benar (2*50 + 1*30 + 1*50)
];

// get all charts
$router->get('/carts', function () use ($carts) {
    // Selalu pastikan totalnya konsisten sebelum dikirim
    return response()->json($carts);
});

// get cart by id
$router->get('/carts/{id}', function ($id) use ($carts) {
    foreach ($carts['items'] as $item) {
        if ($item['id'] == $id) {
            return response()->json($item);
        }
    }
    return response()->json(['message' => 'Item not found'], 404);
});


// 🚀 FUNGSI BARU: Menambahkan item ke keranjang (atau update quantity)
$router->post('/carts', function (Request $request) use (&$carts, $recalculateTotal) {
    
    // Ambil data dari body request
    $productId = $request->input('id');
    $quantity = (int)$request->input('quantity');
    $name = $request->input('name');
    $price = (float)$request->input('price');

    // Validasi sederhana
    if (!$productId || !$quantity || !$name || $price === null) {
        return response()->json(['message' => 'Missing required fields: id, quantity, name, price'], 400);
    }

    $foundIndex = -1;
    // Cek apakah item sudah ada di keranjang
    foreach ($carts['items'] as $key => $item) {
        if ($item['id'] == $productId) {
            $foundIndex = $key;
            break;
        }
    }

    $updatedItem = null;

    if ($foundIndex !== -1) {
        // --- Item sudah ada ---
        // Tambahkan kuantitasnya
        $carts['items'][$foundIndex]['quantity'] += $quantity;
        $updatedItem = $carts['items'][$foundIndex];
    } else {
        // --- Item baru ---
        // Buat item baru
        $newItem = [
            'id' => (int)$productId,
            'name' => $name,
            'quantity' => $quantity,
            'price' => $price
        ];
        // Masukkan ke array items
        $carts['items'][] = $newItem;
        $updatedItem = $newItem;
    }

    // Panggil helper untuk hitung ulang total
    $recalculateTotal();

    // Kembalikan item yang baru/diupdate dengan status 201 (Created)
    return response()->json($updatedItem, 201);
});


// 🚀 PERBAIKAN: delete item from cart
$router->delete('/carts/{id}', function ($id) use (&$carts, $recalculateTotal) {

    $itemId = (int) $id;
    $foundIndex = -1;

    // 🛑 PERBAIKAN: Logika pencarian harus di $carts['items']
    foreach ($carts['items'] as $key => $item) {
        if ($item['id'] === $itemId) {
            $foundIndex = $key;
            break;
        }
    }

    // Jika tidak ditemukan
    if ($foundIndex === -1) {
        return response()->json(['message' => 'Item not found'], 404);
    }

    // 🛑 PERBAIKAN: Simulasi penghapusan data dari array
    array_splice($carts['items'], $foundIndex, 1);

    // Panggil helper untuk hitung ulang total
    $recalculateTotal();

    return response()->json(['message' => 'Item deleted successfully']);
});