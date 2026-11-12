# PLANO DE DESENVOLVIMENTO — FRONT-END AULAVIVA

---

## 1. O que é o AulaViva e Escopo do Front-End

O **AulaViva** é uma plataforma educacional que recupera o conteúdo de aulas perdidas por estudantes (faltas, desatenção, dificuldades de aprendizagem) através do processamento de áudio da aula e fotografias do quadro por um backend Spring Boot integrado a modelos de IA (Whisper Large V3 e Qwen 3.8 27B via Groq), gerando resumos didáticos estruturados e apresentações de slides dinâmicas.

O front-end é uma aplicação web única em **React 18 + TypeScript + Vite + Tailwind CSS**, construída como extensão da página de apresentação já existente. A apresentação institucional permanece como rota inicial (`#/`), e o botão "Entrar" direciona à porta de entrada (`#/entrar`), que ramifica a experiência para a **Biblioteca do Aluno** (`#/aulas` e `#/aulas/:id`) ou para o **Painel do Professor** (`#/professor`), com roteamento por Hash (`HashRouter` ou roteador por hash próprio), sem necessidade de autenticação/login.

### Público e Contexto de Uso
* **Aluno (12 a 18 anos):** Consumo exclusivo de conteúdo — resumo didático estruturado, slides com design editorial, galeria de fotos do quadro com zoom acessível, guia interativo para geração de vídeo no Google NotebookLM e diálogo "Como foi gerado" (transparência de IA). O aluno **nunca** vê a transcrição bruta do áudio.
* **Professor:** Cadastro de aulas (título/disciplina), upload de áudio com acompanhamento de progresso real (XHR), envio de fotos do quadro (com compressão local em canvas), acompanhamento do pipeline e reprocessamento em caso de falha.
* **Banca e Feira Escolar:** Demonstração fluida de 2 a 3 minutos, operando em rede local (hotspot/roteador), potencialmente sem conexão externa à internet, em celulares modestos. Robustez, velocidade e estabilidade visual absoluta são vitais.

### Fora de Escopo
Login/cadastro de usuários, integração com Google Classroom, captura de hardware ESP32, testes/exercícios/simulados e qualquer modificação no backend Java.

---

## 2. Sistema de Design e Identidade Visual

A identidade visual é clássica, editorial e acolhedora, combinando tipografia humanista e renascentista com acabamento em textura de pergaminho, fios dourados e desenho a traço artístico.

### Paleta de Cores (Tokens Semânticos)
| Token | Hex | Significado e Aplicação |
|---|---|---|
| `ink` | `#1a1612` | Tinta escura para textos principais, títulos, bordas finas e botões primários |
| `ink-soft` | `#3a342c` | Tinta secundária para textos auxiliares, metadados e legendas |
| `parchment` | `#f5efe4` | Fundo principal da página (papel pergaminho) |
| `gold` | `#c9a227` | Ouro nobre para detalhes decorativos, fios de destaque, halos e foco |
| `gold-soft` | `#e6d29a` | Ouro suave para bordas sutis, divisores e fundos de destaque |
| `terra` | `#b5532a` | Terracota para acentos quentes, botões de ação e alertas visuais |
| `terra-deep` | `#7a3618` | Terracota escuro para estados de `:hover` e ênfase máxima |
| `sage` | `#6b7a5a` | Sálvia suave para estados positivos (sucesso, confirmações, concluído) |

### Tipografia
* **Títulos e Destaques:** Cormorant Garamond (`font-display`), serifada clássica inspirada nas matrizes renascentistas de Garamond. Pesos 500, 600, 700.
* **Corpo e Interface:** Manrope (`font-sans`), sem serifa geométrica humanista para máxima legibilidade em telas e resoluções variadas. Pesos 400, 500, 600, 700.
* **Ajuste de Fontes:** Migração total de fontes remotas do Google Fonts para pacotes locais `@fontsource/*` para funcionamento 100% offline.

### Elementos Gráficos e Classes Reutilizáveis
* `.art-frame`: Moldura artística com gradiente de pergaminho (`#f8f2e7` a `#ece3d0`), borda interna sutil em ouro (`rgba(201,162,39,0.25)`) e sombra profunda suave.
* `.gold-line`: Fio gradiente linear com desvanecimento nas pontas (`transparent -> var(--gold) -> transparent`).
* `.ink-btn`: Botão estilizado com transição suave (`cubic-bezier(0.16, 1, 0.3, 1)`), hover com elevação de 2px e sombra difusa em terracota escuro.
* `.paper-grain`: Textura de granulação sutil simulando papel real via pseudo-elemento e gradientes radiais.
* `.reveal` / `.reveal-scale` / `.in-view`: Classes de revelação com easing suave acionadas pelo hook `useReveal` via `IntersectionObserver`.

