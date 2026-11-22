# Aula Viva — entrega v3 (melhorias do relatório de 21/11/2026)

## O que mudou, por item

1. **Transição sol → gosma (longa e em fases).** O hero agora fica fixado por **1,9 alturas de tela** de rolagem
   (`TELAS_DA_TRANSICAO` em `PaginaInicial.tsx`). Fases (progresso `hero` de 0 a 1, em `CenaNucleo.tsx`):
   0–0,25 o sol deriva para o centro; 0,10–0,55 os planetas espiralam para dentro e encolhem; 0,30–0,78 clarão
   dourado + partículas sugadas; 0,50–0,80 o disco dá lugar à esfera 3D **com o mesmo raio, posição e cor**
   (a malha usa `ESCALA_IGUAL_AO_SOL` até hero 0,72); 0,55–1,00 a distorção sobe de 0 até o valor da gosma.
   Tudo é função do progresso (sem estado acumulado) → reversível ao rolar para cima.
   Ideias comparadas: (a) espiral + clarão, (b) disco que "incha" em esfera, (c) onda de choque em anel.
   Escolhi **a + b** (a (c) criaria um anel, e o pedido proíbe anéis na gosma).
2. **Cor da gosma.** Base `#ffc400` (miolo do `canvasSol`), com no máximo `#ffa90f` na história e no final.
   Removidos o laranja forte (`#ff8a00`), o coral (`#ff4a1c`), a luz rosa e o anel vermelho do ambiente.
3. **Fluidez.** Causas encontradas e corrigidas: (a) rotação da gosma calculada como `tempo * velocidade`, com a
   velocidade mudando com o scroll — o ângulo saltava a cada rolagem (agora integra `delta`); (b) dupla
   suavização (`scrub` + `damp` em cada objeto) → agora há **uma** suavização (`suavizarCena`, exponencial e
   independente de fps, constantes em `SUAVIZACAO`); (c) limite fixo de 30 fps → removido; o desenho é pedido a
   cada tick do `gsap.ticker` (teto de ~75 fps em telas de 120 Hz+); (d) `PerformanceMonitor` do drei baixa o dpr
   e só então passa a 30 fps se o fps medido cair abaixo de ~50; (e) `dispositivoModesto()` só marca celular ou
   ≤ 2 núcleos/≤ 2 GB; (f) `backdrop-filter` removido dos cartões grandes (portas e cartão de login).
   Malha da gosma: 36 → 44 subdivisões; ambiente de reflexos 256 → 512 (≈ +10 MB de GPU).
   **Medir:** abra `http://localhost:5173/?fps#/` — aparece um contador (fps médio, pior quadro, memória de JS).
4. **Menu lateral** (CAPTURA / DESTILAÇÃO / LUZ): oculto abaixo de 1024 px; de 1024 a 1920 px o conteúdo ganha uma
   coluna reservada à direita (`padding-right`), então não há sobreposição.
5. **Contraste** (sobre `#050404`): `--av-texto-suave` 10,1:1 → **12,4:1**; `.hist-passo` 3,6:1 (opacity .55) →
   **12,4:1** (ativo 14,1:1); placeholder dos campos 3,7:1 → **6,5:1**. Rótulos pequenos ganharam sombra curta e os
   blocos da história um véu radial macio (≈ 6:1 mesmo se o texto passar sobre a gosma dourada).
6. **Reflexos:** faixas de luz nítidas (ouro/branco-quente), `roughness` 0,12, `envMapIntensity` 2, material sem
   tone mapping para a cor bater com o sol.
7. **Títulos sobre a brasa:** gradiente claro (`#fff4c2`→`#ffe27a`) com contorno curto escuro e véu radial suave no
   final; nada de sombra grande dentro da máscara `.ini-mascara`.
8. **Planetas:** esmaecem antes de chegar à faixa da barra do topo (78 px).
9. **Login/cadastro:** foco em amarelo com brilho, ícones nos campos, placeholders, autofill escuro, erro ligado ao
   campo (`aria-describedby`); texto da esquerda não é mais cortado (painel cresce; sol encolhe; some em ≤ 520 px).
10. **Aprovação pendente:** tela de "cadastro enviado" com etapas (enviado → aguardando → liberado) no mesmo palco.
11. **Painéis:** admin com avatar dourado e foco visível; professor já usava os tokens e estados de
    vazio/carregando/erro (sem mudanças). Nenhuma regra de negócio, endpoint ou proteção de rota foi tocada.
12. **Rotas por hash:** apenas sugestão (não implementada): migrar para history routing exige fallback de servidor.
13. **Dependências:** nenhuma adicionada (Lenis não foi necessário). `cross-spawn` 7.0.3 continua no lock:
    rode `npm audit fix` na sua máquina (sem rede aqui para atualizar o lock com segurança).

## O que NÃO foi testado (ambiente sem rede nem GPU)
- `npm ci`, `typecheck`, `lint` e `build` **não foram executados** (não havia `node_modules` nem acesso ao npm).
  Fiz só uma checagem parcial do TypeScript (sem erros de sintaxe nos arquivos alterados) e testei por script a
  matemática da suavização (mesmo resultado a 30, 60 e 144 Hz) e da pose.
- Nenhuma captura de tela, nenhum fps medido antes/depois, nenhum teste de cor lado a lado.
- Backend, login real, painéis, celular físico.
