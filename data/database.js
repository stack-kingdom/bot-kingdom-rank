/**
 * @fileoverview Arquivo responsável por criar e gerenciar a conexão com o banco de dados.
 */
import pg from 'pg';

/**
 * @description Configuração do pool de conexões
 * @type {Object}
 */
const poolConfig = {
    user: Bun.env.DB_USER,
    host: Bun.env.DB_HOST,
    database: Bun.env.DB_NAME,
    password: Bun.env.DB_PASS,
    port: Bun.env.DB_PORT,
    ssl: Bun.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: 10,
    keepAlive: true,
};

/**
 * @description Validação das variáveis de ambiente necessárias
 * @throws {Error} Se alguma variável de ambiente estiver faltando
 */
const validateEnv = () => {
    const requiredEnvVars = [
        'DB_USER',
        'DB_HOST',
        'DB_NAME',
        'DB_PASS',
        'DB_PORT',
    ];
    const missingVars = requiredEnvVars.filter((varName) => !Bun.env[varName]);

    if (missingVars.length > 0) {
        throw new Error(
            `Variáveis de ambiente faltando: ${missingVars.join(', ')}`
        );
    }
};

/**
 * @description Pool para conectar ao banco de dados
 */
let pool;

try {
    validateEnv();
    pool = new pg.Pool(poolConfig);
} catch (error) {
    console.error('Erro ao criar pool de conexões:', error.message);
    process.exit(1);
}

/**
 * @description Função para reconectar ao banco de dados
 * @returns {Promise<void>}
 */
async function reconnectPool() {
    console.log('Tentando reconectar ao banco de dados...');
    try {
        await pool.end();
        pool = new pg.Pool(poolConfig);
        pool.on('error', handlePoolError);
        console.log('Novo pool criado com sucesso');
    } catch (error) {
        console.error('Erro ao reconectar:', error.message);
        setTimeout(reconnectPool, 5000);
    }
}

/**
 * @description Função para tratar erros do pool
 * @param {Error} err - Erro ocorrido
 */
function handlePoolError(err) {
    console.error('Erro inesperado no pool de conexões:', err.message);
    reconnectPool();
}

pool.on('error', handlePoolError);

/**
 * @description Função para criar as tabelas no banco de dados
 * @returns {Promise<void>}
 */
const createTable = async () => {
    let client;
    try {
        client = await pool.connect();
        console.log('Conexão obtida do pool com sucesso');

        const schemaPath = `${import.meta.dirname}/schema.sql`;
        const file = Bun.file(schemaPath);
        const schema = await file.text();

        const commands = schema
            .split(';')
            .map((cmd) => cmd.trim())
            .filter((cmd) => cmd.length > 0);

        for (const command of commands) {
            await client.query(command + ';');
        }

        console.log('Tabelas criadas com sucesso');
    } catch (err) {
        console.error('Erro ao executar query ou ler o arquivo:', err.message);
        // Log do erro original para mais detalhes, se necessário
        // console.error(err);
        throw err; // Re-lança o erro para que main.js possa saber
    } finally {
        if (client) {
            client.release();
            console.log('Conexão liberada de volta ao pool');
        }
    }
};

export { pool, createTable };
