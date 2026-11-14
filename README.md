# AulaViva

O AulaViva ajuda estudantes a recuperar o conteúdo de aulas perdidas. O áudio da aula é enviado ao
servidor, processado por inteligência artificial e transformado em um **resumo didático** e em uma
**apresentação em slides**. Fotos do quadro ou dos slides complementam o áudio na geração do material.

## Objetivo do sistema

Permitir que alguém que faltou a uma aula consulte, depois, um material de estudo organizado
(resumo e slides) gerado automaticamente a partir da gravação da aula e de fotos do quadro.

Este repositório é um **monorepositório**. No momento, apenas o backend (API REST) está implementado;
a pasta `front-end/` está reservada para a futura aplicação web.

## Tecnologias utilizadas

- Java 21
- Spring Boot 3.5 (Web, Validation, Data JPA)
- PostgreSQL (banco padrão) e H2 (perfil `dev` e testes)
- Maven (com Maven Wrapper)
- Docker Compose (PostgreSQL local)
- API da Groq: Whisper (`whisper-large-v3`) para transcrição e Qwen para a geração do resumo

## Estrutura do projeto

```text
aulaviva/
├── backend/                 API Spring Boot (Maven)
│   ├── .mvn/wrapper/        configuração do Maven Wrapper
│   ├── src/main/java/com/aulaviva/api/
│   │   ├── ai/              integração com a IA (interfaces + clientes da Groq)
│   │   ├── config/          propriedades tipadas, executor assíncrono, cliente HTTP
│   │   ├── controller/      endpoints REST
│   │   ├── dto/             contratos de entrada e saída
│   │   ├── exception/       exceções de domínio e tratamento global de erros
│   │   ├── mapper/          conversão entidade -> DTO
│   │   ├── model/           entidades JPA e enums
│   │   ├── repository/      acesso ao banco (Spring Data JPA)
│   │   └── service/         regras de negócio e processamento em segundo plano
│   ├── src/main/resources/  application.properties e application-dev.properties
│   ├── src/test/            testes e application-test.properties
│   ├── pom.xml
│   ├── mvnw
│   └── mvnw.cmd
├── front-end/               reservada para o futuro frontend (vazia)
├── docs/
│   └── architecture.md      documentação de arquitetura
├── .env.example             exemplo de variáveis de ambiente
├── .gitignore
├── docker-compose.yml       PostgreSQL local
└── README.md
```

## Requisitos para execução

- **JDK 21** instalado (`java -version` deve indicar a versão 21).
- **Docker** com Docker Compose, caso queira usar o PostgreSQL local. É opcional: o perfil `dev` usa H2.
- **Chave de API da Groq**, necessária para o processamento das aulas (criar e listar aulas funciona sem ela).
- Acesso à internet na primeira execução, para o Maven Wrapper baixar o Maven e as dependências.

Não é necessário instalar o Maven: o projeto usa o Maven Wrapper (`mvnw`).

## Configuração das variáveis de ambiente

O backend lê estas variáveis (os valores padrão estão em `backend/src/main/resources/application.properties`):

| Variável | Para que serve | Padrão |
|---|---|---|
| `DB_URL` | URL JDBC do banco | `jdbc:postgresql://localhost:5432/aulaviva` |
| `DB_USER` | Usuário do banco | `postgres` |
| `DB_PASSWORD` | Senha do banco | `postgres` |
| `AI_API_KEY` | Chave da API da Groq | vazio (o processamento falha sem ela) |

1. Crie seu arquivo local a partir do exemplo (ele é ignorado pelo Git):

   ```bash
   cp .env.example .env
   ```

2. Edite o `.env` e preencha `DB_PASSWORD` e `AI_API_KEY` com valores seus.

> **Atenção:** o Spring Boot não lê o arquivo `.env` sozinho. O Docker Compose lê o `.env` da raiz
> automaticamente, mas, para o backend, as variáveis precisam estar no ambiente do processo.
> Nunca versione o `.env` nem coloque chaves reais no código ou em arquivos de exemplo.

**Linux / macOS** (carrega o `.env` na sessão atual do terminal):

```bash
set -a
source .env
set +a
```

**Windows (PowerShell)**:

```powershell
$env:DB_PASSWORD = "sua_senha"
$env:AI_API_KEY  = "sua_chave"
```

Em IDEs (IntelliJ, VS Code), você também pode definir essas variáveis na configuração de execução.

Alternativa: criar o arquivo `backend/config/application.properties` (ignorado pelo Git), que o
Spring Boot carrega automaticamente quando a aplicação é executada a partir de `backend/`:

```properties
spring.datasource.password=sua_senha
aulaviva.ai.api-key=sua_chave
```

## Iniciando o PostgreSQL com Docker

Na raiz do projeto:

```bash
docker compose up -d
```

