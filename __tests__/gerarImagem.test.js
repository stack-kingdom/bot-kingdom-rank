import { test, expect, mock } from 'bun:test';
import { Models } from '../src/utils/Models.js';

mock.module('../src/utils/Models.js', () => ({
    Models: {
        runImage: (prompt) =>
            Promise.resolve(`Resultado da imagem com ${prompt}`),
    },
}));

test('Deve gerar uma imagem com o prompt fornecido', async () => {
    const prompt = 'Um gato astronauta em Marte';
    const imagePrompt = await Models.runImage(prompt);

    expect(imagePrompt).toBeTypeOf('string');
    expect(imagePrompt).toBe(`Resultado da imagem com ${prompt}`);
});
