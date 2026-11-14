# Arquitetura do AulaViva

Este documento descreve a organização do monorepositório e o funcionamento do backend **como ele existe hoje**.
Funcionalidades planejadas (frontend, autenticação, etc.) estão apenas indicadas como próximas etapas no README.

## 1. Organização do monorepositório

```text
aulaviva/
├── backend/          API REST em Spring Boot (Java 21, Maven)
├── front-end/        reservada para a futura aplicação web (contém apenas .gitkeep)
├── docs/             documentação
├── docker-compose.yml  PostgreSQL local
├── .env.example      modelo das variáveis de ambiente
└── README.md
```

- **`backend/`** é um projeto Maven autocontido (`pom.xml`, Maven Wrapper em `mvnw`, `mvnw.cmd` e `.mvn/wrapper/`).
  Todos os comandos Maven devem ser executados dentro dessa pasta.
- **`front-end/`** está vazia de propósito. O frontend anterior foi removido e uma nova aplicação será criada ali.
- **Raiz** concentra o que é comum ao projeto todo: Docker Compose, exemplo de variáveis de ambiente,
  `.gitignore` e documentação.
- Caminhos relativos do backend (`uploads/`, `data/`, `config/`) são resolvidos a partir do diretório em que a
  aplicação é executada, ou seja, `backend/`.

## 2. Camadas do backend

O código está em `backend/src/main/java/com/aulaviva/api/`.

| Pacote | Responsabilidade |
|---|---|
| `controller` | Recebe as requisições HTTP, valida o corpo (`@Valid`) e delega ao serviço. `LessonController` expõe `/api/lessons/**`; `StatusController` expõe `/status`. Não contém regra de negócio. |
| `service` | Regras de negócio. `LessonService` orquestra criação, consulta, envio de arquivos e reprocessamento. `LessonProcessingService` executa o processamento em segundo plano. `FileStorageService` grava e localiza arquivos no disco. `ProcessingRecovery` trata processamentos interrompidos na inicialização. |
| `ai` | Integração com a IA. As interfaces `TranscriptionClient` e `SummaryClient` isolam o restante do sistema do provedor; `GroqTranscriptionClient` e `GroqSummaryClient` são as implementações para a API da Groq. |
| `repository` | Acesso ao banco com Spring Data JPA (`LessonRepository`, `LessonImageRepository`). |
| `model` | Entidades JPA (`Lesson`, `LessonImage`) e enums (`LessonStatus`, `MediaKind`). `Lesson` concentra as transições de estado (`attachAudio`, `restartProcessing`, `markDone`, `markFailed`). |
| `dto` | Contratos de entrada e saída da API (`CreateLessonRequest`, `LessonResponse`, `LessonListItem`, `ImageResponse`, `ErrorResponse`) e, em `dto/slide`, a estrutura do material gerado (`LessonStudyMaterial`, `SlidePresentation`, `SlideContent`). |
| `mapper` | Converte entidades em DTOs (`LessonMapper`). |
| `exception` | Exceções de domínio e o `GlobalExceptionHandler`, que converte cada exceção em uma resposta `ErrorResponse` com o código HTTP adequado. |
| `config` | Propriedades tipadas (`AiProperties`, `StorageProperties`), o executor assíncrono (`AsyncConfig`) e o cliente HTTP usado para a IA (`AiClientConfig`). |

Fluxo geral de dependências: `controller` → `service` → (`repository`, `ai`, armazenamento em disco).

## 3. Fluxo de criação de uma aula

1. O cliente envia `POST /api/lessons` com `title` (obrigatório, até 150 caracteres) e `subject` (obrigatório, até 80).
2. O `LessonController` valida o corpo. Se for inválido, o `GlobalExceptionHandler` responde `400`.
3. O `LessonService` remove espaços extras, cria uma `Lesson` com estado `CREATED` e a grava no banco.
4. A resposta é `201 Created`, com o cabeçalho `Location: /api/lessons/{id}` e a aula no corpo.

A consulta (`GET /api/lessons/{id}`) devolve a aula com estado, resumo, apresentação em slides, motivo de falha
(se houver) e lista de imagens. A listagem (`GET /api/lessons`) devolve uma versão resumida, das mais recentes
para as mais antigas.

## 4. Fluxo de envio de áudio e imagens

### Áudio (`POST /api/lessons/{id}/audio`)

1. O serviço localiza a aula (`404` se não existir) e recusa a operação se ela já estiver em `PROCESSING` (`409`).
2. O `FileStorageService` valida o arquivo: não pode ser vazio (`400`) e a extensão deve ser `.mp3`, `.wav`, `.m4a`,
   `.ogg` ou `.webm` (`415`). O arquivo é gravado em `uploads/audio/` com nome aleatório (UUID + extensão).
3. A aula guarda o nome do arquivo, zera transcrição, resumo e apresentação anteriores e passa para `PROCESSING`.
4. Se a aula já tinha um áudio, o arquivo antigo é apagado.
5. O processamento é disparado em segundo plano e a API responde `202 Accepted` imediatamente.

### Imagens (`POST /api/lessons/{id}/images`)