### Animações Avançadas e Estilo Profissional
Foco em refinamento de movimento moderno e elegante, mantendo conformidade estrita com `prefers-reduced-motion` e hardware modesto:
1. **Micro-interações:** Hover com física natural em cards e botões (elevação suave, brilho de borda em ouro difuso).
2. **Entrada de Slides:** Transição de slide fluida via `transform: translateX` e `opacity` com curva de aceleração cúbica natural (300ms) e entrada em cascata de itens com delays de 40-60ms.
3. **Desenho de SVG em Tempo Real (`dashDraw`):** Traço de caneta-tinteiro que se autodesenha nas poses do mascote e nas anotações do guia do NotebookLM.
4. **Shimmer e Brilho:** Efeito `shimmer-text` dourado nos títulos e destaques e `pulse-glow` em indicadores de status ativo.
5. **Modo Leve Automático:** Desativação de efeitos pesados caso `navigator.hardwareConcurrency <= 4` ou `navigator.deviceMemory <= 2`.

### Mascote ArtFigure
O personagem animado é baseado em traços vetoriais com poses inspiradas na história da arte clássica:
* `vitruvian` (Leonardo da Vinci) → Boas-vindas na entrada e topo da biblioteca.
* `scholar` (Vermeer / A Leitora) → Aluno estudando e lendo resumo.
* `scribe` (São Jerônimo / O Escriba) → Painel do professor e upload.
* `david` (Michelangelo) → Acompanhamento de processamento e estados reflexivos.
* `discobolus` (Míron) → Upload em andamento (envio).
* `creation` (Michelangelo / Criação de Adão) → Guia do NotebookLM, indicando passos e conexão.
* `nike` (Vitória de Samotrácia) → Sucesso, aula concluída, cópia confirmada.

---

## 3. Arquitetura de Pastas Planejada

Todo o trabalho reside estritamente dentro da pasta do front-end (`src/main/frondend/project/`):

```
frontend/ (src/main/frondend/project/)
├── docs/
│   └── front/
│       ├── PLANO.md              # Este plano
│       └── PROGRESSO.md          # Registro vivo de status
├── public/
│   ├── favicon.svg               # Favicon próprio em vetor
│   └── guia/                     # Imagens dos passos do NotebookLM
│       ├── passo-01.webp ... passo-07.webp
├── src/
│   ├── api/
│   │   ├── cliente.ts            # Único ponto com fetch/XHR, AbortController
│   │   ├── tipos.ts              # DTOs e contratos TypeScript
│   │   └── mock.ts               # Dados simulados com latência real e transição de status
│   ├── app/
│   │   ├── Roteador.tsx          # Gerenciamento de rotas por Hash (#/)
│   │   ├── LayoutApp.tsx         # Cabeçalho enxuto da aplicação interna
│   │   └── ModoLeveContext.tsx   # Detector de performance e prefers-reduced-motion
│   ├── components/               # Componentes da apresentação (existentes, refinados)
│   │   ├── Nav.tsx               # Ajustado com rolagem suave JS e botão Entrar ativo
│   │   ├── Hero.tsx
│   │   ├── StudentPlatform.tsx   # Textos corrigidos (sem transcrição/exercícios)
│   │   ├── HowItWorks.tsx        # Ajustado para resumos e slides
│   │   ├── Roadmap.tsx           # Exercícios marcados como "em breve"
│   │   └── ...
│   ├── config/
│   │   └── recursos.ts           # Chaves de funcionalidade (mock, visibilidade, etc.)
│   ├── features/
│   │   ├── aulas/                # Biblioteca e visualização de aula do aluno
│   │   │   ├── BibliotecaAulas.tsx
│   │   │   ├── CartaoAula.tsx
│   │   │   ├── FiltroDisciplinas.tsx
│   │   │   ├── DetalheAula.tsx
│   │   │   ├── AbaResumo.tsx
│   │   │   ├── AbaFotos.tsx
│   │   │   ├── DialogComoFoiGerado.tsx
│   │   │   └── ModalVisualizadorImagem.tsx
│   │   ├── slides/               # Sistema dinâmico e editorial de slides
│   │   │   ├── VisualizadorSlides.tsx
│   │   │   ├── SlideCapa.tsx
│   │   │   ├── SlideConteudo.tsx
│   │   │   ├── SlideDefinicao.tsx
│   │   │   ├── SlideExemplo.tsx
│   │   │   ├── SlideFormula.tsx
│   │   │   ├── SlideDuasColunas.tsx
│   │   │   ├── SlideRevisao.tsx
│   │   │   ├── SlidePerguntas.tsx
│   │   │   └── MiniaturasSlides.tsx
│   │   ├── guia/                 # Guia interativo passo a passo do NotebookLM
│   │   │   ├── GuiaVideo.tsx
│   │   │   ├── MarcadorSvgGuia.tsx
│   │   │   └── passos.json       # Configuração dos 7 passos com coordenadas SVG
│   │   ├── professor/            # Painel docente completo
│   │   │   ├── PainelProfessor.tsx
│   │   │   ├── FormNovaAula.tsx
│   │   │   ├── UploadAudioProgresso.tsx
│   │   │   ├── UploadFotosCanvas.tsx
│   │   │   └── AcompanhamentoProcessamento.tsx
│   │   └── mascote/              # Componente Mascote desacoplado com balão de fala
│   │       ├── Mascote.tsx
│   │       └── estados.ts
│   ├── lib/
│   │   ├── resumo.ts             # Parser tolerante do summary (sem dangerouslySetInnerHTML)
│   │   ├── imagemCompressao.ts   # Redutor de imagem em canvas (max 2000px, JPEG 0.85)
│   │   └── clipboard.ts          # Cópia segura com fallback para caixa readonly
│   ├── textos/
│   │   ├── pt-BR.ts              # Textos da interface em português
│   │   └── mascote.ts            # Falas contextuais do mascote
│   ├── index.css                 # Importação de fontes locais e novas animações
│   └── main.tsx
├── package.json
└── vite.config.ts                # Configurado com proxy /api -> http://localhost:8080
```

