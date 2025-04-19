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
    .setName('regras')
    .setDescription('Exibir regras de pontos')
    .addSubcommand((subcommand) =>
        subcommand.setName('pontos').setDescription('Exibir regras de pontos')
    );

/**
 * @description Função para executar o comando
 * @param {CommandInteraction} interaction
 * @returns {Promise<void>}
 */
async function execute(interaction) {
    const embed = new EmbedBuilder()
        .setColor(rules.config.cor_bot)
        .setTitle('Regras')
        .setImage(
            'https://i.pinimg.com/736x/b6/97/0b/b6970ba1e6d8773088b5dc4af68cb4f4.jpg'
        )
        .addFields(
            {
                name: 'Mensagens:',
                value: `XP: ${rules.points.mensagens} por mensagem.`,
                inline: false,
            },
            {
                name: 'Atividade em call:',
                value: `XP: ${rules.points.calls} à cada ${callsRounded} segundos.`,
                inline: false,
            },
            {
                name: 'Nitro:',
                value: `XP: ${rules.points.nitro} por nitro enviado.`,
                inline: false,
            },
            {
                name: 'Spam:',
                value: 'Passível de punição.',
                inline: false,
            }
        )
        .setTimestamp()
        .setFooter({ text: `${rules.config.nome_do_bot}` });

    await interaction.reply({ embeds: [embed] });
}

export { data, execute };
