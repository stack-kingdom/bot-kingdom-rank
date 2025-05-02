/**
 * @fileoverview Comando para interagir com a IA Ava.
 */

import OpenAI from 'openai';
import { Mistral } from '@mistralai/mistralai';

/**
 * @description Configuração do modelo de IA.
 */
export const MODEL_CONFIG = {
    provider: 'mistral', // 'mistral' ou 'openai'
    model: 'mistral-large-latest', // 'mistral-small-latest', 'mistral-large-latest ou 'grok-3-beta',
    image: 'openai',
    stream: true,
    max_tokens: 600,
    temperature: 0.7,
};

/**
 * @class Models
 * @description Classe para interagir com os modelos de IA.
 * @method run
 * @method runImage
 */
export class Models {
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

    /**
     * @description Método para gerar uma imagem com a IA.
     * @param {string} question - A pergunta para gerar a imagem.
     * @returns {string} - URL da imagem gerada.
     */
    static async runImage(question) {
        if (MODEL_CONFIG.image === 'openai') {
            const openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
                baseURL: 'https://api.x.ai/v1',
            });

            const response = await openai.images.generate({
                model: 'grok-2-image-latest',
                prompt: question,
            });

            return response.data[0].url;
        }
    }
}
