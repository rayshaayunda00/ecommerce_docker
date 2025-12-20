const { Sequelize } = require('sequelize');

// Setup konfigurasi Sequelize
const sequelize = new Sequelize(
    process.env.PRODUCT_DB_NAME,
    process.env.PRODUCT_DB_USER,
    process.env.PRODUCT_DB_PASSWORD,
    {
        host: process.env.PRODUCT_DB_HOST,
        dialect: 'mysql',
        logging: false,
    }
);

// Fungsi Retry Connection
const connectWithRetry = async () => {
    const maxRetries = 10;
    let retries = 0;

    while (retries < maxRetries) {
        try {
            await sequelize.authenticate();
            console.log('✅ Database connection established successfully.');
            return; // Keluar dari loop jika berhasil
        } catch (error) {
            retries++;
            console.log(`❌ Unable to connect to the database (Attempt ${retries}/${maxRetries}). Retrying in 5 seconds...`);
            console.error('Error details:', error.message); // Log error singkat
            
            // Tunggu 5 detik sebelum coba lagi
            await new Promise(res => setTimeout(res, 5000));
        }
    }
    console.error('🔥 Could not connect to database after maximum retries. Exiting...');
    process.exit(1); // Matikan container jika benar-benar gagal
};

// Eksekusi koneksi
connectWithRetry();

module.exports = sequelize;