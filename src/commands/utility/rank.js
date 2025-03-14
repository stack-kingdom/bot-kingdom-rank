/**
 * @fileoverview comando para exibir o rank de usuários.
 */
import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { openDb } from '../../../data/database.js';

/**
 * @type {Object}
 * @description Dados do comando
 */
const data = new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Exibir rank de usuários');

/**
 * @param {CommandInteraction} interaction
 * @description Função para executar o comando
 */
async function execute(interaction) {
    let users;
    try {
        const db = await openDb();
        users = await db.all(
            'SELECT username, message_count FROM users ORDER BY message_count DESC LIMIT 10'
        );
    } catch (error) {
        await interaction.reply(
            'Ops 🫠! Não conseguimos encontrar os dados do ranking no momento... tente novamente mais tarde.'
        );
        console.error('Erro ao buscar ranking:', error);
        return;
    }
    if (!users || users.length === 0) {
        await interaction.reply('Nenhum usuário encontrado');
        return;
    }

    let reply = 'Rank de usuários:\n';
    users.forEach((user, index) => {
        const position = index + 1;
        reply += `\`${position}\` **${user.username}** - \`${user.message_count}\` mensagens\n`;
    });

    await interaction.deferReply();
    await interaction.editReply(reply);
}

export { data, execute };
