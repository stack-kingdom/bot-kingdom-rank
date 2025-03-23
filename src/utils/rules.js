/**
 * @fileoverview arquivo com as regras do bot.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @description Função para carregar as regras do bot
 * @returns {Object}
 */
const BOT_RULES = () => {
    try {
        const rulesPath = path.resolve(__dirname, '../rules.json');
        return JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
    } catch (error) {
        console.error('Erro ao ler arquivo JSON:', error);
        return {};
    }
};

const rules = BOT_RULES();

export default rules;