---

## 4. Fases de Desenvolvimento e Critérios de Pronto

### Fase 1: Fundação Técnica e Infraestrutura
* **Atividades:**
  1. Instalação e configuração de fontes locais (`@fontsource/cormorant-garamond` e `@fontsource/manrope`).
  2. Limpeza de `src/index.css` (remover `@import` externo do Google Fonts).
  3. Correção de `index.html` (`lang="pt-BR"`, remoção de referências ao bolt.new, favicon vetorial local).
  4. Remoção da dependência não utilizada `@supabase/supabase-js`.
  5. Configuração do proxy no `vite.config.ts` (`/api` -> `http://localhost:8080`).
  6. Criação do cliente de API em `src/api/cliente.ts`, tipos TypeScript em `src/api/tipos.ts` e dados de exemplo em `src/api/mock.ts` (ativado por `?mock=1` ou `recursos.ts`).
  7. Implementação do roteador hash simples e robusto (`src/app/Roteador.tsx`) com tela provisória para `#/entrar`.
  8. Configuração de scripts de verificação (`npm run build`, `npm run typecheck`, `npm run lint`).
* **Critério de Pronto:** O projeto compila sem erros, a página inicial permanece idêntica e a rota `#/entrar` renderiza uma tela provisória sem falhas de roteamento.

### Fase 2: Entrada e Alinhamento da Apresentação
* **Atividades:**
  1. Criação da página `#/entrar` com os cartões "Sou aluno" (link `#/aulas`) e "Sou professor" (link `#/professor`), com aviso de segurança na área do professor e mascote receptivo.
  2. Ajuste do botão "Entrar" no menu (`Nav.tsx`) e chamadas de ação para navegar para `#/entrar`.
  3. Conversão de links âncora (`#funcionamento`, `#ia`, etc.) para rolagem suave em JavaScript sem alterar o hash da URL.
  4. Revisão e correção de todos os textos contraditórios na apresentação (remover menção a transcrição visível e exercícios prontos; adicionar slides e vídeo NotebookLM).
  5. Descarte / desativação dos componentes não utilizados com dados fictícios (`Stats.tsx`, `Testimonials.tsx`, etc.).
* **Critério de Pronto:** Navegação fluida entre a apresentação institucional e `#/entrar`, links internos com rolagem suave preservando a rota, e textos alinhados à realidade do produto.

