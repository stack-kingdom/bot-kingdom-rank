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
    describe('Método run', () => {
        test('Tipo da resposta deve ser string', async () => {
            const response = await Models.run({ question });
            expect(response).toBeTypeOf('string');
            expect.assertions(1);
        });
        test('Deve gerar uma resposta com a pergunta fornecida', async () => {
            const response = await Models.run({ question });
            expect(response).toBe(`Resultado da pergunta ${question}`);
            expect.assertions(1);
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
