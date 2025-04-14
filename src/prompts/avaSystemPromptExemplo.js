/**
 * @fileoverview Arquivo de exemplo para o prompt do sistema da Ava.
 */

/**
 * Gera o prompt do sistema para a IA Ava.
 * @param {object} data - Dados necessários para formatar o prompt.
 * @param {string} data.userId - O ID do usuário que fez a pergunta.
 * @param {string} data.userQuestion - O nome de exibição do usuário.
 * @param {string} data.nomeServer - O nome do servidor.
 * @param {number} data.memberCount - A contagem de membros do servidor.
 * @param {object} data.rules - O objeto de regras.
 * @returns {string} O prompt do sistema formatado.
 */
export function generateAvaSystemPrompt({
    userId,
    userQuestion,
    nomeServer,
    memberCount,
    rules,
}) {
    const currentTime = new Date().toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
    });
    return `Seu prompt aqui. Usuário: ${userQuestion}, Servidor: ${nomeServer}, Membros: ${memberCount}, Regras: ${JSON.stringify(
        rules
    )}, Hora: ${currentTime}`;
}
