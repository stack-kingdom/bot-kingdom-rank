/**
 * @fileoverview Comando para interagir com a IA Ava.
 */

import { SlashCommandBuilder, ChannelType } from 'discord.js';
import rules from '../../utils/rules.js';
import { generateAvaSystemPrompt } from '../../prompts/avaSystemPrompt.js';
import Models from '../../utils/Models.js';

/**
 * @description Comando para interagir com a IA Ava.
 * @type SlashCommandOptionsOnlyBuilder
 */
const data = new SlashCommandBuilder()
    .setName('ava')
    .setDescription('Comandos relacionados à Ava')
    .addStringOption((option) =>
        option
            .setName('pergunta')
            .setDescription('A pergunta que você quer fazer')
            .setRequired(true)
    );

/**
 * @description Função para gerar o contexto do servidor.
 * @param {object} interaction - A interação do usuário.
 * @returns {object} - O contexto do servidor.
 */
const contextoServidor = async (interaction) => {
    const criador = '<@786049927787839519>';
    const guild = interaction.guild;
    const userId = interaction.user.id;
    const userDisplayName = interaction.user.displayName;
    const nomeServer = guild.name;
    const memberCount = guild.memberCount;

    await guild.members.fetch();

    const todosCargos = guild.roles.cache
        .filter((role) => role.name !== '@everyone')
        .map((role) => `'${role.name}' (ID: ${role.id})`)
        .join(', ');
    const todosCanais = guild.channels.cache
        .filter((channel) => channel.type !== ChannelType.GuildCategory)
        .map((channel) => `#${channel.name} (ID: ${channel.id})`)
        .join(', ');
    const todosMembros =
        guild.members.cache
            .filter((member) => member.user && !member.user.bot)
            .map((member) => `<@${member.id}>`)
            .slice(0, 20)
            .join(', ') || 'Nenhum membro encontrado.';
    console.log(todosMembros);
    const membrosOnline =
        guild.members.cache
            .filter((member) => member.presence?.status === 'online')
            .map((member) => `<@${member.id}>`)
            .join(', ') || 'Nenhum membro online encontrado.';

    return {
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
    };
};

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
    if (contextoMensagens.referencedMessage) {
        const { author, content, isBot } = contextoMensagens.referencedMessage;
        const authorName = isBot ? 'Ava' : author.username;
        contextoChat += `Mensagem referenciada por ${authorName}: "${content}"\n`;
    }
    if (contextoMensagens.historico && contextoMensagens.historico.length > 0) {
        contextoChat += 'Histórico recente do canal:\n';
        contextoMensagens.historico.forEach((msg) => {
            const authorName = msg.isBot ? 'Ava' : msg.author.username;
            contextoChat += `[${authorName}]: ${msg.content}\n`;
        });
    }

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
    for await (const chunk of result) {
        const streamText = chunk.data.choices[0]?.delta?.content;
        if (streamText) {
            fullResponse += streamText;
        }
    }

    return fullResponse || '...';
}

/**
 * @description Função para executar o comando.
 * @param {object} interaction - A interação do usuário.
 */
async function execute(interaction) {
    const question = interaction.options.getString('pergunta');

    await interaction.deferReply();

    try {
        const resposta = await processarPergunta(interaction, question);
        await interaction.editReply(resposta);
    } catch (error) {
        console.error('Erro ao processar a pergunta:', error);
        await interaction.editReply({
            content: 'Ocorreu um erro ao processar sua pergunta.',
        });
    }
}

export { data, execute, processarPergunta };
