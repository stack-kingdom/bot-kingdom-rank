/**
 * @fileoverview Arquivo responsável por criar e gerenciar a conexão com o banco de dados usando Bun SQL.
 */

import { SQL, sql } from 'bun';

/**
 * @description Instância do Bun SQL configurada com as variáveis de ambiente
 * @type {SQL}
 */
const pool = new SQL({
    database: Bun.env.DB_NAME,
    user: Bun.env.DB_USER,
    password: Bun.env.DB_PASS,
    host: Bun.env.DB_HOST,
    port: parseInt(Bun.env.DB_PORT, 10),
    ssl: Bun.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 50,
    idleTimeout: 30000,
    connectionTimeout: 10000,
});

/**
 * @description Função para criar as tabelas no banco de dados
 * @returns {Promise<void>}
 */
const createTable = async () => {
    try {
        console.log('Inicializando criação de tabelas...');

        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id BIGINT PRIMARY KEY,
                username TEXT NOT NULL,
                message_count FLOAT DEFAULT 0,
                call_count FLOAT DEFAULT 0
            );
          `;
        await sql`
            CREATE TABLE IF NOT EXISTS messages (
                id BIGINT PRIMARY KEY,
                user_id BIGINT REFERENCES users(id),
                points FLOAT DEFAULT 0
            );

          `;

        console.log('Tabelas criadas com sucesso');
    } catch (err) {
        console.error('Erro ao executar query ou ler o arquivo:', err.message);
        throw err;
    }
};

export { pool, createTable };
