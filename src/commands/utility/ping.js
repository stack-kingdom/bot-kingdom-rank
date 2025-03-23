/**
 * @fileoverview comando de ping.
 */

import { SlashCommandBuilder } from 'discord.js';

/**
 * @description Dados do comando
 * @constant data
 * @type {Object}
 * @memberof module:commands/utility/ping
 */
export const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Responde com Pong!');
console.log('request received');

/**
 * @description Função para executar o comando
 * @function execute
 * @param {CommandInteraction} interaction
 * @returns {Promise<void>}
 */
export async function execute(interaction) {
    await interaction.reply('Pong!');
}
