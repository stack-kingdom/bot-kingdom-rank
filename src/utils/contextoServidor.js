import { ChannelType } from 'discord.js';
import rules from './rules.js';

/**
 * @description Função para gerar o contexto do servidor.
 * @param {object} interaction - A interação do usuário.
 * @returns {object} - O contexto do servidor.
 */
const contextoServidor = async (interaction) => {
    const criador = '<@786049927787839519>';
    const guild = interaction.guild;
    const userId = interaction.user.id;
    const userDisplayName = interaction.user.displayName;
    const nomeServer = guild.name;
    const memberCount = guild.memberCount;

    await guild.members.fetch();

    const todosCargos = guild.roles.cache
        .filter((role) => role.name !== '@everyone')
        .map((role) => `'${role.name}' (ID: ${role.id})`)
        .join(', ');
    const todosCanais = guild.channels.cache
        .filter((channel) => channel.type !== ChannelType.GuildCategory)
        .map((channel) => `#${channel.name} (ID: ${channel.id})`)
        .join(', ');
    const todosMembros =
        guild.members.cache
            .filter((member) => member.user && !member.user.bot)
            .map((member) => `<@${member.id}>`)
            .slice(0, 20)
            .join(', ') || 'Nenhum membro encontrado.';
    const membrosOnline =
        guild.members.cache
            .filter((member) => member.presence?.status === 'online')
            .map((member) => `<@${member.id}>`)
            .join(', ') || 'Nenhum membro online encontrado.';

    return {
        criador,
        userId,
        userDisplayName,
        nomeServer,
        memberCount,
        rules,
        todosCargos,
        todosCanais,
        todosMembros,
        membrosOnline,
    };
};

export default contextoServidor;
