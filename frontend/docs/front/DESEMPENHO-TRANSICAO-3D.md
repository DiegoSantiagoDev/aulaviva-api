# Desempenho da transição 3D (sol → partículas → gosma)

Esta nota registra o que foi mudado para eliminar os travamentos em h≈0,32–0,40 (começo da explosão) e h≈0,85–1,0 (junção), e como medir.

## Causas (por leitura do código; medir no PC real para confirmar)

1. **Primeira utilização (H1).** A gosma (`MeshDistortMaterial` = material físico com clearcoat, 3 luzes e env map), o enxame, o clarão e o anel ficam invisíveis até o ponto da rolagem em que entram. O three não compila nem envia à GPU o que está invisível, então o primeiro frame em que aparecem pagava de uma vez: compilação dos shaders, conversão PMREM do Environment e upload de geometria e texturas.
2. **Fill-rate (H2).** Na junção, ~9.500 pontos de até 34 px se empilhavam numa esfera: ~33 camadas de blend por pixel, quando 4 a 5 já bastam. Somados ao clarão (quase tela cheia), ao pixel ratio de até 2 e ao MSAA.
3. **Outro (H4).** O `PerformanceMonitor` trocava o pixel ratio de forma contínua; cada troca realoca o framebuffer (um engasgo novo, justamente quando o fps cai).
4. **Trabalho por tick (H3).** `gsap.set` com seletor de texto a cada evento de scroll, mesmo depois de o texto do hero já ter saído.

## O que mudou

- `src/home/CenaNucleo.tsx`
  - `Aquecimento`: depois do carregamento roda `compileAsync` (shaders em paralelo) e um render com tudo visível, no mesmo quadro em que o render normal reescreve a tela. Nada aparece diferente.
  - Shader do enxame: teto de tamanho por densidade (`uCob`, camadas por pixel) com reforço de opacidade; onde as partículas estão espalhadas o teto não age. `setDrawRange` dinâmico conforme o nível de qualidade.
  - MSAA desligado quando o pixel ratio do aparelho é ≥ 1,5 (o serrilhado não aparece e o MSAA multiplicava a banda do blend).
  - `PerformanceMonitor` trocado por níveis de qualidade em degraus (ver abaixo).
  - Gosma: `speed` do ruído 1,7 → 0,65; rotação ~2,2× mais lenta; respiração com períodos de 10 a 20 s; a forma (escala e distorção) segue os alvos com inércia de ~1,4 s; a agitação do scroll sobe em ~1 s e volta ao repouso em ~2 s, não conta saltos de scroll e usa `delta` limitado. Cor, brilho, reflexos e tamanho não mudaram.
- `src/lib/qualidade.ts` (novo): 5 níveis (dpr, quantidade de partículas, cobertura, malha, 30 fps) e o controlador.
- `src/lib/medidorFps.ts`: placar `?fps=1` ampliado.
- `src/home/PaginaInicial.tsx`: elementos do hero resolvidos uma vez; escrita no DOM só quando o valor muda.

## Qualidade adaptativa

- Desce 1 nível se a média de duas janelas de 0,6 s passar de ~22 ms; sobe 1 nível depois de 12 s acima de ~54 fps. Há 2,5 s de carência depois de cada troca e no carregamento.
- Se a queda ocorre numa fase densa (explosão ou junção), aquele nível vira o piso e a cena não sobe acima dele.
- O último nível fica no `localStorage` (14 dias). Em GPU Intel integrada a partida é o nível 1; em renderizador por software, o nível 3.
- `?q=N` (0 a 4) fixa o nível e desliga o controlador: serve para comparar. Para limpar o que foi aprendido: `localStorage.removeItem('av-3d-qualidade')` no console.

## Como medir

Abrir `http://localhost:5173/?fps=1`, rolar pela transição e ler o placar (canto inferior esquerdo): fps, pior quadro, GPU, pixel ratio, canvas, chamadas/pontos/triângulos e média, p95 e máximo por fase do hero. Teclas: `c` copia o resumo, `r` zera as fases. Para comparar níveis: `?fps=1&q=0`, `&q=2`, `&q=4`.
