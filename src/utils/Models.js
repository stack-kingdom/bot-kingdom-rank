/**
 * @fileoverview Comando para interagir com a IA Ava.
 */

import OpenAI from 'openai';
import { Mistral } from '@mistralai/mistralai';

/**
 * @description Configuração do modelo de IA.
 */
const MODEL_CONFIG = {
    provider: 'mistral', // 'mistral' ou 'openai'
    model: 'mistral-small-latest', // 'mistral-small-latest' ou 'grok-3-beta',
    stream: true,
    max_tokens: 700,
    temperature: 0.7,
};

/**
 * @class Models
 * @description Classe para interagir com os modelos de IA.
 * @method run
 */
export default class Models {
    static async run({ question, systemContent = '' }) {
        const messages = [];

        if (systemContent) {
            messages.push({
                role: 'system',
                content: systemContent,
            });
        }

        messages.push({
            role: 'user',
            content: question,
        });

        const { provider, model, stream, max_tokens, temperature } =
            MODEL_CONFIG;

        if (provider === 'mistral') {
            const mistral = new Mistral({
                apiKey: process.env.MISTRAL_API_KEY,
            });

            const payload = {
                model,
                max_tokens,
                temperature,
                messages,
            };

            return await mistral.chat.stream({
                ...payload,
            });
        }

        if (provider === 'openai') {
            const client = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
                baseURL: 'https://api.x.ai/v1',
            });

            const payload = {
                model,
                max_tokens,
                messages,
                temperature,
            };

            if (stream) {
                return client.chat.completions.create({
                    ...payload,
                    stream: true,
                });
            }

            const result = await client.chat.completions.create(payload);
            return result.choices[0].message.content;
        }
        throw new Error(`Provider ${provider} não suportado.`);
    }
}
