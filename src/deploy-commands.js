/**
 * @fileoverview arquivo para deploy de comandos do bot.
 */

import { REST, Routes } from 'discord.js';
import './config/env.js';
import { readdirSync } from 'node:fs';

const __dirname = import.meta.dirname;

/**
 * @type {Array}
 * @description Lista de comandos do bot
 */
const commands = [];

/**
 * @description Função para carregar os comandos do bot automaticamente
 */
const commandsPath = `${__dirname}/commands/utility`;

/**
 * @type {Array}
 * @description Lista de arquivos de comandos do bot
 */
const commandFiles = readdirSync(commandsPath);
const jsFiles = commandFiles.filter((file) => file.endsWith('.js'));

/**
 * @description Loop para adicionar os comandos na lista de comandos
 */
for (const file of jsFiles) {
    const { data } = await import(`${commandsPath}/${file}`);
    commands.push(data.toJSON());
}

/**
 * @type {REST}
 * @description Cliente para interagir com a API do Discord
 */
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

/**
 * @description Função para deploy dos comandos do bot
 */
try {
    console.log('Iniciando o deploy dos comandos...');
    await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
    );

    console.log('Comandos deployados com sucesso!');
} catch (error) {
    console.error('Erro ao fazer deploy dos comandos:', error.message);
}
