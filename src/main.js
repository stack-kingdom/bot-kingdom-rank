/**
 * @fileoverview arquivo principal do bot.
 */
import {
    Client,
    Collection,
    Events,
    GatewayIntentBits,
    MessageFlags,
} from 'discord.js';
import { Glob } from 'bun';
import { pool, createTable } from '../data/database.js';
import rules from './utils/rules.js';
import { processarPergunta } from './utils/processarPerguntas.js';

const dbClient = pool;
/**
 * @type {Client}
 * @description Cliente do bot para interagir com a API do Discord
 */
export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessagePolls,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.MessageContent,
    ],
});

client.commands = new Collection();
/**
 * @type {Set}
 * @description Lista de usuários em call de voz
 */
const usersInVoice = new Set();

const glob = new Glob('./commands/**/*.js');
const commandFiles = [...glob.scanSync(import.meta.dir)];

/**
 * @description Carregar os comandos do bot
 */
for (const file of commandFiles) {
    const { data, execute } = await import(`${import.meta.dir}/${file}`);
    client.commands.set(data.name, { data, execute });
}

/**
 * @description Evento para inicializar o bot
 */
client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Bot ${readyClient.user.tag} está online!`);
    await createTable();
});

/**
 * @description Evento para pontuar os usuários por mensagens enviadas
 * @param {Message} message - A mensagem enviada pelo usuário
 */
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (!message.author.bot) {
        const pontos = rules.points.mensagens || 1;
        const user = await dbClient.query('SELECT * FROM users WHERE id = $1', [
            message.author.id,
        ]);

        if (user.rows.length > 0) {
            await dbClient.query(
                'UPDATE users SET message_count = message_count + $1 WHERE id = $2',
                [pontos, message.author.id]
            );
        } else {
            await dbClient.query(
                'INSERT INTO users (id, username, message_count) VALUES ($1, $2, $3)',
                [message.author.id, message.author.username, pontos]
            );
        }

        await dbClient.query(
            'INSERT INTO messages (id, user_id, points) VALUES ($1, $2, $3)',
            [message.id, message.author.id, pontos]
        );
    }
});

/**
 * @description Evento para chamar o Bot com @
 * @param {Message} message - A mensagem enviada pelo usuário
 * Este evento é acionado sempre que uma mensagem é criada no canal.
 * Ele verifica se a mensagem menciona o bot e, se for o caso, processa a mensagem
 * para responder à pergunta ou solicitação do usuário.
 */
client.on('messageCreate', async (message) => {
    if (
        message.mentions.has(client.user) &&
        !message.content.startsWith('/') &&
        !message.mentions.everyone
    ) {
        const content = message.content
            .replace(`<@${client.user.id}>`, '')
            .trim();
        if (!content) {
            return message.reply(
                'Oiê! Me menciona com uma pergunta pra eu te responder!'
            );
        }

        let contextoMensagens = {};
        try {
            if (message.reference && message.reference.messageId) {
                const referencedMessage = await message.channel.messages.fetch(
                    message.reference.messageId
                );
                contextoMensagens.referencedMessage = {
                    author: referencedMessage.author,
                    content: referencedMessage.content,
                    isBot: referencedMessage.author.id === client.user.id,
                };
            }

            const messages = await message.channel.messages.fetch({
                limit: 5,
                before: message.id,
            });
            contextoMensagens.historico = messages
                .filter(
                    (msg) =>
                        msg.id !== message.id &&
                        (!msg.author.bot || msg.author.id === client.user.id)
                )
                .map((msg) => ({
                    author: msg.author,
                    content: msg.content,
                    isBot: msg.author.id === client.user.id,
                }));
        } catch (error) {
            console.error('Erro ao coletar contexto de mensagens:', error);
        }

        const fakeInteraction = {
            guild: message.guild,
            channel: message.channel,
            user: message.author,
            client: client,
            deferReply: async () => {
                await message.channel.sendTyping();
            },
            editReply: async (content) => {
                await message.reply(content);
            },
        };

        try {
            const resposta = await processarPergunta(
                fakeInteraction,
                content,
                contextoMensagens
            );
            await message.reply(resposta);
        } catch (error) {
            console.error('Erro ao processar menção:', error);
            await message.reply(
                'Opa, deu um erro aqui! Tenta de novo, mano! 😅'
            );
        }
    }
});

/**
 * @description Evento para remover os pontos de mensagens deletadas
 */
client.on('messageDelete', async (message) => {
    if (!message.author || message.author.bot) return;
    const msgData = await dbClient.query(
        'SELECT points FROM messages WHERE id = $1',
        [message.id]
    );

    if (msgData.rows.length > 0) {
        await dbClient.query(
            'UPDATE users SET message_count = message_count - $1 WHERE id = $2',
            [msgData.rows[0].points, message.author.id]
        );
        await dbClient.query('DELETE FROM messages WHERE id = $1', [
            message.id,
        ]);
    }
});

/**
 * @description Evento para pontuar os usuários em call de voz
 */
client.on('voiceStateUpdate', async (oldState, newState) => {
    if (oldState.member.user.bot) return;
    const userId = oldState.member.user.id;

    if (oldState.channelId === null && newState.channelId !== null) {
        usersInVoice.add(userId);
    } else if (newState.channelId === null) {
        usersInVoice.delete(userId);
    }
});

/**
 * @description Evento para pontuar os usuários em call de voz
 */
setInterval(async () => {
    if (usersInVoice.size === 0) return;

    for (const userId of usersInVoice) {
        try {
            const user = await dbClient.query(
                'SELECT * FROM users WHERE id = $1',
                [userId]
            );

            if (user.rows.length > 0) {
                await dbClient.query(
                    'UPDATE users SET call_count = call_count + $1 WHERE id = $2',
                    [rules.points.calls, userId]
                );
            } else {
                const member = client.users.cache.get(userId);
                if (member) {
                    await dbClient.query(
                        'INSERT INTO users (id, username, message_count, call_count) VALUES ($1, $2, $3, $4)',
                        [userId, member.username, 0, rules.points.calls]
                    );
                }
            }
        } catch (error) {
            console.error(`Erro ao processar o usuário ${userId}:`, error);
        }
    }
}, rules.events.calls);

/**
 * @description Evento para verificar se o bot está em um servidor autorizado
 */
client.on('guildAvailable', async (guild) => {
    const allowedGuildId = Bun.env.GUILD_ID;
    if (guild.id !== allowedGuildId) {
        try {
            await guild.leave();
            console.log(`Bot saiu de ${guild.name} (não autorizado).`);
        } catch (error) {
            console.error(`Erro ao sair de ${guild.name}:`, error);
        }
    } else {
        console.log(`Bot entrou no servidor ${guild.name}`);
    }
});
/**
 * @description Evento para ouvir as interações do bot
 */
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'Houve um erro ao executar esse comando!',
            flags: MessageFlags.Ephemeral,
        });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;

    if (interaction.customId === 'command-select') {
        const selectedValue = interaction.values[0];

        switch (selectedValue) {
            case 'ava':
                await interaction.reply({
                    content:
                        'Use `/ava pergunta` para conversar com a IA do bot',
                    flags: MessageFlags.Ephemeral,
                });
                break;
            case 'perfil':
                await interaction.reply({
                    content: 'Use `/perfil usuário` para ver seu perfil',
                    flags: MessageFlags.Ephemeral,
                });
                break;
            case 'rank':
                await interaction.reply({
                    content: 'Use `/rank atividade` para ver o ranking',
                    flags: MessageFlags.Ephemeral,
                });
                break;
            case 'regras':
                await interaction.reply({
                    content:
                        'Use `/regras` para ver as regras de pontuação do servidor',
                    flags: MessageFlags.Ephemeral,
                });
                break;
            case 'ping':
                await interaction.reply({
                    content: 'Use `/ping` para verificar a latência do bot',
                    flags: MessageFlags.Ephemeral,
                });
                break;
            default:
                await interaction.reply({
                    content: `Use \`/${selectedValue}\` para executar este comando`,
                    flags: MessageFlags.Ephemeral,
                });
        }
    }
});

client.login(Bun.env.TOKEN);
