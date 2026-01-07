const { Sequelize } = require('sequelize');

// Mengambil config dari Environment Variable (diset di docker-compose)
const sequelize = new Sequelize(
    process.env.DB_NAME || 'userdb',
    process.env.DB_USER || 'user',
    process.env.DB_PASSWORD || 'pass',
    {
        host: process.env.DB_HOST || 'user-db',
        dialect: 'postgres',
        logging: false,
    }
);

module.exports = sequelize;