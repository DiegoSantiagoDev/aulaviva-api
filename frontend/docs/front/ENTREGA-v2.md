# Aula Viva — reconstrução do frontend (v2)

## Como rodar

```bash
npm install          # use install (não ci) se o lock for regenerado na sua máquina
npm run dev          # http://localhost:5173 — o proxy do Vite aponta /api para http://localhost:8080
npm run typecheck && npm run lint && npm run build
```

Para entrar como administrador use as credenciais configuradas no backend (`AdminSeeder`: `ADMIN_EMAIL` / `ADMIN_PASSWORD`).

## Identidade "Lume"

Conceito: o conhecimento é uma brasa que se acende no escuro. Paleta em `src/styles/tokens.css` (vazio quase preto,
brasa âmbar da "hora dourada", coral do objeto orgânico, violeta do espaço). Tipografia: Manrope 800 em caixa alta
para aberturas monumentais, Cormorant Garamond para títulos editoriais, monoespaçada do sistema nos rótulos técnicos.
Os slides mantêm fundo de papel claro (como uma tela projetada), isolado por `.av-tema-papel` em `tokens.css`.

## Animação e 3D

- `src/animacoes/`: registro único dos plugins (`motor.ts`), linguagem de movimento (`movimento.ts`: 3 durações e 4 curvas),
  transição entre telas, inclinação de cartões, botão magnético, `useMovimentoReduzido`.
- `src/home/`: página inicial. Cena R3F (`CenaNucleo`): núcleo metálico distorcido (`MeshDistortMaterial`) com
  reflexos de `Lightformer`, três anéis orbitais com satélites, painéis de vidro (os "slides") e ~1100 partículas.
  O scroll escreve em `estadoCena` (hero → história fixada → portas/recursos → final) e o loop de render lê e suaviza,
  movendo câmera, escala, cor e luz sem re-renderizar o React.
- História fixada (`pin` + `scrub`): três cenas, numerais gigantes em panorâmica, trilho de progresso.
- Carregamento sob demanda: Three/R3F/Drei só são baixados pela página inicial (`lazy` + `manualChunks`).
- Degradação: sem WebGL, com `prefers-reduced-motion`, no "modo leve" ou se o contexto WebGL for perdido, entra o
  `NucleoCSS`, que segue a mesma jornada de scroll (ou fica estático em movimento reduzido). Aparelhos modestos usam
  malha, partículas e resolução menores. O desenho pausa com a aba oculta.

## Verificações executadas na entrega

| Verificação | Resultado |
|---|---|
| `tsc --noEmit -p tsconfig.app.json` com as bibliotecas reais (GSAP 3.15.1, Three 0.170.0, R3F 8.18.0, Drei 9.122.0) | 0 erros |
| `eslint .` | 0 erros, 1 aviso preexistente (`react-refresh` em `ListaAulasProfessor.tsx`) |
| Sintaxe de todos os `.css` (PostCSS) e processamento do Tailwind | sem erros |
| `npm run build` | **não executado** neste ambiente (ver abaixo) |
| Teste visual, de animação, de WebGL e de fluxo com o backend no ar | **não executados** (sem navegador nem backend neste ambiente) |

O ambiente de geração é Linux sem acesso à internet; o `node_modules` enviado veio do Windows (`esbuild` e `rollup`
só com binários `win32`), então o Vite não executa lá. Isso é uma limitação do ambiente, não do projeto.

## Correções da v2.1 (relatadas ao rodar no Windows)

- `src/animacoes/gsap.ts` foi renomeado para `motor.ts` e passou a usar `import { gsap } from 'gsap'` (export nomeado
  documentado). Um módulo local com o mesmo nome do pacote deixa a resolução de `'gsap'` ambígua; as tipagens de
  `PaginaInicial.tsx` que acusavam `any` implícito eram consequência dessa importação quebrada.
- Callbacks do GSAP/ScrollTrigger em `PaginaInicial.tsx` e `BibliotecaAulas.tsx` agora têm tipos explícitos
  (`ScrollTrigger`, `Element[]`, `HTMLElement`).
- `vite.config.ts` ganhou `resolve.alias` `@ → /src`, igual ao `paths` do `tsconfig.app.json` (antes só o TypeScript
  conhecia o alias `@/`, e o Rollup não).

## Roteiro de testes manuais sugerido

1. Visitante: home (3D e rolagem), biblioteca, detalhe, slides; só aulas `DONE` aparecem.
2. Cadastro de professor → login recusado com 403 → admin aprova em `/admin` → login do professor.
3. Professor: criar aula, enviar áudio (progresso), acompanhar status, enviar 3 fotos (a 4ª é recusada), excluir foto,
   excluir aula; durante `PROCESSING` envio/exclusão ficam bloqueados.
4. Sessão: esperar o token expirar (ou remover `aulaviva.sessao.v1` do `sessionStorage` e forçar um 401) e conferir o
   redirecionamento para o login com a mensagem de sessão expirada.
5. Acesso: abrir `/#/admin` logado como professor (tela de acesso negado) e `/#/professor` sem login (vai ao login).
6. Movimento reduzido (sistema) e aparelho modesto: a home deve continuar legível e funcional.

## Mudanças que removem comportamento anterior

- Modo de exemplo `?mock=1` e `src/api/mock.ts` (dados fictícios).
- Escolha de perfil "Sou aluno / Sou professor" guardada em `localStorage` (substituída por login real).
- Botão "Como foi gerado" (sem endpoint no backend) e o filtro `hidden` (campo inexistente).
- Antiga página institucional (`components/Hero`, `Nav`, `Footer` etc.), substituída por `src/home/`.

## Pendências e limitações

- Backend: veja `INTEGRACAO-BACKEND.md` ("Sem suporte no backend").
- A cena 2 e 3 da história ficam invisíveis até o scroll chegar nelas (o mesmo conteúdo reaparece em "Tudo o que a
  gravação pode virar"); em movimento reduzido todas aparecem empilhadas.
- Armazenamento do JWT em `sessionStorage` é legível por JavaScript (risco de XSS); o app não injeta HTML.
- `npm audit` relatou 16 vulnerabilidades na instalação local; nenhuma correção forçada foi aplicada.
- Nenhuma dependência nova foi adicionada nesta fase: `package.json` e `package-lock.json` são os da sua instalação.
