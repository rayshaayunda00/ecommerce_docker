<?php

/** @var \Laravel\Lumen\Routing\Router $router */

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| HELPER: SISTEM PENYIMPANAN FILE (JSON)
|--------------------------------------------------------------------------
*/

// Lokasi file penyimpanan
define('CART_FILE', storage_path('cart_data.json'));

// Fungsi 1: Ambil data dari file
function getCartData() {
    // Jika file tidak ada, buat baru dengan isi KOSONG
    if (!file_exists(CART_FILE)) {
        $initialData = [
            'items' => [], // <-- PENTING: Array kosong (bukan dummy data)
            'total' => 0
        ];
        saveCartData($initialData);
        return $initialData;
    }
    
    // Baca file yang ada
    $jsonContent = file_get_contents(CART_FILE);
    $data = json_decode($jsonContent, true);
    
    // Validasi jika file rusak/kosong, kembalikan array kosong
    return $data ?? ['items' => [], 'total' => 0];
}

// Fungsi 2: Simpan data ke file
function saveCartData($data) {
    // Hitung ulang total secara otomatis
    $total = 0;
    if (isset($data['items']) && is_array($data['items'])) {
        foreach ($data['items'] as $item) {
            $total += $item['price'] * $item['quantity'];
        }
    }
    $data['total'] = $total;

    // Tulis ke file JSON
    file_put_contents(CART_FILE, json_encode($data, JSON_PRETTY_PRINT));
}

/*
|--------------------------------------------------------------------------
| ROUTES API
|--------------------------------------------------------------------------
*/

$router->get('/', function () {
    return 'Cart Service (Persistent File) is Running!';
});

// 1. GET ALL CART
$router->get('/carts', function () {
    return response()->json(getCartData());
});

// 2. GET CART BY ID
$router->get('/carts/{id}', function ($id) {
    $cart = getCartData();
    foreach ($cart['items'] as $item) {
        if ($item['id'] == $id) {
            return response()->json($item);
        }
    }
    return response()->json(['message' => 'Item not found'], 404);
});

// 3. ADD ITEM (POST)
$router->post('/carts', function (Request $request) {
    $cart = getCartData();

    $id    = $request->input('id');
    $name  = $request->input('name');
    $price = (float)$request->input('price');
    $qty   = (int)$request->input('quantity');

    if (!$id || !$name || $price === null || !$qty) {
        return response()->json(['message' => 'Data tidak lengkap'], 400);
    }

    // Cek duplikat
    $foundIndex = -1;
    foreach ($cart['items'] as $index => $item) {
        if ($item['id'] == $id) {
            $foundIndex = $index;
            break;
        }
    }

    $updatedItem = null;
    if ($foundIndex !== -1) {
        // Update jumlah
        $cart['items'][$foundIndex]['quantity'] += $qty;
        $updatedItem = $cart['items'][$foundIndex];
    } else {
        // Buat baru
        $newItem = [
            'id' => (int)$id,
            'name' => $name,
            'price' => $price,
            'quantity' => $qty
        ];
        $cart['items'][] = $newItem;
        $updatedItem = $newItem;
    }

    saveCartData($cart);
    return response()->json($updatedItem, 201);
});

// 4. DELETE ITEM
$router->delete('/carts/{id}', function ($id) {
    $cart = getCartData();
    $itemId = (int)$id;
    $foundIndex = -1;

    foreach ($cart['items'] as $index => $item) {
        if ($item['id'] === $itemId) {
            $foundIndex = $index;
            break;
        }
    }

    if ($foundIndex !== -1) {
        array_splice($cart['items'], $foundIndex, 1);
        saveCartData($cart);
        return response()->json(['message' => 'Item deleted successfully']);
    }

    return response()->json(['message' => 'Item not found'], 404);
});

// 5. FITUR TAMBAHAN: RESET CART (Untuk membersihkan data error)
$router->delete('/carts', function () {
    $emptyData = [
        'items' => [],
        'total' => 0
    ];
    saveCartData($emptyData);
    return response()->json(['message' => 'Keranjang berhasil dikosongkan']);
});