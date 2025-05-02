/**
 * @fileoverview Comando para interagir com a IA Ava.
 */

import { SlashCommandBuilder } from 'discord.js';
import { processarPergunta } from '../../utils/processarPerguntas.js';

/**
 * @description Comando para interagir com a IA Ava.
 * @type {import('discord.js').SlashCommandBuilder}
 */
const data = new SlashCommandBuilder()
    .setName('ava')
    .setDescription('Comandos relacionados à Ava')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('chat')
            .setDescription('Faça uma pergunta para a Ava')
            .addStringOption((option) =>
                option
                    .setName('pergunta')
                    .setDescription('A pergunta que você quer fazer')
                    .setRequired(true)
            )
    );

/**
 * @description Função para executar o comando.
 * @param {object} interaction - A interação do usuário.
 */
async function execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    const question =
        subcommand === 'chat'
            ? interaction.options.getString('pergunta')
            : null;

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

export { data, execute };
