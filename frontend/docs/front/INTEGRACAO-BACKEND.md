# Integração frontend ↔ backend (branch `feature/auth`)

Fonte de verdade: o código do backend (controllers, DTOs, `SecurityConfig`, serviços). Esta página substitui
descrições antigas do `PLANO.md` quando houver divergência.

## Contrato real

| Método | URL | Acesso | Corpo / resposta |
|---|---|---|---|
| POST | `/api/auth/register` | público | `{name ≤100, email ≤150, password 8–72}` → 201 `{message}`. Sempre cria `PROFESSOR` com status `PENDING` |
| POST | `/api/auth/login` | público | `{email, password}` → `{token, expiresAt, name, role}`. 401 credenciais; 403 conta `PENDING` ou `REJECTED` |
| GET | `/api/admin/users?status=PENDING\|APPROVED\|REJECTED` | ADMIN | lista de `{id, name, email, role, status, createdAt}` (só professores) |
| POST | `/api/admin/users/{id}/approve` · `/reject` | ADMIN | usuário atualizado |
| GET | `/api/lessons` | público | `[{id, title, subject, status, hasSlides, hasImages, createdAt}]`; visitante vê só `DONE` |
| GET | `/api/lessons/{id}` | público | detalhe com `summary`, `presentation`, `images[]`, `failureReason`; visitante só vê `DONE` |
| GET | `/api/lessons/{id}/images/{imageId}` | público | binário |
| POST | `/api/lessons` | PROFESSOR/ADMIN | `{title ≤150, subject ≤80}` → 201 |
| POST | `/api/lessons/{id}/audio` | PROFESSOR/ADMIN | multipart `file` → 202. 409 em `PROCESSING` |
| POST | `/api/lessons/{id}/reprocess` | PROFESSOR/ADMIN | 202. 409 em `PROCESSING` ou sem áudio |
| POST | `/api/lessons/{id}/images` | PROFESSOR/ADMIN | multipart `file` → 201. 409 acima de 3 fotos ou em `PROCESSING` |
| DELETE | `/api/lessons/{id}` · `/images/{imageId}` | PROFESSOR/ADMIN | 204. 409 em `PROCESSING` |

Arquivos: áudio `.mp3 .wav .m4a .ogg .webm`; imagem `.jpg .jpeg .png .webp`; até 25 MB; assinatura do arquivo conferida (400) e formato (415).

**JWT:** `Authorization: Bearer <token>`, HS256, `sub` = e-mail, claim `role`, validade de 8 h (configurável). Não há refresh
nem endpoint "quem sou eu". Erros: `{status, error, message, timestamp}`.

## Matriz de integração (estado desta entrega)

| Recurso | Interface | Integração com a API | Observação |
|---|---|---|---|
| Cadastro de professor | `pages/autenticacao/PaginaCadastro` | `api.cadastrar` | Validação com os mesmos limites do DTO; tela de "aguardando aprovação" |
| Login / JWT | `PaginaEntrar`, `auth/AuthContext` | `api.entrar` | 401 e 403 tratados com a mensagem do servidor |
| Sessão e expiração | `auth/sessao.ts` | — | `sessionStorage`; encerra por expiração, 401 em chamada autenticada e logout |
| Papéis e rotas | `auth/GuardaRota`, `auth/rotas.ts` | — | `/professor`: PROFESSOR/ADMIN; `/admin`: ADMIN; demais públicas |
| Aprovação de professores | `features/admin/PainelAdmin` | `listarProfessores`, `aprovarProfessor`, `rejeitarProfessor` | Revogar um aprovado pede confirmação |
| Biblioteca | `features/aulas/BibliotecaAulas` | `listarAulas` | Só exibe `DONE`; selos usam `hasSlides`/`hasImages` do servidor |
| Detalhe e slides | `DetalheAula`, `features/slides/*` | `obterAula` | Preservados |
| Criar aula | `FormNovaAula` | `criarAula` | Com token |
| Enviar áudio | `UploadAudioProgresso` | `enviarAudio` (XHR, progresso real) | Extensões alinhadas ao backend |
| Enviar fotos | `UploadFotosCanvas` | `enviarImagem` | Limite de 3, bloqueio em `PROCESSING` |
| Excluir foto | `UploadFotosCanvas` | `excluirImagem` | Confirmação |
| Excluir aula | `AcompanhamentoProcessamento` | `excluirAula` | Confirmação; desabilitado em `PROCESSING` |
| Processamento | `AcompanhamentoProcessamento` | `obterAula` (a cada 3 s) | Mostra o estado do servidor |

## Sem suporte no backend (não implementado de propósito)

- `GET /api/lessons/{id}/prompts`: o botão "Como foi gerado" (que só abria um `alert`) foi removido.
- `hidden` / ocultar aula para alunos: não existe no backend.
- "Minhas aulas": a aula não guarda o professor dono; todo professor/admin vê e exclui todas.
- Login ou cadastro de ALUNO: não existe; aluno = visitante anônimo.
- Renovação de token e consulta de perfil: não existem.
- CORS: não há configuração; em desenvolvimento o proxy do Vite cobre `/api`, em produção sirva front e API na mesma origem.
