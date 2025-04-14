import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Mistral } from '@mistralai/mistralai';
import rules from '../../utils/rules.js';
import { generateAvaSystemPrompt } from '../../prompts/avaSystemPrompt.js';

const data = new SlashCommandBuilder()
    .setName('ava')
    .setDescription('Comandos relacionados à Ava')
    .addStringOption((option) =>
        option
            .setName('pergunta')
            .setDescription('A pergunta que você quer fazer')
            .setRequired(true)
    );

async function execute(interaction) {
    const question = interaction.options.getString('pergunta');
    if (!process.env.MISTRAL_API_KEY) {
        await interaction.reply({
            content: 'Erro: Chave da API não configurada.',
            ephemeral: true,
        });
        return;
    }
    const userQuestion = interaction.user.displayName;
    const userId = interaction.user.id;
    const nomeServer = interaction.guild.name;
    const memberCount = interaction.client.guilds.cache.reduce(
        (acc, guild) => acc + guild.memberCount,
        0
    );

    const mistral = new Mistral({
        apiKey: process.env.MISTRAL_API_KEY,
    });

    await interaction.deferReply();

    try {
        const systemContent = generateAvaSystemPrompt({
            userId,
            userQuestion,
            nomeServer,
            memberCount,
            rules,
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
            .setColor('#0099ff')
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
