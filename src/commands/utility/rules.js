import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import rules from '../../utils/rules.js';

/**
 * @description Arredondar o tempo de atividade em call
 * @type {number}
 */
const callsRounded = Math.round(rules.events.calls / 1000);

/**
 * @description Dados do comando
 * @type {Object}
 */
const data = new SlashCommandBuilder()
    .setName('rules')
    .setDescription('Exibir regras de pontuação');

/**
 * @description Função para executar o comando
 * @param {CommandInteraction} interaction
 * @returns {Promise<void>}
 */
async function execute(interaction) {
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Regras de pontos: ')
        .setImage('https://th.bing.com/th/id/OIG2.HFXTcK3gNTNKT.qmOXgl?w=1024&h=1024&rs=1&pid=ImgDetMain')
        .addFields({
            name: 'Mensagens:', value: `XP: ${rules.points.mensagens} por mensagem`, inline: false,
        }, {
            name: 'Atividade em call:',
            value: `XP: ${rules.points.calls} à cada ${callsRounded} segundos`,
            inline: false,
        }, {
            name: 'nitro', value: `XP: ${rules.points.nitro} por nitro enviado`, inline: false,
        }, {
            name: 'Spam não é permitido', value: 'Passível de punição.', inline: false,
        })
        .setTimestamp()
        .setFooter({ text: `${rules.config.nome_do_bot}` });

    await interaction.reply({ embeds: [embed] });
}

export { data, execute };