### Fase 3: Biblioteca do Aluno (`#/aulas`)
* **Atividades:**
  1. Implementação da rota `#/aulas` com consumo de `GET /api/lessons`.
  2. Filtragem de aulas: exibir apenas aulas `status === 'DONE'` (e respeitar `hidden === false` quando presente).
  3. Agrupamento por disciplina (ordem alfabética normalizada) e ordenação por data decrescente.
  4. Campo de busca com debounce (200ms) e normalização de caracteres/acentos.
  5. Chips de seleção de disciplina com contagem e opção "Todas".
  6. Estados visuais completos: carregamento com esqueletos elegantes, estado vazio, busca sem correspondência com botão de limpar e erro de conexão com botão de tentar novamente.
  7. Atualização automática ao retornar foco à aba e a cada 30 segundos.
* **Critério de Pronto:** Lista de aulas dinâmica, responsiva e agrupada por matéria, funcionando de forma idêntica tanto com a API real quanto no modo `?mock=1`.

### Fase 4: Página da Aula, Analisador de Resumo e Galeria de Fotos
* **Atividades:**
  1. Implementação da rota `#/aulas/:id` com abas controladas (`aria-selected`, `role="tablist"`, teclado e query parameter `?aba=`).
  2. Analisador tolerante de resumo (`src/lib/resumo.ts`): remoção de tags `<think>`, detecção inteligente de cabeçalhos de seção, listas e separadores, índice dinâmico (quando $\ge 3$ seções), botões de cópia e folha de estilo para impressão.
  3. Renderização puramente em nós de React (proibido `dangerouslySetInnerHTML`).
  4. Aba de fotos do quadro com `loading="lazy"`, tratamento para imagens indisponíveis e visualizador modal em `<dialog>` com controle por teclado (setas e Esc) e foco retido.
  5. Banner permanente de aviso sobre geração por IA.
* **Critério de Pronto:** Resumos didáticos formatados com rigor estético, impressão limpa e galeria de fotos acessível com navegação por teclado.

### Fase 5: Sistema Dinâmico de Slides
* **Atividades:**
  1. Criação do visualizador de slides responsivo com proporção fixa 16:9 em container CSS (`aspect-ratio` e tipografia com `clamp()` e `cqw`).
  2. Implementação dos 8 layouts visuais no estilo da identidade:
     - `capa`: Título imponente em Cormorant, subtítulo da disciplina, fio de ouro e ArtFigure miniatura.
     - `conteudo`: Marcadores com losango dourado e entrada sequencial.
     - `definicao`: Frase em itálico de grande escala, capitular elegante e barra lateral dourada.
     - `exemplo`: Cartão com badge terracota "Exemplo".
     - `formula`: Fórmulas matemáticas centralizadas com sublinhado dourado.
     - `duas-colunas`: Distribuição em 2 blocos no desktop e 1 coluna em mobile.
     - `revisao`: Lista com marcadores de verificação verde sálvia.
     - `perguntas`: Cartões numerados para reflexão.
  3. Classificador inteligente que detecta o melhor layout quando a API envia apenas `content`.
  4. Controles: teclado (setas, Home, End), swipe touch em dispositivos móveis, tela cheia via Fullscreen API, modo foco e miniaturas de navegação.
  5. Suporte a impressão / exportação para PDF (um slide por página, paisagem).
* **Critério de Pronto:** Apresentação de slides interativa, com animações suaves de transição, legibilidade garantida em telas pequenas e conformidade total com acessibilidade (WCAG AA).

### Fase 6: Guia Visual do NotebookLM
* **Atividades:**
  1. Implementação da aba "Vídeo (NotebookLM)" na página da aula.
  2. Geração automática do prompt contextualizado com título e disciplina da aula.
  3. Três ações de topo numeradas (copiar resumo, copiar prompt, abrir NotebookLM).
  4. Mecanismo de cópia resiliente (Clipboard API + fallback com textarea selecionável).
  5. Estruturação dos 7 passos via `passos.json`, com caixas de imagem e anotações desenhadas em SVG (`círculo terracota` para clique e `caixa sálvia` para colar) com animação de traço.
  6. Placeholder visual gracioso para etapas sem imagens carregadas e seção de solução de problemas ("Algo deu errado?").
* **Critério de Pronto:** Guia perfeitamente compreensível e acionável mesmo sem as imagens finais carregadas, com cópia garantida em qualquer contexto de rede.

### Fase 7: Diálogo "Como Foi Gerado" (Transparência de IA)
* **Atividades:**
  1. Criação do diálogo modal nativo `<dialog>` acionado pelo cabeçalho da aula.
  2. Abas para inspeção de instruções: "Resumo", "Slides" e "Vídeo".
  3. Exibição das instruções em blocos somente leitura com metadados (modelo, versão, data) e botão de cópia rápida.
  4. Mock inteligente conectado a `src/api/mock.ts` e fallback elegante para 404 quando o endpoint ainda não estiver presente no backend real.
