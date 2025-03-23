/**
 * @fileoverview Arquivo responsável por criar o banco de dados.
 */
import pg from 'pg';
import '../src/config/env.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * @description Pool para conectar ao banco de dados
 */
let pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: 10,
    keepAlive: true,
});


/**
 * @description Função para reconectar ao banco de dados
 * @returns {void}
 */
function reconnectPool() {
    console.log('Tentando reconectar ao banco de dados...');
    pool.end(() => {
        const newPool = new pg.Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASS,
            port: process.env.DB_PORT,
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
            connectionTimeoutMillis: 5000,
            idleTimeoutMillis: 30000,
            max: 10,
            keepAlive: true,
        });
        newPool.on('error', (err) => {
            console.error('Erro no pool, tentando reconectar:', err.stack);
            reconnectPool();
        });
        pool = newPool;
        console.log('Novo pool criado com sucesso');
    });
}

/**
 * @description Evento para tratar erro no pool de conexões
 */
pool.on('error', (err) => {
    console.error('Erro inesperado no pool de conexões:', err.stack);
    reconnectPool();
});

/**
 * @description Função para criar a tabela no banco de dados
 * @returns {Promise<void>}
 */
const createTable = async () => {
    let client;
    try {
        client = await pool.connect();
        console.log('Conexão obtida do pool com sucesso');

        const filePath = path.resolve('../data/schema.sql');
        const schema = await fs.readFile(filePath, 'utf-8');
        await client.query(schema);
        console.log('Tabela criada com sucesso');
    } catch (err) {
        console.error('Erro ao executar query ou ler o arquivo:', err.stack);
        throw err;
    } finally {
        if (client) {
            client.release();
            console.log('Conexão liberada de volta ao pool');
        }
    }
};

export { pool, createTable };