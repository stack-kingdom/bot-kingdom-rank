import { describe, test, expect, mock } from 'bun:test';
import { Models } from '../src/utils/Models.js';

describe('Métodos da classe Models', () => {
    mock.module('../src/utils/Models.js', () => ({
        Models: {
            run: ({ question }) =>
                Promise.resolve(`Resultado da pergunta ${question}`),
            runImage: (prompt) =>
                Promise.resolve(`Resultado da imagem com ${prompt}`),
        },
    }));

    const question = 'Qual é a capital da França?';
    const systemContent =
        'Você é um assistente virtual que ajuda os usuários a responder perguntas sobre o mundo real.';

    describe('Método run', () => {
        test('Deve retornar uma string', () => {
            expect(Models.run({ question })).resolves.toBeTypeOf('string');
        });
        test('Deve não retornar uma string vazia', () => {
            expect(Models.run({ question })).resolves.not.toBe('');
        });
        test('Deve não retornar uma string', () => {
            expect(Models.run({ question })).not.toBeTypeOf('string');
        });
    });
    describe('Método runImage', () => {
        test('Tipo da resposta deve ser string', async () => {
            const imagePrompt = await Models.runImage(question);
            expect(imagePrompt).toBeTypeOf('string');
            expect.assertions(1);
        });
        test('Deve gerar uma imagem com o prompt fornecido', async () => {
            const imagePrompt = await Models.runImage(question);
            expect(imagePrompt).toBe(`Resultado da imagem com ${question}`);
            expect.assertions(1);
        });
    });
});
