import {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits,
} from 'discord.js';
import { scrapeFreeUdemyCourses } from '../../utils/udemyScraper.js';
import rules from '../../utils/rules.js';

export const data = new SlashCommandBuilder()
    .setName('cursos')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDescription('Exibir cursos gratuitos disponíveis na Udemy');

const cursosEmbed = (curso) => {
    return new EmbedBuilder()
        .setColor(rules.config.cor_bot)
        .setTitle(curso.titulo)
        .setDescription(curso.headline || 'Descrição não disponível.')
        .setURL(curso.link)
        .setImage(curso.image)
        .setFooter({ text: 'Fonte: Udemy' })
        .setTimestamp();
};

export async function execute(interaction) {
    await interaction.deferReply();
    try {
        const cursos = await scrapeFreeUdemyCourses();

        if (!cursos || cursos.length === 0) {
            return interaction.editReply(
                'Nenhum curso gratuito disponível no momento.'
            );
        }

        const embedsAndComponents = cursos
            .slice(0, 5)
            .map((curso) => {
                if (!curso.titulo || !curso.link) return null;

                console.log(`Embed para curso "${curso.titulo}":`, {
                    image: curso.image,
                });

                const embed = cursosEmbed(curso);

                const button = new ButtonBuilder()
                    .setLabel('Acesse o curso aqui')
                    .setURL(curso.link)
                    .setStyle(ButtonStyle.Link);

                const row = new ActionRowBuilder().addComponents(button);

                return { embed, components: [row] };
            })
            .filter(Boolean);

        for (const { embed, components } of embedsAndComponents) {
            await interaction.followUp({ embeds: [embed], components });
        }
    } catch (error) {
        console.error('Erro em comando /cursos:', error);
        await interaction.editReply(
            'Erro ao buscar cursos. Tente novamente mais tarde.'
        );
    }
}
