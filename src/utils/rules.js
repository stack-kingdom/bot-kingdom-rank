/**
 * @fileoverview arquivo com as regras do bot.
 */

/**
 * @description Função para carregar as regras do bot
 * @returns {Promise<Object>}
 */
const loadBotRules = async () => {
    try {
        const rulesPath = `${import.meta.dir}/../rules.json`;
        const file = Bun.file(rulesPath);
        const rulesData = await file.json();
        return rulesData;
    } catch (error) {
        console.error('Erro ao ler arquivo JSON:', error);
        return {};
    }
};

const rules = await loadBotRules();

export default rules;
