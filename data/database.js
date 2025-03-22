/**
 * @fileoverview Arquivo responsável por criar o banco de dados.
 */
import pg from 'pg';
import '../src/config/env.js';
import fs from 'fs/promises';
import path from 'path';

const { Client } = pg;

 /**
 * @description Cliente para conectar ao banco de dados
  * @type {Object}
  * @constant client
  * @returns {Client}
 */
const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

/**
 * @description Pool para conectar ao banco de dados
 */
const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

 /**
 * @description Função para conectar ao banco de dados
  * @type {Function}
  * @returns {Promise<Client>}
 */
const connectClient = async () => {
    try {
        await client.connect();
        console.log('Conectado ao banco de dados com sucesso');
        return client;
    } catch (err) {
        console.error('Erro ao conectar', err.stack);
        process.exit(1);
    }
};

/**
 * @description Função para criar a tabela no banco de dados
 * @returns {Promise<void>}
 */
const createTable = async () => {
    try {
        if (!client) {
            await connectClient();
        }
        const filePath = path.resolve('../data/schema.sql');
        const schema = await fs.readFile(filePath, 'utf-8');
        await client.query(schema);
        console.log('Tabela criada com sucesso');
    } catch (err) {
        console.error('Erro ao executar query ou ler o arquivo', err.stack);
    }
};

export {pool, connectClient, createTable };