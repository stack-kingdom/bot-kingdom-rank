import { generateAvaSystemPrompt } from '../prompts/avaSystemPrompt.js';
import { Models, MODEL_CONFIG } from '../utils/Models.js';
import contextoServidor from './contextoServidor.js';

/**
 * @description Função para processar a pergunta e gerar a resposta.
 * @param {object} interaction - A interação do usuário.
 * @param {string} question - A pergunta feita pelo usuário.
 * @param {object} contextoMensagens - O contexto das mensagens.
 * @returns {string} - A resposta gerada pela IA.
 */
async function processarPergunta(
    interaction,
    question,
    contextoMensagens = {}
) {
    const contexto = await contextoServidor(interaction);

    let contextoChat = '';
    if (contextoMensagens.historico && contextoMensagens.historico.length > 0) {
        const ultimasMensagens = contextoMensagens.historico.slice(-2);
        ultimasMensagens.forEach((msg) => {
            const authorName = msg.isBot ? 'Você' : msg.author.username;
            contextoChat += `${authorName}: ${msg.content}\n`;
        });
    }

    console.log('Contexto de chat (últimas 2 mensagens):', contextoChat);

    const systemContent = generateAvaSystemPrompt({
        ...contexto,
        contextoChat,
    });

    const result = await Models.run({
        question,
        systemContent,
    });

    if (typeof result === 'string') return result;

    let fullResponse = '';
    if (
        MODEL_CONFIG.model === 'mistral-small-latest' ||
        MODEL_CONFIG.model === 'mistral-large-latest'
    ) {
        for await (const chunk of result) {
            const streamText = chunk.data.choices[0]?.delta?.content;
            if (streamText) {
                fullResponse += streamText;
            }
        }
    } else {
        for await (const chunk of result) {
            const streamText = chunk.choices[0]?.delta?.content;
            if (streamText) {
                fullResponse += streamText;
            }
        }
    }

    return fullResponse || '...';
}
export { processarPergunta, contextoServidor };
