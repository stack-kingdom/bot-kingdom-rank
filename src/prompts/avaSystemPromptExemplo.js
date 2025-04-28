/**
 * @fileoverview Arquivo de exemplo para o prompt do sistema da Ava.
 */

/**
 * @description Gera o prompt do sistema para a Ava.
 * @param {Object} params - Parâmetros para gerar o prompt.
 * @param {string} params.criador - Nome do criador do servidor.
 * @param {string} params.userId - ID do usuário.
 * @param {string} params.userDisplayName - Nome de exibição do usuário.
 * @param {string} params.nomeServer - Nome do servidor.
 * @param {number} params.memberCount - Número de membros no servidor.
 * @param {string} params.rules - Regras do servidor.
 * @param {Array} params.todosCargos - Lista de todos os cargos do servidor.
 * @param {Array} params.todosCanais - Lista de todos os canais do servidor.
 * @param {Array} params.todosMembros - Lista de todos os membros do servidor.
 * @param {Array} params.membrosOnline - Lista de membros online no servidor.
 * @param {string} [params.contextoChat=''] - Contexto do chat, se disponível.
 * @returns {string} O prompt do sistema formatado.
 */
export function generateAvaSystemPrompt({
    criador,
    userId,
    userDisplayName,
    nomeServer,
    memberCount,
    rules,
    todosCargos,
    todosCanais,
    todosMembros,
    membrosOnline,
    contextoChat = '',
}) {
    return ` Prompt aqui`;
}
