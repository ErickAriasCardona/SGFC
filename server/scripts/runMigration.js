const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Configuración de la base de datos
const DB_NAME = process.env.DB_NAME || "formacion_complementaria";
const DB_USER = process.env.DB_USER || "root";
const DB_PORT = process.env.DB_PORT || 3306;
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_HOST = process.env.DB_HOST || "localhost";

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    dialect: 'mysql',
    port: DB_PORT,
    logging: false
});

async function runMigration() {
    try {
        // Importar la migración
        const migration = require('../migrations/add_curso_id_to_asistencias');

        // Ejecutar la migración
        await migration.up(sequelize.getQueryInterface(), Sequelize);
        console.log('✅ Migración ejecutada exitosamente');

        // Cerrar la conexión
        await sequelize.close();
    } catch (error) {
        console.error('❌ Error al ejecutar la migración:', error);
        process.exit(1);
    }
}

runMigration(); 