# Instalação e Execução com Docker

Este guia descreve como configurar, construir e executar a aplicação usando Docker (ou Podman).

## Pré-requisitos

-   Docker ou Podman instalado em sua máquina.

## Configuração

Antes de construir a imagem Docker, você precisa configurar as variáveis de ambiente necessárias para a aplicação.

1.  **Crie um arquivo `.env`:** Na raiz do projeto, crie um arquivo chamado `.env`.
2.  **Adicione as Variáveis:** Preencha o arquivo `.env` com as variáveis necessárias. É uma boa prática ter um arquivo `.env.example` no repositório para listar as variáveis esperadas.

    ```dotenv
    # Exemplo de conteúdo para .env (substitua pelos valores reais)
    DATABASE_URL="sua_url_de_conexao"
    API_KEY="sua_chave_secreta"
    # Adicione outras variáveis necessárias aqui...
    ```

    *   **Importante:** Certifique-se de incluir todas as variáveis que a aplicação (`src/main.js` e outros módulos) espera encontrar. Consulte o código-fonte ou um arquivo `.env.example` (se existir) para a lista completa.

## Construindo a Imagem Docker

Navegue até o diretório raiz do projeto (onde o `Dockerfile` está localizado) e execute o seguinte comando para construir a imagem:

```shell
docker build -t bot-kingdom-rank .
```


## Executando o Contêiner

Após construir a imagem, você pode executar a aplicação em um contêiner Docker.

**Opção 1: Execução Simples (Interativa)**

Este comando executa o contêiner, mapeia a porta 3000 do seu host para a porta 3000 do contêiner e remove o contêiner quando ele é parado (`--rm`). Você verá os logs da aplicação diretamente no seu terminal.

```shell
docker run --rm -it -p 3000:3000 bot-kingdom-rank
```

Bibbidi-bobbidi-boo 🪄