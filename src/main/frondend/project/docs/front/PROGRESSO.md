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
| **F5** | Sistema de Slides (layouts CSS, teclado, toque, tela cheia, impressão) | 🟨 F5a concluída — F5b pendente | 13/11/2026 (F5a) |
| **F6** | Guia do NotebookLM (passos.json, marcações SVG, fallback de cópia) | ⬜ Pendente | — |
| **F7** | Como foi Gerado (diálogo de transparência, abas, mock de prompts) | ⬜ Pendente | — |
| **F8** | Painel do Professor (criar aula, upload de áudio com XHR, fotos com canvas) | ⬜ Pendente | — |
| **F9** | Mascote e Animações (ArtFigure desacoplado, estados, modo leve) | ⬜ Pendente | — |
| **F10**| Acabamento e Entrega (WCAG AA, 360px, offline, roteiro para static do Spring) | ⬜ Pendente | — |

---

## 2. Fase Atual e Próximo Passo

* **Fase Atual:** F5 — Sistema Dinâmico de Slides (`#/aulas/:id?aba=slides`). **F5a concluída; F5b aguarda autorização do dono.**
* **Concluído na F5a (commit `40b77e9`):**
  1. Visualizador 16:9 com tipografia fluida (`clamp()` + `cqw`), container queries e escala automática para slides densos.
  2. Oito layouts editoriais distintos (`capa`, `conteudo`, `definicao`, `exemplo`, `formula`, `duas-colunas`, `revisao`, `perguntas`), com cascata real de 50 ms por item.
  3. Heurística de layout com limites de palavra e detecção de fórmula sem falsos positivos (`+`, `/` isolados não contam).
  4. Navegação completa: setas, Home/End, swipe horizontal dominante, tela cheia, modo foco, `aria-current` e anúncios `aria-live`.
  5. Miniaturas desktop com pré-visualização real dos layouts (960×540 reduzido para 192×108) e faixa numerada de 44 px no celular.
  6. Impressão/PDF em paisagem, um slide por página, via `DeckImpressao.tsx` e regras `@page`.
  7. Continuação automática: slides com mais de 6 itens são divididos em partes com o mesmo layout.
  8. Honestidade de dados: mock apenas com `?mock=1`; API real sem `presentation` exibe mensagem de indisponibilidade.
* **Próximo Passo Exato (F5b — somente após autorização):**
  1. Validar em navegador real: teclado, foco, tela cheia, swipe, 360 px, contraste e miniaturas.
  2. Validar impressão/PDF em Chrome/Edge (paisagem, uma página por slide, sem conteúdo cortado).
  3. Finalizar a documentação da fase e apresentar o relatório de F5.
  4. Registrar eventuais ajustes visuais encontrados na validação e só então commitar o fechamento da F5.

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
5. **Slides somente com dados reais ou mock explícito (F5a):**
   - Removido todo fallback automático para mock em `src/api/cliente.ts`. Falhas da API agora propagam o erro real.
   - O modo de exemplo só é ativado por `?mock=1` (ou `forcarMock` explícito em `src/config/recursos.ts`).
   - Como o backend real ainda não possui `presentation`, a aba Slides mostra “Os slides desta aula ainda não foram gerados”, sem simular conteúdo.
   - Até o backend expor `hasSlides`/`hasImages` em `LessonResponse`, os selos do cartão da aula ficam ocultos para não prometer recursos inexistentes.
6. **Continuação automática de slides densos (F5a):**
   - `src/features/slides/deckSlides.ts` deriva slides de continuação quando o original tem mais de 6 itens, mantendo no máximo 6 por tela.
   - O layout é resolvido uma única vez sobre o slide original; a partir da parte 2, `definicao` vira `conteudo` para não repetir a frase de destaque.
   - Títulos de continuação seguem o padrão “Título — parte N de M”.
7. **Acessibilidade e contraste (F5a):**
   - Medições sobre o pergaminho `#f5efe4`: ouro `#c9a227` = 2,11:1, ouro suave = 1,31:1, terracota = 4,33:1 e sálvia = 4,03:1.
   - Criados tokens acessíveis `gold-deep #6b5a12` (5,93:1), `sage-deep #4b5940` (6,55:1) e `terra-deep #7a3618` (7,75:1), usados em textos pequenos e no anel de foco.