Isso sobe o PostgreSQL 16 na porta `5432`, com o banco `aulaviva`. O usuário e a senha vêm de `DB_USER`
e `DB_PASSWORD` do `.env` (se não existir, usa `postgres`/`postgres`, os mesmos padrões do backend).

Para parar: `docker compose down`. Para apagar também os dados: `docker compose down -v`.

> Se você alterar `DB_PASSWORD` depois que o volume já foi criado, o PostgreSQL continuará com a senha
> antiga. Use `docker compose down -v` para recriar o banco (isso apaga os dados locais).

## Executando o backend

Com as variáveis configuradas (e o PostgreSQL no ar):

```bash
cd backend
./mvnw spring-boot:run
```

No Windows:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

A API sobe em `http://localhost:8080`. Para conferir: `curl http://localhost:8080/status`.

**Sem instalar o PostgreSQL**, use o perfil `dev`, que usa um H2 em arquivo (`backend/data/`):

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Os áudios e as imagens enviados ficam em `backend/uploads/` (ignorado pelo Git).

## Executando os testes

```bash
cd backend
./mvnw test
```

No Windows:

```powershell
cd backend
.\mvnw.cmd test
```

Os testes usam o perfil `test` (H2 em memória, pasta de upload em `target/` e sem chave de IA), portanto
não exigem PostgreSQL, Docker nem chave da Groq.

## Principais endpoints da API

| Método | Endereço | O que faz | Resposta |
|---|---|---|---|
| GET | `/status` | Verifica se o servidor está no ar | `200` |
| POST | `/api/lessons` | Cria uma aula (`{"title": "...", "subject": "..."}`) | `201` |
| GET | `/api/lessons` | Lista as aulas (mais recentes primeiro) | `200` |
| GET | `/api/lessons/{id}` | Detalha a aula, com resumo e slides | `200` |
| POST | `/api/lessons/{id}/audio` | Envia o áudio (`multipart`, campo `file`) e inicia o processamento | `202` |
| POST | `/api/lessons/{id}/images` | Envia uma foto do quadro/slides (`multipart`, campo `file`) | `201` |
| GET | `/api/lessons/{id}/images/{imageId}` | Baixa a foto | `200` |
| POST | `/api/lessons/{id}/reprocess` | Processa de novo uma aula que já tem áudio | `202` |

Formatos aceitos: áudio `.mp3`, `.wav`, `.m4a`, `.ogg`, `.webm`; imagem `.jpg`, `.jpeg`, `.png`, `.webp`.
Tamanho máximo de arquivo: 25 MB.

Exemplo de uso:

```bash
# 1. criar a aula
curl -X POST -H "Content-Type: application/json" \
     -d '{"title":"Funções","subject":"Matemática"}' \
     http://localhost:8080/api/lessons

# 2. enviar as fotos do quadro (antes do áudio, pois só entram no resumo as fotos existentes no processamento)
curl -F "file=@quadro.png" http://localhost:8080/api/lessons/1/images

# 3. enviar o áudio (inicia o processamento em segundo plano)
curl -F "file=@aula.mp3" http://localhost:8080/api/lessons/1/audio

# 4. consultar o andamento e o resultado
curl http://localhost:8080/api/lessons/1
```

Os erros seguem sempre o formato `{ "status", "error", "message", "timestamp" }`.

## Como funciona o processamento de aulas

1. A aula é criada com o estado `CREATED`.
2. Ao receber o áudio, o servidor grava o arquivo, muda a aula para `PROCESSING` e responde na hora
   (`202 Accepted`), sem esperar a IA.
3. Em segundo plano, o Whisper transcreve o áudio (a transcrição é usada internamente na geração do resumo).
4. O Qwen recebe a transcrição e até 3 fotos do quadro/slides, e devolve o resumo e a apresentação em slides.
5. A aula passa para `DONE` com o material gerado, ou para `FAILED`, com o motivo em `failureReason`.
   Nesse caso, `POST /api/lessons/{id}/reprocess` tenta de novo.
6. Se o servidor for reiniciado durante um processamento, as aulas que estavam em `PROCESSING` são
   marcadas como `FAILED` na inicialização e podem ser reprocessadas.

Estados: `CREATED` → `PROCESSING` → `DONE` ou `FAILED`.

Mais detalhes em [`docs/architecture.md`](docs/architecture.md).

## Limitações conhecidas

- A API de transcrição aceita arquivos de até **25 MB**. Uma aula inteira em WAV pode passar disso;
  use MP3/M4A comprimido ou divida o áudio.
- Só a extensão do arquivo é validada, não o conteúdo.
- Não há autenticação: não exponha o servidor na internet.
- O esquema do banco é gerado pelo Hibernate (`ddl-auto=update`). Para produção, o recomendado é adotar migrações (por exemplo, Flyway).
- Aulas gravam menores de idade: é necessária autorização da escola e aviso de gravação.

## Próximas etapas

- Nova aplicação frontend na pasta `front-end/`.
- Compressão/divisão automática de áudios longos.
- Login de professores e alunos.
