# PROGRESSO DO PROJETO — FRONT-END AULAVIVA

---

## 1. Estado Geral das Fases

| Fase | Descrição | Status | Data de Conclusão |
|---|---|---|---|
| **F0** | Planejamento, Análise e Protocolo | ✅ Concluída | 12/11/2026 |
| **F1** | Fundação (fontes locais, index.html, roteador hash, cliente API/mock, proxy) | ✅ Concluída | 12/11/2026 |
| **F2** | Entrada e Apresentação (#/entrar, rolagem suave, correção de textos) | ✅ Concluída | 12/11/2026 |
| **F3** | Biblioteca do Aluno (#/aulas, busca, agrupamento, filtros, estados) | 🟨 Em andamento | — |
| **F4** | Aula: Resumo e Fotos (parser tolerante, sem dangerouslySetInnerHTML, modal de fotos) | ⬜ Pendente | — |
| **F5** | Sistema de Slides (layouts CSS, teclado, toque, tela cheia, impressão) | ⬜ Pendente | — |
| **F6** | Guia do NotebookLM (passos.json, marcações SVG, fallback de cópia) | ⬜ Pendente | — |
| **F7** | Como foi Gerado (diálogo de transparência, abas, mock de prompts) | ⬜ Pendente | — |
| **F8** | Painel do Professor (criar aula, upload de áudio com XHR, fotos com canvas) | ⬜ Pendente | — |
| **F9** | Mascote e Animações (ArtFigure desacoplado, estados, modo leve) | ⬜ Pendente | — |
| **F10**| Acabamento e Entrega (WCAG AA, 360px, offline, roteiro para static do Spring) | ⬜ Pendente | — |

---

## 2. Fase Atual e Próximo Passo

* **Fase Atual:** F3 — Biblioteca do Aluno (`#/aulas`).
* **Próximo Passo Exato:**
  1. Implementar o componente `BibliotecaAulas.tsx` consumindo `api.listarAulas()`.
  2. Filtrar por `status === 'DONE'` e `hidden !== true`.
  3. Agrupamento por disciplina (`subject`) com ordenação alfabética insensível a acentos/caixa e ordenação decrescente por data dentro do grupo.
  4. Barra de busca com debounce (200ms) e normalização de acentos.
  5. Chips de filtro com contadores de aulas.
  6. Estados visuais: esqueletos animados de carregamento, estado vazio, busca sem resultado e erro com botão de recarregar.
  7. Atualização automática com aba visível a cada 30 segundos.

---

## 3. Decisões Tomadas e Divergências Identificadas

1. **Alinhamento dos Textos da Apresentação:**
   * Removidas todas as menções a transcrição visível ao estudante ou exercícios gerados por IA como recursos finalizados nos componentes `StudentPlatform.tsx`, `HowItWorks.tsx`, `AIFeatures.tsx`, `ProcessFlow.tsx` e `Footer.tsx`.
   * Incluídas as três entregas reais do AulaViva para o aluno: **Resumo Didático Estruturado**, **Apresentação de Slides Dinâmica** e **Roteiro/Guia para Vídeo no NotebookLM**.
2. **Rolagem Suave JS vs Roteamento Hash:**
   * Todos os menus da página inicial (`Nav.tsx` e `Footer.tsx`) agora usam `scrollIntoView({ behavior: 'smooth' })` sobre IDs fixos (`#funcionamento`, `#ia`, `#plataforma`, `#tecnologia`, `#etapas`), evitando qualquer conflito com o roteamento por hash (`#/`, `#/entrar`, `#/aulas`, `#/professor`).
3. **Componentes com Dados Fictícios Desativados:**
   * Os componentes `Features.tsx`, `Showcase.tsx`, `Stats.tsx` e `Testimonials.tsx` permanecem fora da árvore de renderização do `App.tsx` para não exibir depoimentos ou métricas inventadas na apresentação oficial.
4. **Resiliência de Git:**
   * Commit local da Fase 1 registrado sob o hash `be5ae67`. Tentativa de push acusou indisponibilidade temporária de rede externa, o que preserva os commits locais intactos no branch `feature/interface-web`.

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
  *(Resultado na F2: 0 erros)*
* **Linting:**
  ```powershell
  npm.cmd run lint
  ```
  *(Resultado na F2: 0 erros, 0 avisos)*
* **Build de Produção:**
  ```powershell
  npm.cmd run build
  ```
  *(Resultado na F2: 0 erros, bundle gerado em 10.53s)*

---

## 5. Log por Fase

### Fase 1: Fundação Técnica e Infraestrutura (12/11/2026)
* Fontes locais `@fontsource`, `index.html` saneado com favicon SVG próprio, proxy no Vite, cliente de API com XHR progress e mock integrado, roteador hash com acessibilidade de foco e layout base da aplicação. Commit: `be5ae67`.

### Fase 2: Entrada e Alinhamento da Apresentação (12/11/2026)
* **Atividades Realizadas:**
  - `PaginaEntrar.tsx` integrada com seleção de perfil Aluno (`#/aulas`) e Professor (`#/professor`), persistência em `localStorage` com try/catch, aviso de segurança e mascote em pose de boas-vindas.
  - Botão "Entrar" ativo em `Nav.tsx`, `Hero.tsx`, `CTA.tsx` e `Footer.tsx`.
  - Links de âncora ajustados para rolagem suave via JavaScript sem colidir com rotas hash.
  - Textos de `StudentPlatform.tsx`, `HowItWorks.tsx`, `AIFeatures.tsx`, `ProcessFlow.tsx` e `Footer.tsx` corrigidos para refletir Resumos, Slides e Vídeo no NotebookLM (sem transcrição e sem exercícios fictícios).
  - Componentes com dados fictícios (`Stats.tsx`, `Testimonials.tsx`) devidamente isolados fora do `App.tsx`.
* **Resultado dos Comandos:**
  - `typecheck`: Sucesso (0 erros).
  - `lint`: Sucesso (0 erros, 0 avisos).
  - `build`: Sucesso (10.53s).
* **Commit:** `feat(apresentacao): alinha textos com produto real e integra botoes de entrada`

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

Fase atual: Fase 3 (Biblioteca do Aluno).
Próximo passo: Implementar a tela #/aulas com busca, filtros de disciplina, agrupamento alfabético e temporal, esqueletos de carregamento e estados de erro/vazio.
```
