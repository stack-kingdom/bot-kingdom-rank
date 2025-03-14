/**
 * @fileoverview comando de ping.
 */

import { SlashCommandBuilder } from 'discord.js';

/**
 * @constant data
 * @description Dados do comando
 * @type {SlashCommandBuilder}
 * @memberof module:commands/utility/ping
 */
export const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!');
console.log('request received');

export async function execute(interaction) {
    await interaction.reply('Pong!');
}
