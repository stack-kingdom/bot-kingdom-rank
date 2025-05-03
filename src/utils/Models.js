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
    /**
     * @method run
     * @description Método para interagir com o modelo de IA.
     * @param {string} question - Pergunta a ser feita ao modelo.
     * @param {string} systemContent - Conteúdo do sistema.
     * @returns {Promise<string>} Resposta do modelo.
     */
    static async run({ question, systemContent = '' }) {
        if (typeof question !== 'string' || question.trim() === '') {
            return Promise.reject(
                new Error(
                    `O parâmetro 'question' deve ser uma string não vazia. Valor recebido: ${question}`
                )
            );
        }

        if (typeof systemContent !== 'string') {
            return Promise.reject(
                new Error(
                    `O parâmetro 'systemContent' deve ser uma string. Valor recebido: ${systemContent}`
                )
            );
        }

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

            return mistral.chat.stream({
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

            return client.chat.completions
                .create(payload)
                .then((result) => {
                    return result.choices[0].message.content;
                })
                .catch((error) => {
                    throw new Error(
                        `Erro ao interagir com o modelo de IA: ${error.message}`
                    );
                });
        }

        return Promise.reject(new Error(`Provider ${provider} não suportado.`));
    }

    /**
     * @description Método para gerar uma imagem com a IA.
     * @param {string} question - A pergunta para gerar a imagem.
     * @returns {string} - URL da imagem gerada.
     */
    static async runImage(question) {
        if (typeof question !== 'string' || question.trim() === '') {
            return Promise.reject(
                new Error(
                    `O parâmetro 'question' deve ser uma string não vazia. Valor recebido: ${question}`
                )
            );
        }

        const model = 'grok';

        if (model === 'grok') {
            const openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
                baseURL: 'https://api.x.ai/v1',
            });

            return openai.images
                .generate({
                    model: 'grok-2-image-latest',
                    prompt: question,
                })
                .then((response) => {
                    if (
                        !response ||
                        !response.data ||
                        !response.data[0] ||
                        !response.data[0].url
                    ) {
                        throw new Error(
                            'A API não retornou uma URL válida para a imagem.'
                        );
                    }

                    return response.data[0].url;
                })
                .catch((error) => {
                    throw new Error(`Erro ao gerar a imagem: ${error.message}`);
                });
        }

        return Promise.reject(
            new Error(
                'Falha ao gerar a imagem. Verifique os logs para mais detalhes.'
            )
        );
    }
}
