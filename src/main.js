/**
 * @fileoverview arquivo principal do bot.
 */
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import './config/env.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool, createTable } from '../data/database.js';
import rules from './utils/rules.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbClient = pool;
/**
 * @type {Client}
 * @description Cliente do bot para interagir com a API do Discord
 */
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates],
});

client.commands = new Collection();
/**
 * @type {Set}
 * @description Lista de usuários em call de voz
 */
const usersInVoice = new Set();

/**
 * @description Função para carregar os comandos do bot automaticamente
 */
const commandsPath = path.join(__dirname, 'commands/utility');
const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('.js'));

/**
 * @description Carregar os comandos do bot
 */
for (const file of commandFiles) {
    const { data, execute } = await import(path.join(commandsPath, file));
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
 */
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const pontos = rules.points.mensagens || 1;
    const user = await dbClient.query('SELECT * FROM users WHERE id = $1', [message.author.id]);

    if (user.rows.length > 0) {
        await dbClient.query('UPDATE users SET message_count = message_count + $1 WHERE id = $2', [pontos, message.author.id]);
    } else {
        await dbClient.query('INSERT INTO users (id, username, message_count) VALUES ($1, $2, $3)', [message.author.id, message.author.username, pontos]);
    }

    await dbClient.query('INSERT INTO messages (id, user_id, points) VALUES ($1, $2, $3)', [message.id, message.author.id, pontos]);
});

/**
 * @description Evento para remover os pontos de mensagens deletadas
 */
client.on('messageDelete', async (message) => {
    if (!message.author || message.author.bot) return;
    const msgData = await dbClient.query('SELECT points FROM messages WHERE id = $1', [message.id]);

    if (msgData.rows.length > 0) {
        await dbClient.query('UPDATE users SET message_count = message_count - $1 WHERE id = $2', [msgData.rows[0].points, message.author.id]);
        await dbClient.query('DELETE FROM messages WHERE id = $1', [message.id]);
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
            const user = await dbClient.query('SELECT * FROM users WHERE id = $1', [userId]);

            if (user.rows.length > 0) {
                await dbClient.query('UPDATE users SET call_count = call_count + $1 WHERE id = $2', [rules.points.calls, userId]);
            } else {
                const member = client.users.cache.get(userId);
                if (member) {
                    await dbClient.query('INSERT INTO users (id, username, message_count, call_count) VALUES ($1, $2, $3, $4)', [userId, member.username, 0, rules.points.calls]);
                }
            }
        } catch (error) {
            console.error(`Erro ao processar o usuário ${userId}:`, error);
        }
    }
}, rules.events.calls);

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
            content: 'Houve um erro ao executar esse comando!', ephemeral: true,
        });
    }
});

client.login(process.env.TOKEN);