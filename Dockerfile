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
COPY .env ./
COPY package.json ./package.json
# Copia outros arquivos necessários, como public, assets, etc.
# COPY public ./public

USER bun
EXPOSE 3000/tcp
CMD ["bun", "run", "src/main.js"]
