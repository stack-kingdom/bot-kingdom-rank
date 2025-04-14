# Estágio 1: Instalação de dependências
FROM docker.io/oven/bun:1 as install
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Estágio 2: Build final
FROM docker.io/oven/bun:1 as release
WORKDIR /app

# Copia as dependências instaladas do estágio anterior
COPY --from=install /app/node_modules ./node_modules

# Copia o código da aplicação
COPY src ./src
COPY data ./data
COPY package.json ./package.json

USER bun
CMD ["bun", "run", "src/main.js"]
