# AulaViva

Plataforma que ajuda estudantes a recuperar o conteúdo de aulas perdidas. O áudio da aula é enviado
ao servidor, analisado por inteligência artificial e transformado em um resumo didático. Fotos do
quadro ou dos slides complementam o áudio na geração do resumo.

## Como funciona

1. O professor (ou a placa ESP32) envia o áudio da aula.
2. O servidor grava o arquivo e responde na hora (`202 Accepted`).
   Antes de enviar o áudio pela interface, envie as fotos do quadro/slides (até 3 entram no resumo).
3. Em segundo plano, o Whisper faz uma transcrição interna do áudio (não é o resultado entregue ao aluno).
4. O Qwen recebe essa transcrição junto com até 3 fotos do quadro/slides e gera um resumo didático.
5. O aluno abre a aula na tela e vê o resumo e os pontos de revisão.

Estados de uma aula: `CREATED` (sem áudio) → `PROCESSING` → `DONE` ou `FAILED`.

## Tecnologias

Java 21 · Spring Boot (Web, Validation, Data JPA) · PostgreSQL (H2 no perfil `dev`) · Maven ·
API da Groq (Whisper para transcrição interna e Qwen multimodal para resumo) · ESP32 + INMP441 para captura de áudio (etapa de hardware).

## Como rodar

### 1. Chave da Groq
Defina a variável de ambiente `AI_API_KEY` (chave da Groq). No IntelliJ: Run > Edit Configurations >
Environment variables. **Nunca coloque a chave no código nem no GitHub.**

### 2. Banco de dados
- **Rápido (sem instalar nada):** use o perfil `dev` (campo *Active profiles* = `dev` na configuração
  de execução). Usa um H2 em arquivo na pasta `data/`.
- **PostgreSQL:** `docker compose up -d` sobe um banco com as credenciais padrão, ou configure
  `DB_URL`, `DB_USER` e `DB_PASSWORD`.

### 3. Executar
Rode `AulavivaApiApplication` e abra http://localhost:8080 (tela do aluno).
Testes: `mvn test`.

## API

| Método | Endereço | O que faz |
|---|---|---|
| GET | `/status` | Verifica se o servidor está no ar |
| POST | `/api/lessons` | Cria aula (`{"title": "...", "subject": "..."}`) |
| GET | `/api/lessons` | Lista as aulas |
| GET | `/api/lessons/{id}` | Detalhe e resumo |
| POST | `/api/lessons/{id}/audio` | Envia o áudio (`multipart`, campo `file`) e inicia o processamento |
| POST | `/api/lessons/{id}/images` | Envia foto do quadro (`multipart`, campo `file`) |
| GET | `/api/lessons/{id}/images/{imageId}` | Baixa a foto |
| POST | `/api/lessons/{id}/reprocess` | Processa de novo uma aula que falhou |

Exemplo:

```
curl -X POST -H "Content-Type: application/json" -d '{"title":"Funções","subject":"Matemática"}' http://localhost:8080/api/lessons
curl -F "file=@aula.mp3" http://localhost:8080/api/lessons/1/audio
```

Erros seguem sempre o formato `{status, error, message, timestamp}`.

## Estrutura

```
controller   recebe as requisições HTTP
service      regras de negócio e processamento em segundo plano
ai           integração com a IA (interfaces + implementação da API da Groq)
repository   acesso ao banco
model        entidades JPA
dto          formato das requisições e respostas
mapper       entidade -> DTO
exception    exceções do domínio e tratamento global de erros
config       configurações tipadas, executor assíncrono, cliente HTTP
```

## Limitações conhecidas

- A API de transcrição aceita arquivos de até **25 MB**. Uma aula inteira em WAV passa disso;
  use MP3/M4A comprimido ou divida o áudio (melhoria planejada).
- Só a extensão do arquivo é validada, não o conteúdo.
- Sem autenticação: não exponha o servidor na internet.
- O esquema do banco é gerado pelo Hibernate (`ddl-auto=update`). Para produção, trocar por migrações (Flyway).
- Aulas gravam menores de idade: é necessária autorização da escola e aviso de gravação.

## Próximas etapas

- Envio de áudio pela placa ESP32 + INMP441.
- Compressão/divisão automática de áudios longos.
- Login de professores e alunos.
