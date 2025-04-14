/**
 * @fileoverview Exibir o rank de usuários.
 */
import {
    CommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from 'discord.js';
import { pool } from '../../../data/database.js';
import rules from '../../utils/rules.js';
/**
 * @description Dados do comando
 * @type {Object}
 */
const data = new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Exibir ranking de atividade dos usuários');
/**
 * @description Função para executar o comando
 * @param {CommandInteraction} interaction
 * @return {Promise<void>}
 */
async function execute(interaction) {
    let users;
    try {
        const { rows } = await pool.query(
            'SELECT username, message_count, call_count FROM users ORDER BY (message_count + call_count) DESC LIMIT 10'
        );
        users = rows;
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

    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Top 10 ranking de usuários')
        .setDescription('Confira os usuários mais ativos:')
        .addFields(
            users.map((user, index) => {
                const position = index + 1;
                let medal = '';
                if (position === 1) medal = '🥇 ';
                else if (position === 2) medal = '🥈 ';
                else if (position === 3) medal = '🥉 ';
                else medal = '🎖️ ';

                return {
                    name: `${medal} ${position}° ${user.username} ${(
                        user.message_count + user.call_count
                    ).toFixed(2)} **XP**`,
                    value: ``,
                    inline: false,
                };
            })
        )
        .setTimestamp()
        .setFooter({ text: `${rules.config.nome_do_bot}` });

    await interaction.deferReply();
    await interaction.editReply({ embeds: [embed] });
}

export { data, execute };