1. O serviço localiza a aula e valida o arquivo da mesma forma (extensões `.jpg`, `.jpeg`, `.png`, `.webp`).
2. O arquivo é gravado em `uploads/images/` com nome aleatório e um registro `LessonImage` é criado no banco,
   ligado à aula. A resposta é `201 Created`.
3. As imagens são lidas apenas no momento do processamento. Portanto, para entrarem no resumo, devem ser enviadas
   **antes** do áudio (ou antes de um reprocessamento).
4. `GET /api/lessons/{id}/images/{imageId}` devolve o arquivo (`404` se a imagem não pertencer à aula ou
   o arquivo não existir).

Proteções do armazenamento: os nomes originais não são usados no disco, e `FileStorageService.resolve` rejeita
caminhos que saiam da pasta configurada. O limite de tamanho é 25 MB por arquivo (`413` quando excedido).

## 5. Comunicação com a Groq

A comunicação usa um `RestClient` (`AiClientConfig`) apontado para `aulaviva.ai.base-url`
(`https://api.groq.com/openai/v1`), com a chave enviada no cabeçalho `Authorization: Bearer`.
A chave vem **sempre** da variável de ambiente `AI_API_KEY`; sem ela, o processamento falha com uma mensagem clara.

- **Transcrição** (`GroqTranscriptionClient`): envia o áudio para `/audio/transcriptions`
  (modelo `whisper-large-v3`, idioma `pt`, resposta em texto). Uma resposta vazia é tratada como erro.
- **Resumo** (`GroqSummaryClient`): envia para `/chat/completions` (modelo configurado em
  `aulaviva.ai.summary-model`, `temperature` 0,3, resposta em JSON) um *prompt* de sistema, a disciplina, o título
  e a transcrição. Se houver imagens, até `aulaviva.ai.max-images` (3) são enviadas junto, codificadas em Base64.
- A resposta é convertida em `LessonStudyMaterial` (resumo + apresentação) e validada: resumo e pelo menos um slide
  são obrigatórios.
- Qualquer recusa ou falha de conexão vira uma `AiIntegrationException` com mensagem amigável; o detalhe técnico
  vai apenas para o log do servidor.
- O tempo máximo de leitura das chamadas é de 5 minutos e o de conexão, 10 segundos.

## 6. Processamento assíncrono

- `LessonProcessingService.process` é anotado com `@Async` e executa no executor `processingExecutor`
  (`AsyncConfig`): 2 *threads*, fila de 20 tarefas, e aguarda até 30 s por tarefas em andamento ao desligar.
- Etapas: carregar a aula → transcrever o áudio → carregar as imagens da aula → gerar o material de estudo →
  gravar transcrição, resumo e apresentação (em JSON) → estado `DONE`.
- Qualquer exceção coloca a aula em `FAILED`, com um motivo curto em `failureReason` (limitado a 500 caracteres).
  Erros de IA mostram a mensagem da integração; erros inesperados mostram uma mensagem genérica.
- Se a fila estiver cheia, a aula é marcada como `FAILED` com a orientação de tentar novamente.
- **Reprocessamento:** `POST /api/lessons/{id}/reprocess` exige que a aula tenha áudio e não esteja em
  `PROCESSING`; limpa o resultado anterior e repete o processamento.
- **Recuperação:** ao iniciar a aplicação (`ApplicationReadyEvent`), `ProcessingRecovery` marca como `FAILED` todas
  as aulas que ficaram em `PROCESSING` (porque o servidor foi interrompido), orientando o uso de reprocessar.

Estados da aula:

```text
CREATED --(áudio enviado)--> PROCESSING --(sucesso)--> DONE
                                 |
                                 +--(erro / fila cheia / reinício do servidor)--> FAILED
FAILED ou DONE --(novo áudio ou reprocessar)--> PROCESSING
```

## 7. Comunicação com o banco de dados

- **Acesso:** Spring Data JPA/Hibernate. Tabelas `lessons` e `lesson_images` (relação N:1 com a aula).
- **PostgreSQL** é o banco padrão. A conexão é configurada por `DB_URL`, `DB_USER` e `DB_PASSWORD`, com padrões
  que coincidem com o `docker-compose.yml` (`jdbc:postgresql://localhost:5432/aulaviva`, `postgres`/`postgres`).
- **H2** é usado em dois casos: no perfil `dev` (arquivo em `backend/data/`, para rodar sem PostgreSQL) e nos
  testes (perfil `test`, em memória).
- O esquema é criado e atualizado pelo Hibernate (`spring.jpa.hibernate.ddl-auto=update`); não há migrações.
- `spring.jpa.open-in-view=false`: o acesso ao banco acontece nas camadas de serviço, não durante a serialização
  da resposta.
- Os arquivos de áudio e imagem **não ficam no banco**: ficam em disco (`uploads/`) e o banco guarda apenas o nome
  do arquivo e o nome original. A apresentação em slides é guardada como texto JSON na coluna `presentation`.

## 8. Configuração e segredos

- As configurações padrão ficam em `backend/src/main/resources/` (`application.properties`,
  `application-dev.properties`) e em `backend/src/test/resources/` (`application-test.properties`).
- Informações sensíveis nunca ficam no código: o banco e a chave de IA vêm de variáveis de ambiente
  (veja `.env.example`). O arquivo opcional `backend/config/application.properties` e o `.env` são ignorados pelo Git.