8. **Impressão e ambiente (F5a):**
   - `DeckImpressao.tsx` imprime um slide por página em A4 paisagem, sem duplicar o palco ativo; cabeçalho, rodapé e página são ocultados na tela.
   - `src/app/ambiente.ts` ativa modo leve automático em dispositivos modestos e pausa animações quando a aba fica oculta.

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
  *(Resultado na F5a: 0 erros)*
* **Linting:**
  ```powershell
  npm.cmd run lint
  ```
  *(Resultado na F5a: 0 erros, 0 avisos)*
* **Build de Produção:**
  ```powershell
  npm.cmd run build
  ```
  *(Resultado na F5a: 0 erros, 1601 módulos; JS 280,09 kB / 83,06 kB gzip; CSS 79,95 kB / 25,31 kB gzip)*
* **Teste lógico da derivação/heurística (temporário, fora do repositório):**
  - 8 slides originais geraram 9 derivados; continuação com “parte 2 de 2”; máximo de 6 itens por slide.
  - Guardas contra falso positivo (`exemplar`, `custo + taxa`, `entrada/saída`) e detecção de fórmula real (`f(x) = ax + b`, `a ≠ 0`) aprovadas.
  - Layout declarado específico respeitado; último slide sem sinal vira revisão; perguntas continuam perguntas.

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

### Fase 5a: Sistema de Slides — refino visual, continuação e impressão (13/11/2026)
* **Atividades Realizadas:**
  - Reescrito `VisualizadorSlides.tsx`: palco 16:9, atalhos com guarda para elementos interativos, Home/End, swipe com checagem de eixo, tela cheia, modo foco, `aria-current`, anúncios `aria-live` e mensagem honesta quando não há `presentation`.
  - Reescrito `SlideItemRenderer.tsx`: oito layouts realmente distintos, tipografia fluida com `--slide-scale`, cascata de 50 ms e acentos acessíveis.
  - Criado `deckSlides.ts`: continuação automática para slides com mais de 6 itens.
  - Criado `DeckImpressao.tsx`: deck de impressão em paisagem, um slide por página.
  - Reescrito `MiniaturasSlides.tsx`: previews reais dos layouts no desktop e faixa numerada de 44 px no celular.
  - Reescrita `heuristicaLayout.ts`: apelidos de layout, limites de palavra e detecção de fórmula sem `+`/`/` isolados.
  - Atualizados `index.css` e `tailwind.config.js`: container queries, tipografia fluida, modo claro/aba oculta, foco acessível e regras `@page`.
  - Removidos fallbacks automáticos de mock em `cliente.ts`; `mock.ts` ganhou slide de 8 itens e `hasImages`.
  - `CartaoAula.tsx` só exibe selos quando `hasSlides`/`hasImages` são explicitamente `true`.
  - Complemento `eb9f539`: a orientação paisagem foi restrita ao deck de slides via *named page* (`@page slides-aulaviva`), mantendo o resumo em retrato; o cabeçalho da aula só é oculto na impressão da aba Slides.
* **Resultado dos Comandos:**
  - `typecheck`: Sucesso (0 erros).
  - `lint`: Sucesso (0 erros, 0 avisos).
  - `build`: Sucesso (1601 módulos; JS 280,09 kB / 83,06 kB gzip; CSS 79,95 kB / 25,31 kB gzip).
  - Teste lógico da derivação/heurística: todos os casos aprovados.
* **Limite de validação:** navegador real, dispositivos móveis e geração de PDF **não** foram executados nesta etapa; ficam para a F5b.
* **Commit:** `40b77e9` — `feat(slides): refina apresentacao 16:9, continuacao e impressao` (complemento de impressão em `eb9f539`)

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

Fase atual: Fase 5 (Sistema de Slides). A F5a está concluída no commit `40b77e9`.
Próximo passo: F5b — validar em navegador real e dispositivos móveis (teclado, foco, tela cheia, swipe, 360 px, contraste e miniaturas), validar impressão/PDF em paisagem, corrigir o que for encontrado e só então fechar a F5 com relatório e documentação final.

Restrições que continuam valendo:
- Slides são demonstração apenas em `?mock=1`; a API real deve mostrar “slides ainda não gerados”.
- Não reintroduzir fallback automático de mock.
- Slides com mais de 6 itens usam continuação derivada.
- Não iniciar a F6 sem autorização do dono.
```
