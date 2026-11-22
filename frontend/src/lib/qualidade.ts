/**
 * Qualidade adaptativa da cena 3D da página inicial.
 *
 * A cena tem 5 níveis (0 = máximo, 4 = mínimo). O nível sobe e desce em degraus, medindo o tempo real
 * dos quadros desenhados, e NUNCA em valores contínuos: cada troca de pixel ratio realoca o framebuffer
 * (um engasgo), então só acontece quando o desempenho realmente pede.
 *
 * Regras:
 *  - desce 1 nível quando a média de duas janelas seguidas de 0,6 s passa de ~22 ms (menos de ~45 fps),
 *    com 2,5 s de carência depois de cada troca e no carregamento;
 *  - sobe 1 nível depois de 12 s seguidos acima de ~54 fps (e pelo menos 20 s depois da última troca);
 *  - se a queda aconteceu numa fase densa da transição (explosão ou junção), aquele nível vira o "piso":
 *    a cena não volta a subir acima dele, senão o engasgo se repetiria a cada passagem;
 *  - o último nível é sticky (30 fps), como era antes.
 *
 * Em `?q=N` (0 a 4) o nível fica fixo e o controlador é desligado: serve para comparar níveis à mão.
 * O último nível aprendido fica no localStorage (14 dias) para a próxima visita já começar bem.
 */

export interface PerfilQualidade {
  nivel: number;
  /** Fração das partículas do enxame que é desenhada. */
  fracao: number;
  /** Cobertura máxima (camadas de partículas por pixel) nas fases densas: limita o tamanho dos pontos. */
  cobertura: number;
  /** Teto do pixel ratio. */
  dprMax: number;
  /** Malha da gosma com menos triângulos. */
  malhaSimples: boolean;
  /** Desenha a 30 fps. */
  limitar30: boolean;
}

export const PERFIS: ReadonlyArray<PerfilQualidade> = [
  { nivel: 0, fracao: 1, cobertura: 9, dprMax: 2, malhaSimples: false, limitar30: false },
  { nivel: 1, fracao: 0.75, cobertura: 7, dprMax: 1.5, malhaSimples: false, limitar30: false },
  { nivel: 2, fracao: 0.55, cobertura: 5.5, dprMax: 1.25, malhaSimples: false, limitar30: false },
  { nivel: 3, fracao: 0.4, cobertura: 4.5, dprMax: 1, malhaSimples: true, limitar30: false },
  { nivel: 4, fracao: 0.3, cobertura: 4, dprMax: 1, malhaSimples: true, limitar30: true },
];

export const NIVEL_MAXIMO = PERFIS.length - 1;

const JANELA_S = 0.6;
const LIMITE_RUIM_S = 0.0225;
const LIMITE_BOM_S = 0.0185;
const SEGUNDOS_PARA_SUBIR = 12;
const SEGUNDOS_ENTRE_TROCAS = 20;
const CARENCIA_S = 2.5;

/** Fases do hero em que há muitas partículas sobrepostas na tela (explosão e junção). */
export function faseDensa(hero: number): boolean {
  return (hero >= 0.3 && hero < 0.46) || (hero >= 0.8 && hero < 1);
}

export interface EstadoControle {
  acum: number;
  quadros: number;
  ruins: number;
  bom: number;
  desdeTroca: number;
  densa: boolean;
  descidasLeves: number;
  /** Melhor nível (menor número) para o qual ainda é permitido subir. */
  piso: number;
}

export function novoControle(piso: number): EstadoControle {
  return { acum: 0, quadros: 0, ruins: 0, bom: 0, desdeTroca: 0, densa: false, descidasLeves: 0, piso };
}

/**
 * Alimenta o controlador com o tempo de um quadro desenhado (`dt`, em segundos).
 * Devolve o novo nível quando deve trocar, ou null para manter.
 */
