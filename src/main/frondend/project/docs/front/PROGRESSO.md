# PROGRESSO DO PROJETO — FRONT-END AULAVIVA

---

## 1. Estado Geral das Fases

| Fase | Descrição | Status | Data de Conclusão |
|---|---|---|---|
| **F0** | Planejamento, Análise e Protocolo | ✅ Concluída | 12/11/2026 |
| **F1** | Fundação (fontes locais, index.html, roteador hash, cliente API/mock, proxy) | ✅ Concluída | 12/11/2026 |
| **F2** | Entrada e Apresentação (#/entrar, rolagem suave, correção de textos) | 🟨 Em andamento | — |
| **F3** | Biblioteca do Aluno (#/aulas, busca, agrupamento, filtros, estados) | ⬜ Pendente | — |
| **F4** | Aula: Resumo e Fotos (parser tolerante, sem dangerouslySetInnerHTML, modal de fotos) | ⬜ Pendente | — |
| **F5** | Sistema de Slides (layouts CSS, teclado, toque, tela cheia, impressão) | ⬜ Pendente | — |
| **F6** | Guia do NotebookLM (passos.json, marcações SVG, fallback de cópia) | ⬜ Pendente | — |
| **F7** | Como foi Gerado (diálogo de transparência, abas, mock de prompts) | ⬜ Pendente | — |
| **F8** | Painel do Professor (criar aula, upload de áudio com XHR, fotos com canvas) | ⬜ Pendente | — |
| **F9** | Mascote e Animações (ArtFigure desacoplado, estados, modo leve) | ⬜ Pendente | — |
| **F10**| Acabamento e Entrega (WCAG AA, 360px, offline, roteiro para static do Spring) | ⬜ Pendente | — |

---

## 2. Fase Atual e Próximo Passo

* **Fase Atual:** F2 — Entrada e Apresentação (Iniciando).
* **Próximo Passo Exato:**
  1. Revisar e alinhar os textos de `StudentPlatform.tsx` (remover menções a "Transcrição" e "Exercícios"; adicionar "Resumo", "Slides" e "Vídeo NotebookLM").
  2. Revisar e alinhar os textos de `HowItWorks.tsx` (remover menções a geração de exercícios; focar em resumos e slides).
  3. Desativar/remover de `App.tsx` componentes com depoimentos e métricas inventadas (`Stats.tsx`, `Testimonials.tsx`).
  4. Garantir que todas as chamadas de ação da apresentação conduzam a `#/entrar` e que a rolagem suave em JavaScript funcione perfeitamente.

---

## 3. Decisões Tomadas e Divergências Identificadas

1. **Fontes 100% Locais:** O `@import` do Google Fonts foi completamente eliminado de `src/index.css`. Foram instalados e integrados os pacotes `@fontsource/cormorant-garamond` e `@fontsource/manrope`, garantindo funcionamento pleno em redes locais sem acesso externo.
2. **Remoção do Supabase:** Removido `@supabase/supabase-js` do `package.json`. A aplicação opera de modo estritamente autônomo com o backend Spring Boot ou com o mock local.
3. **Roteador por Hash Resiliente:** Implementado `src/app/Roteador.tsx` baseado em `hashchange`, que previne qualquer conflito com roteamento no backend Spring, com controle de foco (`h1`) e rolagem automática ao topo a cada transição de tela.
4. **Cliente de API Tolerante:** `src/api/cliente.ts` unifica chamadas `fetch` com limite de 30s (`AbortController`), `XMLHttpRequest` com progresso real de upload e fallback automático e transparente para dados de demonstração (`src/api/mock.ts`) caso o backend Java esteja temporariamente offline ou a flag `?mock=1` esteja ativa.
5. **Correção de Regras de Hooks no Frontend Existente:** Corrigidas violações de `useReveal` que eram chamadas dentro de callbacks `.map()` nos componentes `Privacy.tsx`, `Roadmap.tsx`, `TeacherArea.tsx` e `TechStack.tsx`, extraindo subcomponentes dedicados para cada card.
6. **Controle de Comandos no Windows:** Todos os scripts rodam com `npm.cmd`, eliminando bloqueios de permissão do PowerShell.

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
  *(Resultado na F1: 0 erros)*
* **Linting:**
  ```powershell
  npm.cmd run lint
  ```
  *(Resultado na F1: 0 erros, 0 avisos)*
* **Build de Produção:**
  ```powershell
  npm.cmd run build
  ```
  *(Resultado na F1: Compilação concluída em ~8s gerando bundles locais otimizados em `dist/`)*
* **Execução em Desenvolvimento:**
  ```powershell
  npm.cmd run dev
  ```
  * Apresentação: `http://localhost:5173/#/`
  * Porta de entrada: `http://localhost:5173/#/entrar`
  * Modo de demonstração (Mock): `http://localhost:5173/?mock=1#/`

---

## 5. Mapa de Arquivos Criados ou Modificados na F1

| Arquivo | Função |
|---|---|
| `docs/front/PLANO.md` | Especificação completa da arquitetura, sistema de design, fases e critérios de aceitação |
| `docs/front/PROGRESSO.md` | Registro vivo de estado, divergências, decisões tomadas e log de fases |
| `package.json` | Dependências atualizadas (fontes locais adicionadas, Supabase removido) |
| `index.html` | Idioma pt-BR, favicon vetorial próprio, metadados limpos sem serviços externos |
| `public/favicon.svg` | Favicon SVG exclusivo em ouro e tinta clássica |
| `vite.config.ts` | Configurado proxy reverso para `/api` e `/status` apontando para o Spring Boot |
| `src/index.css` | Importação de fontes locais, novas animações fluidas, estilos de foco e CSS de impressão |
| `src/config/recursos.ts` | Feature flags (`usarMock`, `ocultarAulaAluno`, etc.) |
| `src/api/tipos.ts` | Contratos TypeScript completos da API e de slides |
| `src/api/mock.ts` | Dados simulados realistas com 4 aulas diversas, transições de estado e prompts |
| `src/api/cliente.ts` | Cliente HTTP unificado (fetch, XHR upload com progresso real, timeout 30s) |
| `src/textos/pt-BR.ts` | Centralização de textos da interface em português |
| `src/textos/mascote.ts` | Diálogos contextuais do mascote ArtFigure |
| `src/app/Roteador.tsx` | Roteador hash com rolagem ao topo e acessibilidade de foco |
| `src/app/LayoutApp.tsx` | Cabeçalho enxuto da aplicação com alternador Aluno/Professor e botão Início |
| `src/pages/PaginaEntrar.tsx` | Porta de entrada ("Sou aluno" / "Sou professor") com mascote e aviso de segurança |
| `src/pages/Pagina404.tsx` | Tela amigável para rotas inexistentes com mascote reflexivo |
| `src/components/Nav.tsx` | Navegação com rolagem suave em JavaScript e botão "Entrar" funcional |
| `src/components/Hero.tsx` | Chamada principal atualizada para navegar para `#/entrar` |
| `src/components/CTA.tsx` | Botão de encerramento direcionando para `#/entrar` |
| `src/components/Privacy.tsx` | Correção da regra de Hooks do React |
| `src/components/Roadmap.tsx` | Correção da regra de Hooks e atualização de textos |
| `src/components/TeacherArea.tsx`| Correção da regra de Hooks e link para painel docente |
| `src/components/TechStack.tsx` | Correção da regra de Hooks |
| `src/App.tsx` | Ponto de entrada chaveando apresentação e aplicação via roteador hash |

---

## 6. Log por Fase

### Fase 1: Fundação Técnica e Infraestrutura (12/11/2026)
* **Atividades Realizadas:**
  - Fontes locais configuradas e empacotadas via `@fontsource`.
  - `index.html` saneado e integrado com favicon vetorial exclusivo.
  - Proxy do Vite ativo para comunicação direta sem CORS com o backend.
  - Contratos TypeScript e cliente de API com XHR progress implementados.
  - Conjunto de dados mock com 4 aulas completas incluindo slides nos 8 layouts.
  - Roteador hash e layouts implementados; tela provisória `#/entrar` funcional.
  - Correção de regras de hooks em componentes da apresentação.
* **Resultado dos Comandos:**
  - `npm.cmd run typecheck`: Sucesso (0 erros).
  - `npm.cmd run lint`: Sucesso (0 erros, 0 avisos).
  - `npm.cmd run build`: Sucesso (tempo de compilação ~8s, bundle otimizado).
* **Commit:** `feat(fundacao): implementa fontes locais, roteamento hash, cliente api e mock`

---

## 7. Prompt de Continuação

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

Fase atual: Fase 2 (Entrada e Apresentação).
Próximo passo: Ajustar os textos de StudentPlatform e HowItWorks, remover componentes com dados fictícios, testar a navegação e validar com typecheck e build.
```
