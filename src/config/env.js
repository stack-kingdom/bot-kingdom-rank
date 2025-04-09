/**
 * @fileoverview arquivo responsável por carregar as variáveis de ambiente do arquivo .env.
 */

import dotenv from 'dotenv';

const __dirname = import.meta.dir;

/**
 * @description Carrega as variáveis de ambiente do arquivo .env.
 */
dotenv.config({ path: `${__dirname}/../../.env` });

/**
 * @description Exporta as variáveis de ambiente como um objeto.
 */
export default { ...process.env };
