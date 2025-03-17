/**
 * @fileoverview Perfil de metricas do usuário.
 */

import { SlashCommandBuilder } from 'discord.js';
import { openDb } from '../../../data/database.js';

/**
 * @type {Object}
 * @description Dados do comando
 */
const data = new SlashCommandBuilder()
    .setName('user_info')
    .setDescription('Minhas pontuações de atividade');

/**
 * @param {CommandInteraction} interaction
 * @description Função para executar o comando
 */
async function execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    let userData;
    try {
        const db = await openDb();
        userData = await db.get(
            'SELECT username, message_count FROM users WHERE id = ?',
            user.id
        );
    } catch (error) {
        await interaction.reply(
            'Ops 🫠! Não conseguimos encontrar os dados do usuário no momento... tente novamente mais tarde.'
        );
        console.error('Erro ao buscar dados do usuário:', error);
        return;
    }
    if (!userData) {
        await interaction.reply('Nenhum usuário encontrado');
        return;
    }

    const embed = {
        color: 0x0099ff,
        title: `Olá ${userData.username}`,
        description: `Seus pontos de atividade:`,
        thumbnail: {
            url: user.displayAvatarURL({ dynamic: true }),
        },
        fields: [
            {
                name: 'Mensagens de texto:',
                value: `${userData.message_count} XP ✨`,
                inline: true,
            },
            {
                name: 'Atividades nas calls:',
                value: 'Em breve...',
                inline: false,
            },
        ],
        timestamp: new Date(),
        footer: {
            text: 'Bot Kingdom Rank',
        },
    };

    await interaction.reply({ embeds: [embed] });
}

export { data, execute };
