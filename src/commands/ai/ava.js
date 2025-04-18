import { SlashCommandBuilder, EmbedBuilder, ChannelType } from 'discord.js';
import { Mistral } from '@mistralai/mistralai';
import rules from '../../utils/rules.js';
import { generateAvaSystemPrompt } from '../../prompts/avaSystemPrompt.js';

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
            .slice(0, 100)
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

async function execute(interaction) {
    const question = interaction.options.getString('pergunta');
    if (!process.env.MISTRAL_API_KEY) {
        await interaction.reply({
            content: 'Erro: Chave da API não configurada.',
            ephemeral: true,
        });
        return;
    }

    const canMention = interaction.channel
        .permissionsFor(interaction.client.user)
        .has('MentionEveryone');
    if (!canMention) {
        console.warn(
            `Bot não tem permissão para mencionar membros no canal ${interaction.channel.name} (ID: ${interaction.channel.id}).`
        );
    }

    const contexto = await contextoServidor(interaction);

    const mistral = new Mistral({
        apiKey: process.env.MISTRAL_API_KEY,
    });

    await interaction.deferReply();

    try {
        const systemContent = generateAvaSystemPrompt({
            ...contexto,
        });

        const result = await mistral.chat.stream({
            model: 'mistral-small-latest',
            temperature: 0.2,
            max_tokens: 400,
            messages: [
                {
                    role: 'system',
                    content: systemContent,
                },
                {
                    role: 'user',
                    content: question,
                },
            ],
        });

        let fullResponse = '';
        for await (const chunk of result) {
            const streamText = chunk.data.choices[0]?.delta?.content;
            if (streamText) {
                fullResponse += streamText;
            }
        }

        const embed = new EmbedBuilder()
            .setColor(rules.config.cor_bot)
            .setDescription(fullResponse || '...')
            .setTimestamp()
            .setFooter({ text: `${rules.config.nome_do_bot}` });

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error(
            'Erro ao chamar a API Mistral ou processar stream:',
            error
        );
        if (interaction.deferred || interaction.replied) {
            await interaction
                .editReply({
                    content: 'Ocorreu um erro ao processar sua pergunta.',
                    embeds: [],
                })
                .catch(console.error);
        } else {
            await interaction
                .reply({
                    content: 'Ocorreu um erro ao processar sua pergunta.',
                    ephemeral: true,
                })
                .catch(console.error);
        }
    }
}

export { data, execute };
