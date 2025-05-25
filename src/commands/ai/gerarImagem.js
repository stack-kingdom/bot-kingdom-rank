/**
 * @fileoverview Comando para gerar imagens com a IA Ava.
 */

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import rules from '../../utils/rules.js';
import { Models } from '../../utils/Models.js';

/**
 * @description Comando para gerar imagens com a IA Ava.
 * @type {SlashCommandBuilder}
 */
const data = new SlashCommandBuilder()
    .setName('gerar')
    .setDescription('Comando para gerar imagens com a Ava')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('imagem')
            .setDescription('Gere uma imagem com a IA Ava')
            .addStringOption((option) =>
                option
                    .setName('prompt')
                    .setDescription('Descrição da imagem que você quer gerar')
                    .setRequired(true)
            )
    );

/**
 * @description Função para executar o comando de geração de imagem.
 * @param {object} interaction - A interação do usuário.
 */
async function execute(interaction) {
    const prompt = interaction.options.getString('prompt');
    const imageSize = interaction.options.getString('tamanho') || '1024x1024';

    await interaction.deferReply();

    try {
        const imagePrompt = await Models.runImage(prompt);

        const embed = new EmbedBuilder()
            .setColor(rules.config.cor_bot)
            .setImage(imagePrompt)
            .setTimestamp()
            .setFooter({ text: `${rules.config.nome_do_bot}` });

        await interaction.editReply({
            content: 'Prontinho!',
            embeds: [embed],
        });
    } catch (error) {
        console.error('Erro ao gerar a imagem:', error);

        if (
            error.message &&
            error.message.includes(
                'Generated image rejected by content moderation'
            )
        ) {
            await interaction.editReply({
                content:
                    '⚠️ Não foi possível gerar sua imagem pois o prompt contém conteúdo inadequado. Por favor, tente um prompt diferente que não viole as diretrizes de conteúdo.',
            });
        } else {
            await interaction.editReply({
                content: 'Ocorreu um erro ao gerar sua imagem.',
            });
        }
    }
}

export { data, execute };
