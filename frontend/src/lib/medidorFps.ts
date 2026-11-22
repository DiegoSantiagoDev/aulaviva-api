/**
 * Placar de desempenho para conferir a fluidez em qualquer máquina (antes/depois de mexer nas animações).
 * Só liga quando a URL tem `?fps` (ex.: http://localhost:5173/?fps=1). Desligado, não custa nada: nenhum
 * laço, nenhum listener e a cena nem chama `registrarFrameCena`.
 *
 * Mostra no canto da tela, a cada meio segundo:
 *  - fps médio e pior quadro (ms) da página, e a memória de JS (Chrome);
 *  - o progresso do hero (h), o nível de qualidade, o pixel ratio e o tamanho do canvas;
 *  - o nome da GPU e renderer.info.render (chamadas, pontos, triângulos);
 *  - o tempo de quadro da CENA 3D por fase do hero: média, p95 e máximo (últimos 300 quadros de cada fase).
 *
 * Teclas: `c` copia o resumo para a área de transferência (para enviar a medição); `r` zera as fases.
 * Também escreve o resumo de fps no console. Retorna a função que desliga o placar.
 */

export const placarAtivo: boolean =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('fps');

/** Dados que a cena escreve a cada quadro (só quando o placar está ligado). */
export interface DadosCena {
  gpu: string;
  dpr: number;
  largura: number;
  altura: number;
  chamadas: number;
  pontos: number;
  triangulos: number;
  nivel: number;
}

export const dadosCena: DadosCena = {
  gpu: '—',
  dpr: 0,
  largura: 0,
  altura: 0,
  chamadas: 0,
  pontos: 0,
  triangulos: 0,
  nivel: 0,
};

interface Faixa {
  nome: string;
  ate: number;
}

/** Fases do hero (h de 0 a 1). (a) e (b) são os dois momentos que travavam. */
const FAIXAS: ReadonlyArray<Faixa> = [
  { nome: 'carga      0,00–0,30', ate: 0.3 },
  { nome: '(a) explos 0,30–0,40', ate: 0.4 },
  { nome: 'voo        0,40–0,70', ate: 0.7 },
  { nome: 'junção     0,70–0,85', ate: 0.85 },
  { nome: '(b) final  0,85–1,00', ate: 0.9995 },
  { nome: 'história   h = 1', ate: Infinity },
];

const TAMANHO_ANEL = 300;

interface Acumulo {
  tempos: Float32Array;
  n: number;
  i: number;
  max: number;
}

const acumulos: Acumulo[] = FAIXAS.map(() => ({ tempos: new Float32Array(TAMANHO_ANEL), n: 0, i: 0, max: 0 }));

/** Registra o tempo (ms) de um quadro da cena na fase do hero em que ele caiu. */
export function registrarFrameCena(ms: number, hero: number): void {
  if (!placarAtivo || !(ms > 0) || ms > 500) return;
  let k = FAIXAS.length - 1;
  for (let j = 0; j < FAIXAS.length; j++) {
    if (hero < FAIXAS[j].ate) {
      k = j;
      break;
    }
  }
  const a = acumulos[k];
  a.tempos[a.i] = ms;
  a.i = (a.i + 1) % TAMANHO_ANEL;
  if (a.n < TAMANHO_ANEL) a.n += 1;
  if (ms > a.max) a.max = ms;
}

function zerarFases(): void {
  for (const a of acumulos) {
    a.n = 0;
    a.i = 0;
    a.max = 0;
  }
}

function linhaDaFase(nome: string, a: Acumulo): string {
  if (a.n === 0) return `${nome}   —`;
  const ordenados = a.tempos.slice(0, a.n).sort();
  let soma = 0;
  for (let j = 0; j < ordenados.length; j++) soma += ordenados[j];
  const media = soma / a.n;
  const p95 = ordenados[Math.min(a.n - 1, Math.floor(0.95 * (a.n - 1)))];
  return `${nome}  n=${String(a.n).padStart(3)}  méd ${media.toFixed(1)}  p95 ${p95.toFixed(1)}  máx ${a.max.toFixed(1)} ms`;
}

export function iniciarMedidorFps(lerHero?: () => number): () => void {
  if (!placarAtivo) return () => undefined;

  const caixa = document.createElement('div');
  caixa.setAttribute('aria-hidden', 'true');
  caixa.style.cssText =
    'position:fixed;left:8px;bottom:8px;z-index:9999;padding:6px 9px;border-radius:6px;pointer-events:none;' +
    'font:11px/1.35 ui-monospace,Menlo,Consolas,monospace;color:#fff;background:rgba(0,0,0,.78);white-space:pre;max-width:96vw';
  document.body.appendChild(caixa);

  let raf = 0;
  let ultimo = performance.now();
  let inicioJanela = ultimo;
  let quadros = 0;
  let pior = 0;
  let texto = '';
  let ultimoLog = ultimo;

  const montar = (fps: number, piorMs: number): string => {
    const memoria = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
    const mb = memoria ? ` · JS ${(memoria.usedJSHeapSize / 1048576).toFixed(0)} MB` : '';
    const h = lerHero ? lerHero() : 0;
    const d = dadosCena;
    const linhas = [
      `${fps.toFixed(0)} fps · pior ${piorMs.toFixed(0)} ms${mb}`,
      `h ${h.toFixed(3)} · nível ${d.nivel} · dpr ${d.dpr.toFixed(2)} · canvas ${d.largura}×${d.altura}`,
      `GPU ${d.gpu}`,
      `chamadas ${d.chamadas} · pontos ${d.pontos} · triângulos ${d.triangulos}`,
      'tempo de quadro da cena por fase do hero:',
      ...FAIXAS.map((f, j) => linhaDaFase(f.nome, acumulos[j])),
      '[c] copiar resumo   [r] zerar fases',
    ];
    return linhas.join('\n');
  };

  const laco = (agora: number) => {
    raf = requestAnimationFrame(laco);
    pior = Math.max(pior, agora - ultimo);
    ultimo = agora;
    quadros += 1;
    if (agora - inicioJanela < 500) return;
    const fps = (quadros * 1000) / (agora - inicioJanela);
    texto = montar(fps, pior);
    caixa.textContent = texto;
    if (agora - ultimoLog >= 1000) {
      ultimoLog = agora;
      console.info(`[fps] ${fps.toFixed(0)} fps · pior ${pior.toFixed(0)} ms`);
    }
    inicioJanela = agora;
    quadros = 0;
    pior = 0;
  };
  raf = requestAnimationFrame(laco);

  const aoTecla = (ev: KeyboardEvent) => {
    const alvo = ev.target;
    if (alvo instanceof HTMLElement && (alvo.isContentEditable || /^(input|textarea|select)$/i.test(alvo.tagName))) return;
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
    if (ev.key === 'r') zerarFases();
    if (ev.key === 'c' && texto) {
      navigator.clipboard?.writeText(texto).catch(() => undefined);
    }
  };
  window.addEventListener('keydown', aoTecla);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('keydown', aoTecla);
    caixa.remove();
  };
}
