# PROGRESSO DO PROJETO — FRONT-END AULAVIVA

---

## 1. Estado Geral das Fases

| Fase | Descrição | Status | Data de Conclusão |
|---|---|---|---|
| **F0** | Planejamento, Análise e Protocolo | ✅ Concluída | 12/11/2026 |
| **F1** | Fundação (fontes locais, index.html, roteador hash, cliente API/mock, proxy) | ✅ Concluída | 12/11/2026 |
| **F2** | Entrada e Apresentação (#/entrar, rolagem suave, correção de textos) | ✅ Concluída | 12/11/2026 |
| **F3** | Biblioteca do Aluno (#/aulas, busca, agrupamento, filtros, estados) | ✅ Concluída | 12/11/2026 |
| **F4** | Aula: Resumo e Fotos (parser tolerante, sem dangerouslySetInnerHTML, modal de fotos) | 🟨 Em andamento | — |
| **F5** | Sistema de Slides (layouts CSS, teclado, toque, tela cheia, impressão) | ⬜ Pendente | — |
| **F6** | Guia do NotebookLM (passos.json, marcações SVG, fallback de cópia) | ⬜ Pendente | — |
| **F7** | Como foi Gerado (diálogo de transparência, abas, mock de prompts) | ⬜ Pendente | — |
| **F8** | Painel do Professor (criar aula, upload de áudio com XHR, fotos com canvas) | ⬜ Pendente | — |
| **F9** | Mascote e Animações (ArtFigure desacoplado, estados, modo leve) | ⬜ Pendente | — |
| **F10**| Acabamento e Entrega (WCAG AA, 360px, offline, roteiro para static do Spring) | ⬜ Pendente | — |

---

## 2. Fase Atual e Próximo Passo

* **Fase Atual:** F4 — Aula: Resumo e Fotos (`#/aulas/:id`).
* **Próximo Passo Exato:**
  1. Criar o analisador tolerante de resumo didático em `src/lib/resumo.ts` (sem dangerouslySetInnerHTML, remoção de tags `<think>`, detecção tolerante de cabeçalhos, listas, fórmulas e índice dinâmico).
  2. Implementar a aba "Resumo Didático" com índice interativo, botão de cópia com feedback visual e folha de estilo para impressão.
  3. Implementar a aba "Fotos do Quadro" com galeria em grade responsiva, `loading="lazy"`, tratamento para imagens indisponíveis e visualizador modal nativo `<dialog>` com controle por teclado (setas e Esc) e foco preso.
  4. Estruturar a navegação por abas em `#/aulas/:id` com persistência na URL (`?aba=`) e cabeçalho com aviso fixo de IA.

---

## 3. Decisões Tomadas e Divergências Identificadas

1. **Ordenação e Agrupamento da Biblioteca:**
   - A biblioteca agrupa as matérias em ordem alfabética estrita sem diferenciar maiúsculas ou acentos (`localeCompare('pt-BR', { sensitivity: 'base' })`).
   - Dentro de cada disciplina, as aulas são ordenadas estritamente pela data decrescente de criação (`createdAt`).
2. **Debounce e Normalização de Busca:**
   - Implementado atraso de 200ms na digitação para evitar re-renderizações desnecessárias em dispositivos modestos.
   - Normalização NFD para ignorar diacríticos (ex: "funcao" encontra "Função").
3. **Resiliência e Polling Discreto:**
   - A listagem atualiza automaticamente em segundo plano a cada 30 segundos apenas se a aba estiver visível (`document.visibilityState === 'visible'`) e recarrega imediatamente ao recuperar o foco do navegador.

---

## 4. Como Rodar e Verificar

Navegue até a pasta do projeto:
```powershell
cd src/main/frondend/project
```

### Comandos de Verificação
* **Verificação de Tipos:**
  ```powershell
  npm.cmd run typecheck
  ```
  *(Resultado na F3: 0 erros)*
* **Linting:**
  ```powershell
  npm.cmd run lint
  ```
  *(Resultado na F3: 0 erros, 0 avisos)*
* **Build de Produção:**
  ```powershell
  npm.cmd run build
  ```
  *(Resultado na F3: 0 erros, bundle compilado em 6.49s)*

---

## 5. Log por Fase

### Fase 1: Fundação Técnica e Infraestrutura (12/11/2026)
* Fontes locais `@fontsource`, `index.html` corrigido com favicon SVG próprio, proxy no Vite, cliente de API com XHR progress e mock integrado, roteador hash com acessibilidade de foco e layout base da aplicação. Commit: `be5ae67`.

### Fase 2: Entrada e Alinhamento da Apresentação (12/11/2026)
* `PaginaEntrar.tsx` integrada com seleção de perfil Aluno/Professor e aviso de segurança. Botão "Entrar" funcional em todos os cabeçalhos e chamadas. Textos institucionais corrigidos para Resumo, Slides e Vídeo no NotebookLM. Commit: `72dcba3`.

### Fase 3: Biblioteca do Aluno (12/11/2026)
* **Atividades Realizadas:**
  - Implementado `src/features/aulas/CartaoAula.tsx` com formatação de data brasileira (América/Fortaleza), badges de mídias e link acessível.
  - Implementado `src/features/aulas/FiltroDisciplinas.tsx` com chips de contagem e botão "Todas".
  - Implementado `src/features/aulas/EsqueletoAulas.tsx` com animação de shimmer suave para carregamento.
  - Implementado `src/features/aulas/BibliotecaAulas.tsx` com consumo de `api.listarAulas()`, agrupamento por matéria, ordenação temporal, busca com debounce de 200ms, estados de erro/vazio e atualização automática a cada 30s.
  - Integração no `src/App.tsx`.
* **Resultado dos Comandos:**
  - `typecheck`: Sucesso (0 erros).
  - `lint`: Sucesso (0 erros, 0 avisos).
  - `build`: Sucesso (6.49s).
* **Commit:** `feat(biblioteca): implementa biblioteca do aluno com busca, filtros e agrupamento`

---

## 6. Prompt de Continuação

```markdown
Você está trabalhando no front-end da aplicação AulaViva.
Antes de fazer qualquer alteração, leia obrigatoriamente os arquivos:
1. src/main/frondend/project/docs/front/PLANO.md
2. src/main/frondend/project/docs/front/PROGRESSO.md

Regras de ouro:
- Trabalhe SOMENTE dentro da pasta do front-end (`src/main/frondend/project/`). Nunca altere o backend Java, pom.xml ou arquivos na raiz.
- Execute os comandos utilizando `npm.cmd` no Windows (ex: `npm.cmd run typecheck`, `npm.cmd run build`).
- Proibido usar dangerouslySetInnerHTML ou inserir HTML vindo da API.
- Sem serviços externos, sem CDN e sem fontes externas em tempo de execução.
- Mantenha sempre atualizado o arquivo docs/front/PROGRESSO.md ao fim de cada fase.

Fase atual: Fase 4 (Aula: Resumo e Fotos).
Próximo passo: Implementar o parser tolerante de resumo (lib/resumo.ts), a página da aula #/aulas/:id com abas e o visualizador modal de fotos do quadro.
```