* **Critério de Pronto:** Transparência de prompts acessível, sem jamais expor transcrições de áudio aos alunos.

### Fase 8: Painel do Professor (`#/professor`)
* **Atividades:**
  1. Formulário de criação de aula (título até 150 caracteres, disciplina até 80 caracteres com contadores em tempo real e validações).
  2. Lista gerencial de aulas com filtros de status e atualização automática a cada 10s.
  3. Upload de áudio com barra de progresso real via `XMLHttpRequest`, validação de extensão e tamanho máximo (25MB).
  4. Upload de fotos sequencial com pré-compressão via `canvas` no navegador (JPEG qualidade 0.85, max 2000px, target < 3MB).
  5. Acompanhamento reativo do status (`PROCESSING` consultando a cada 3s, tratamento de 409, visualização de `failureReason` em caso de `FAILED` e botão de reprocessar).
* **Critério de Pronto:** Ciclo completo docente operante: cadastro, envio de mídias com feedback em tempo real e reprocessamento funcional.

### Fase 9: Mascote ArtFigure e Gestão de Animações
* **Atividades:**
  1. Implementação do componente `Mascote.tsx` com interface estável de props (`estado`, `fala`, `tamanho`, `posicao`).
  2. Mapeamento das poses existentes (`vitruvian`, `scholar`, `scribe`, `david`, `discobolus`, `creation`, `nike`).
  3. Balão de fala contextual com mensagens amigáveis em português (`src/textos/mascote.ts`) e atributo `role="status"`.
  4. Botão persistente para minimizar/ocultar o personagem.
  5. Chave de acessibilidade "Reduzir animações" e detecção automática de modo leve para dispositivos modestos.
* **Critério de Pronto:** Mascote integrado de forma discreta e agradável em todas as rotas, desligável sem quebrar o layout e respeitando preferências de movimento.

### Fase 10: Acabamento, Validação e Entrega
* **Atividades:**
  1. Auditoria de acessibilidade WCAG AA (foco visível, contraste de cores ouro/pergaminho, leitores de tela).
  2. Testes de responsividade em 360px de largura e validação em navegadores móveis.
  3. Verificação de performance sem conexão à internet (zero chamadas a CDNs ou serviços externos).
  4. Execução final de `npm run build`, `npm run typecheck` e `npm run lint`.
  5. Elaboração das instruções completas para incorporação do build estático no Spring Boot (`src/main/resources/static/`).
* **Critério de Pronto:** Todos os critérios de aceitação da seção 14 cumpridos, código 100% verificado e pronto para demonstração.

---

## 5. Riscos e Estratégias de Mitigação

1. **Risco: Falha de cópia para área de transferência em HTTP local.**
   * *Mitigação:* `navigator.clipboard` exige contexto seguro (HTTPS ou localhost). Para acessos via IP de rede local (`http://192.168.x.x:8080`), implementaremos fallback automático para elemento `<textarea readonly>` com seleção automática ao toque e comando `document.execCommand('copy')`.
2. **Risco: Lentidão ao enviar fotos em celulares modestos com rede local fraca.**
   * *Mitigação:* Compressão automática das fotos via HTML5 Canvas no navegador antes do upload, limitando o maior lado a 2000px e comprimindo para JPEG com qualidade 0.85, reduzindo imagens de 10MB para menos de 2MB.
3. **Risco: Conteúdo bruto do modelo de IA conter tags de raciocínio (`<think>`) ou formatação corrompida.**
   * *Mitigação:* O analisador de resumo em `src/lib/resumo.ts` possui filtros com regex estritos para expurgar blocos `<think>...</think>`, normalizar quebras de linha e nunca interpretar HTML direto.
4. **Risco: API retornar slides com layout genérico `content`.**
   * *Mitigação:* Heurística interna no visualizador de slides que inspeciona o conteúdo textual (detecção de termos como "definição", presenças de símbolos matemáticos ou listas curtas) e escolhe dinamicamente o layout mais nobre visualmente.
5. **Risco: Execução de scripts npm bloqueada no PowerShell do Windows.**
   * *Mitigação:* Identificamos que a política de execução bloqueia `npm.ps1`, mas `npm.cmd` executa perfeitamente. Todos os comandos do projeto serão configurados e documentados para uso com `npm.cmd`.