export function amostrarQuadro(c: EstadoControle, nivel: number, dt: number, densa: boolean): number | null {
  // Quadro de aba oculta ou congelamento externo: não diz nada sobre a cena.
  if (!(dt > 0) || dt > 0.25) return null;
  c.acum += dt;
  c.quadros += 1;
  c.desdeTroca += dt;
  if (densa) c.densa = true;
  if (c.acum < JANELA_S) return null;

  const media = c.acum / c.quadros;
  const duracao = c.acum;
  const naFaseDensa = c.densa;
  c.acum = 0;
  c.quadros = 0;
  c.densa = false;

  if (nivel >= NIVEL_MAXIMO) return null;

  // Carência: logo depois de uma troca (a realocação do framebuffer gera quadros lentos) e no carregamento
  // a medição ainda não vale, senão o nível despencaria em cascata sem dar tempo de a troca surtir efeito.
  if (c.desdeTroca < CARENCIA_S) {
    c.ruins = 0;
    return null;
  }

  if (media > LIMITE_RUIM_S) {
    c.bom = 0;
    c.ruins += 1;
    if (c.ruins < 2) return null;
    c.ruins = 0;
    c.desdeTroca = 0;
    const novo = nivel + 1;
    if (naFaseDensa) {
      c.piso = Math.max(c.piso, novo);
    } else {
      // Três quedas fora das fases densas também travam a subida (evita ficar oscilando entre níveis).
      c.descidasLeves += 1;
      if (c.descidasLeves >= 3) c.piso = Math.max(c.piso, novo);
    }
    return novo;
  }

  c.ruins = 0;
  if (media < LIMITE_BOM_S && !naFaseDensa) c.bom += duracao;
  else if (media >= LIMITE_BOM_S) c.bom = 0;

  if (nivel > c.piso && c.bom >= SEGUNDOS_PARA_SUBIR && c.desdeTroca >= SEGUNDOS_ENTRE_TROCAS) {
    c.bom = 0;
    c.desdeTroca = 0;
    return nivel - 1;
  }
  return null;
}

/* ---------- Nível inicial: URL, memória do navegador e tipo de GPU ---------- */

export interface InicioQualidade {
  nivel: number;
  piso: number;
  /** Nível forçado pela URL (?q=N): o controlador não mexe. */
  fixo: boolean;
}

const CHAVE = 'av-3d-qualidade';
const VALIDADE_MS = 14 * 24 * 3600 * 1000;

function limitarNivel(n: number): number {
  return Math.min(NIVEL_MAXIMO, Math.max(0, Math.round(n)));
}

function lerSalvo(bruto: string): { n: number; p: number; t: number } | null {
  const dado: unknown = JSON.parse(bruto);
  if (typeof dado !== 'object' || dado === null) return null;
  const { n, p, t } = dado as Record<string, unknown>;
  if (typeof n !== 'number' || typeof p !== 'number' || typeof t !== 'number') return null;
  return { n, p, t };
}

export function lerInicioQualidade(): InicioQualidade {
  const padrao: InicioQualidade = { nivel: 0, piso: 0, fixo: false };
  if (typeof window === 'undefined') return padrao;
  try {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q !== null && q !== '') {
      const n = Number(q);
      if (Number.isInteger(n) && n >= 0 && n <= NIVEL_MAXIMO) return { nivel: n, piso: n, fixo: true };
    }
    const bruto = window.localStorage.getItem(CHAVE);
    if (bruto) {
      const salvo = lerSalvo(bruto);
      if (salvo && Date.now() - salvo.t < VALIDADE_MS) {
        return { nivel: limitarNivel(salvo.n), piso: limitarNivel(salvo.p), fixo: false };
      }
    }
  } catch {
    // Armazenamento bloqueado ou JSON inválido: começa do padrão.
  }
  return padrao;
}

export function salvarQualidade(nivel: number, piso: number): void {
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify({ n: nivel, p: piso, t: Date.now() }));
  } catch {
    // Sem armazenamento: o controlador continua funcionando só nesta visita.
  }
}

/** Nome da GPU, quando o navegador informa (WEBGL_debug_renderer_info). */
export function nomeDaGpu(ctx: WebGLRenderingContext | WebGL2RenderingContext): string {
  try {
    const ext = ctx.getExtension('WEBGL_debug_renderer_info');
    if (!ext) return 'desconhecida';
    return String(ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL));
  } catch {
    return 'desconhecida';
  }
}

/** Nível mínimo de partida conforme o tipo de GPU (a medição em tempo real ajusta depois). */
export function nivelPorGpu(gpu: string): number {
  if (/swiftshader|llvmpipe|software|basic render/i.test(gpu)) return 3;
  if (/intel/i.test(gpu) && /(hd|uhd|iris|graphics)/i.test(gpu) && !/arc/i.test(gpu)) return 1;
  return 0;
}
