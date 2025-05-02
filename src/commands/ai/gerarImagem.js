/**
 * @fileoverview Comando para gerar imagens com a IA Ava.
 */

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import rules from '../../utils/rules.js';
import { Models } from '../../utils/Models.js';

/**
 * @description Comando para gerar imagens com a IA Ava.
 * @type {SlashCommandOptionsOnlyBuilder}
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
    const subcommand = interaction.options.getSubcommand();
    const prompt =
        subcommand === 'imagem'
            ? interaction.options.getString('prompt')
            : null;

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
        await interaction.editReply({
            content: 'Ocorreu um erro ao gerar sua imagem.',
        });
    }
}

export { data, execute };
