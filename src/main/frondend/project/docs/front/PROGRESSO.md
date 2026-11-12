# PROGRESSO DO PROJETO — FRONT-END AULAVIVA

---

## 1. Estado Geral das Fases

| Fase | Descrição | Status | Data de Conclusão |
|---|---|---|---|
| **F0** | Planejamento, Análise e Protocolo | ✅ Concluída | 12/11/2026 |
| **F1** | Fundação (fontes locais, index.html, roteador hash, cliente API/mock, proxy) | ✅ Concluída | 12/11/2026 |
| **F2** | Entrada e Apresentação (#/entrar, rolagem suave, correção de textos) | ✅ Concluída | 12/11/2026 |
| **F3** | Biblioteca do Aluno (#/aulas, busca, agrupamento, filtros, estados) | ✅ Concluída | 12/11/2026 |
| **F4** | Aula: Resumo e Fotos (parser tolerante, sem dangerouslySetInnerHTML, modal de fotos) | ✅ Concluída | 12/11/2026 |
| **F5** | Sistema de Slides (layouts CSS, teclado, toque, tela cheia, impressão) | 🟨 Em andamento | — |
| **F6** | Guia do NotebookLM (passos.json, marcações SVG, fallback de cópia) | ⬜ Pendente | — |
| **F7** | Como foi Gerado (diálogo de transparência, abas, mock de prompts) | ⬜ Pendente | — |
| **F8** | Painel do Professor (criar aula, upload de áudio com XHR, fotos com canvas) | ⬜ Pendente | — |
| **F9** | Mascote e Animações (ArtFigure desacoplado, estados, modo leve) | ⬜ Pendente | — |
| **F10**| Acabamento e Entrega (WCAG AA, 360px, offline, roteiro para static do Spring) | ⬜ Pendente | — |

---

## 2. Fase Atual e Próximo Passo

* **Fase Atual:** F5 — Sistema Dinâmico de Slides (`#/aulas/:id?aba=slides`).
* **Próximo Passo Exato:**
  1. Implementar o visualizador de slides responsivo em `src/features/slides/VisualizadorSlides.tsx` com container 16:9 (`aspect-ratio: 16/9`), tipografia fluida com `clamp()` e container queries (`cqw`).
  2. Implementar os 8 layouts visuais nos padrões editoriais do AulaViva (`capa`, `conteudo`, `definicao`, `exemplo`, `formula`, `duas-colunas`, `revisao`, `perguntas`).
  3. Criar a heurística inteligente que detecta o conteúdo textual e seleciona o melhor layout automaticamente quando a API retornar apenas o genérico `content`.
  4. Adicionar controles de navegação completos: botões anterior/próximo, atalhos de teclado (setas ← →, Home, End), gestos de toque (swipe mobile), modo tela cheia via Fullscreen API, modo foco e miniaturas em miniatura.
  5. Conectar a aba `slides` em `DetalheAula.tsx` e validar com `typecheck`, `lint` e `build`.

---

## 3. Decisões Tomadas e Divergências Identificadas

1. **Parser de Resumo Seguro e Tolerante (`src/lib/resumo.ts`):**
   - **Zero `dangerouslySetInnerHTML`**: todo o conteúdo gerado pela IA é sanitizado e convertido em nós React puros (`h3`, `p`, `ul`, `li`).
   - Remove automaticamente blocos `<think>...</think>` que possam ter vazado do raciocínio da IA.
   - Preserva caracteres e símbolos matemáticos e científicos (`≠`, `x²`, `-3/2`, `Δ`, `√`) sem corrompê-los com interpretadores de markdown.
   - Gera índice de navegação dinâmico para resumos com 3 ou mais seções.
2. **Cópia de Conteúdo Resiliente (`src/lib/clipboard.ts`):**
   - Detecta e contorna a restrição de HTTPS do `navigator.clipboard` em redes locais (`http://IP:8080`), implementando fallback com `<textarea readonly>` invisível e `document.execCommand('copy')`.
3. **Galeria de Fotos do Quadro (`AbaFotos.tsx`):**
   - Utiliza `<dialog>` nativo do HTML5 com foco retido, fechamento por `Esc` ou botão, e navegação entre imagens pelas setas do teclado.
   - Tratamento gracioso para imagens que não carregarem (`onError`), substituindo por aviso sem quebrar a grade.
4. **Resguardo Pedagógico e Ético do Aluno:**
   - Em caso de aula com status `CREATED` ou `FAILED`, a interface exibe mensagem amigável e nunca expõe o `failureReason` técnico do servidor ao aluno.
   - Aviso fixo obrigatório sobre IA presente no topo de todas as aulas.

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
  *(Resultado na F4: 0 erros)*
* **Linting:**
  ```powershell
  npm.cmd run lint
  ```
  *(Resultado na F4: 0 erros, 0 avisos)*
* **Build de Produção:**
  ```powershell
  npm.cmd run build
  ```
  *(Resultado na F4: 0 erros, bundle gerado com sucesso em 6.54s)*

---

## 5. Log por Fase

### Fase 1: Fundação Técnica e Infraestrutura (12/11/2026)
* Fontes locais `@fontsource`, `index.html` saneado com favicon SVG próprio, proxy no Vite, cliente de API com XHR progress e mock integrado, roteador hash com acessibilidade de foco e layout base da aplicação. Commit: `be5ae67`.

### Fase 2: Entrada e Alinhamento da Apresentação (12/11/2026)
* `PaginaEntrar.tsx` integrada com seleção de perfil Aluno/Professor e aviso de segurança. Botão "Entrar" funcional em todos os cabeçalhos e chamadas. Textos institucionais corrigidos para Resumo, Slides e Vídeo no NotebookLM. Commit: `72dcba3`.

### Fase 3: Biblioteca do Aluno (12/11/2026)
* Biblioteca de aulas `#/aulas` com listagem agrupada por disciplina em ordem alfabética e temporal, busca com debounce de 200ms e normalização de acentos, chips com contagem, esqueletos animados e auto-refresh de 30s. Commit: `dc57d4f`.

### Fase 4: Aula: Resumo e Fotos (12/11/2026)
* **Atividades Realizadas:**
  - Implementado `src/lib/resumo.ts`: analisador tolerante de resumo sem dangerouslySetInnerHTML, remoção de `<think>`, detecção inteligente de cabeçalhos e listas, preservando fórmulas matemáticas.
  - Implementado `src/lib/clipboard.ts`: cópia resiliente com suporte a redes locais sem HTTPS.
  - Implementado `src/features/aulas/AbaResumo.tsx`: renderização pura de nós React, índice de seções automático, botão de cópia com feedback visual e folha de estilo para impressão limpa.
  - Implementado `src/features/aulas/AbaFotos.tsx`: galeria com lazy-loading e modal nativo `<dialog>` com navegação por teclado e zoom acessível.
  - Implementado `src/features/aulas/DetalheAula.tsx`: controle de status (`DONE`, `PROCESSING` com polling de 3s e mascote reflexivo, `FAILED`/`CREATED` amigável), abas sincronizadas com `?aba=` e banner permanente de IA.
  - Conectado em `src/App.tsx`.
* **Resultado dos Comandos:**
  - `typecheck`: Sucesso (0 erros).
  - `lint`: Sucesso (0 erros, 0 avisos).
  - `build`: Sucesso (6.54s).
* **Commit:** `feat(aula): implementa pagina da aula com abas, parser de resumo seguro e modal de fotos`

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

Fase atual: Fase 5 (Sistema de Slides).
Próximo passo: Implementar o visualizador de slides editorial responsivo em 16:9, os 8 layouts visuais, a heurística de layout, controles de teclado/toque/tela cheia e exportação para impressão.
```
