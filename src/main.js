/**
 * @fileoverview arquivo principal do bot.
 */
import { Client, Events, GatewayIntentBits, Collection } from 'discord.js';
import './config/env.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { openDb, createTable } from '../data/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOT_RULES = () => {
    try {
        return JSON.parse(fs.readFileSync('./rules.json', 'utf8'));
    } catch (error) {
        console.error('Erro ao ler arquivo JSON:', error);
        return {};
    }
};

/**
 * @type {Client}
 * @description Cliente do bot para interagir com a API do Discord
 */
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

/**
 * @type {Collection}
 * @description Coleção de comandos do bot
 */
client.commands = new Collection();

/**
 * @description Função para carregar os comandos do bot automaticamente
 */
const commandsPath = path.join(__dirname, 'commands/utility');
const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
    const { data, execute } = await import(path.join(commandsPath, file));
    client.commands.set(data.name, { data, execute });
}

/**
 * @event ClientReady
 * @description Evento que é emitido quando o bot está pronto para ser utilizado
 */
client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Bot ${readyClient.user.tag} está online!`);
    await createTable();
});

/**
 * @event MessageCreate
 * @description Evento que é emitido quando uma mensagem é criada
 */
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const db = await openDb();
    const user = await db.get(
        'SELECT * FROM users WHERE id = ?',
        message.author.id
    );

    const rules = BOT_RULES();

    if (rules[message.content]) {
        await message.reply(rules[message.content]);
        console.log(message.content);
    }
    if (user) {
        await db.run(
            `UPDATE users SET message_count = message_count + ${rules.points.mensagens} WHERE id = ?`,
            message.author.id
        );
    } else {
        await db.run(
            'INSERT INTO users (id, username, message_count) VALUES (?, ?, ?)',
            message.author.id,
            message.author.username,
            1
        );
    }
});

/**
 * @event InteractionCreate
 * @description Evento que é emitido quando uma interação é criada
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
            ephemeral: true,
        });
    }
});

/**
 * @description Iniciar o bot
 * @param {string} process.env.TOKEN - Token de autenticação do bot
 */
client.login(process.env.TOKEN);
