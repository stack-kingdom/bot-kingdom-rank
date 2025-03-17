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
    .setDescription('Exibir ranking de atividade dos usuários');

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

    const embed = {
        color: 0x0099ff,
        title: 'Top 10 ranking de usuários',
        description: 'Confira os usuários mais ativos:',
        fields: users.map((user, index) => {
            const position = index + 1;
            let medal = '';
            if (position === 1) medal = '🥇 ';
            else if (position === 2) medal = '🥈 ';
            else if (position === 3) medal = '🥉 ';
            else medal = '🎖️ ';

            return {
                name: `${medal} ${position}° ${user.username} ${user.message_count} **XP** ✨`,
                value: ``,
                inline: false,
            };
        }),
        timestamp: new Date(),
        footer: {
            text: 'Bot Kingdom Rank',
        },
    };

    await interaction.deferReply();
    await interaction.editReply({ embeds: [embed] });
}

export { data, execute };
