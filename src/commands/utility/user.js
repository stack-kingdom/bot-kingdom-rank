/**
 * @fileoverview Perfil de metricas do usuário.
 */
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import rules from '../../utils/rules.js';
import { sql } from 'bun';

/**
 * @type {Object}
 * @description Dados do comando
 */
const data = new SlashCommandBuilder()
    .setName('perfil')
    .setDescription('Exibir suas pontuações de atividade')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('usuário')
            .setDescription('Exibir suas pontuações de atividade')
            .addUserOption((option) =>
                option
                    .setName('user')
                    .setDescription('Usuário para verificar (opcional)')
                    .setRequired(false)
            )
    );

/**
 * @description Função para executar o comando
 * @param {CommandInteraction} interaction
 * @return {Promise<void>}
 */
async function execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    let userData;
    try {
        const [row] = await sql`           
            WITH ranking AS (
                SELECT id,
                       username,
                       message_count,
                       call_count,
                       RANK() OVER (ORDER BY (message_count + call_count) DESC) as rank_position
                FROM users
            )
            SELECT username, message_count, call_count, rank_position 
            FROM ranking 
            WHERE id = ${user.id}
        `;
        userData = row;
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

    const embed = new EmbedBuilder()
        .setColor(rules.config.cor_bot)
        .setTitle(`Olá ${userData.username}`)
        .setDescription('Seus pontos de atividade:')
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields(
            {
                name: 'Mensagens de texto:',
                value: `${userData.message_count.toFixed(2)} XP ✨`,
                inline: true,
            },
            {
                name: 'Atividades nas calls:',
                value: `${userData.call_count.toFixed(2)} XP ️`,
                inline: true,
            },
            {
                name: 'Posição no ranking:',
                value: `${userData.rank_position}`,
                inline: false,
            }
        )
        .setTimestamp()
        .setFooter({ text: `${rules.config.nome_do_bot}` });

    await interaction.deferReply();
    await interaction.editReply({ embeds: [embed] });
}

export { data, execute };
