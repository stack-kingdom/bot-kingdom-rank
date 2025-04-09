/**
 * @fileoverview arquivo com as regras do bot.
 */

const __dirname = import.meta.dir;

/**
 * @description Função para carregar as regras do bot
 * @returns {Promise<Object>}
 */
const loadBotRules = async () => {
    try {
        const rulesPath = `${__dirname}/../rules.json`;
        const file = Bun.file(rulesPath);
        return await file.json();
    } catch (error) {
        console.error('Erro ao ler arquivo JSON:', error);
        return {}; // Retorna objeto vazio em caso de erro
    }
};

const rules = await loadBotRules();

export default rules;