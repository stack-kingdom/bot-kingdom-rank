/**
 * @fileoverview Arquivo responsável por criar o banco de dados e a tabela de usuários.
 */
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

/**
 * @function openDb
 * @description Função para abrir o banco de dados
 * @returns {Promise<sqlite3.Database>}
 */
async function openDb() {
    return await open({
        // atenção: este caminho é relativo ao arquivo que está executando o código, atualmente é src/main.js
        filename: '/app/data/banco.db',
        driver: sqlite3.Database,
    });
}

/**
 * @function createTable
 * @description Função para criar a tabela de usuários
 * @returns {Promise<void>}
 */
async function createTable() {
    const db = await openDb();
    db.run(
        'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, message_count INTEGER DEFAULT 0, call_count INTEGER DEFAULT 0)'
    );
}

export { openDb, createTable };
