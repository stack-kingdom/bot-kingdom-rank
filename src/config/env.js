/**
 * @fileoverview arquivo responsável por carregar as variáveis de ambiente do arquivo .env.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * @constant __dirname
 * @description Constante que armazena o diretório atual do arquivo.
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @description Carrega as variáveis de ambiente do arquivo .env.
 */
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * @description Exporta as variáveis de ambiente como um objeto.
 */
export default { ...process.env };
