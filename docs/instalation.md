# Instalação e Execução

## Pré-requisitos

-   Docker ou Podman instalado em sua máquina.

## Configuração

Antes de construir a imagem Docker, você precisa configurar as variáveis de ambiente necessárias para a aplicação.

1. Na raiz do projeto, crie um arquivo chamado `.env` com base no arquivo `env.example`.
2. **Adicione as Variáveis:** Preencha o arquivo `.env` com as variáveis necessárias.

    - **Importante:** Certifique-se de incluir todas as variáveis que a aplicação (`src/main.js` e outros módulos) espera encontrar. Consulte o código-fonte ou o arquivo `.env.example` para a lista completa.

## Construindo a Imagem

Navegue até o diretório raiz do projeto (onde o `Dockerfile` está localizado) e execute o seguinte comando para construir a imagem:

```shell
podman build -t bot-kingdom-rank .
```

Ou se estiver usando Docker:

```shell
docker build -t bot-kingdom-rank .
```

## Executando a Imagem

Após construir a imagem, execute-a com:

```shell
podman run -it --env-file .env bot-kingdom-rank
```

Ou com Docker:

```shell
docker run -it --env-file .env bot-kingdom-rank
```

Bibbidi-bobbidi-boo 🪄
