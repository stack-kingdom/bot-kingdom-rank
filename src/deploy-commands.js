/**
 * @fileoverview arquivo para deploy de comandos do bot.
 */

import { REST, Routes } from 'discord.js';
import { Glob } from 'bun';

const glob = new Glob('./commands/**/*.js');
const commands = [];
const commandFiles = [...glob.scanSync(import.meta.dir)];

/**
 * @description Loop para adicionar os comandos na lista de comandos
 */
for (const file of commandFiles) {
    const { data } = await import(file);
    commands.push(data.toJSON());
}

/**'
 * @type {REST}
 * @description Cliente para interagir com a API do Discord
 */
const rest = new REST({ version: '10' }).setToken(Bun.env.TOKEN);

/**
 * @description Função para deploy dos comandos do bot
 */
try {
    console.log('Iniciando o deploy dos comandos...');
    await rest.put(
        Routes.applicationCommands(Bun.env.CLIENT_ID, Bun.env.GUILD_ID),
        { body: commands }
    );

    console.log('Comandos deployados com sucesso!');
} catch (error) {
    console.error('Erro ao fazer deploy dos comandos:', error.message);
}
