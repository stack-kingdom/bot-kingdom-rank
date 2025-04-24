import {
    StringSelectMenuBuilder,
    SlashCommandBuilder,
    ActionRowBuilder,
    MessageFlags
} from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('menu')
    .setDescription('Menu de seleção de comandos');

export const execute = async (interaction) => {
    const menu = new StringSelectMenuBuilder()
        .setCustomId('command-select')
        .setPlaceholder('Selecione um comando')
        .addOptions([
            {
                label: 'Perfil',
                description: 'Exibir suas pontuações de atividade',
                value: 'perfil',
                emoji: '👤',
            },
            {
                label: 'Rank',
                description: 'Exibir ranking de usuários',
                value: 'rank',
                emoji: '🏆',
            },
            {
                label: 'Regras',
                description: 'Exibir regras de pontos',
                value: 'regras',
                emoji: '📋',
            },
            {
                label: 'Ping',
                description: 'Testar latência do bot',
                value: 'ping',
                emoji: '🏓',
            },
            {
                label: 'Ava',
                description: 'Conversar com a IA do bot',
                value: 'ava',
                emoji: '🤖',
            },
        ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
        content: 'Selecione um dos comandos disponíveis:',
        components: [row],
        flags: MessageFlags.Ephemeral,
    });
};
