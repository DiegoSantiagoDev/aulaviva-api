/**
 * O sol do Aula Viva e seus planetas pixelados, desenhados por código (canvas 2D).
 * Um único lugar para a arte: a cena 3D (como texturas de sprite), o fallback sem WebGL
 * e as telas de acesso (canvas 2D) usam exatamente os mesmos desenhos.
 */

export const RAIO_SOL = 1.57;
/** O disco ocupa 62% do raio da textura; o resto é a coroa vermelha. */
export const ESCALA_SPRITE_SOL = (2 * RAIO_SOL) / 0.62;

export type TipoPlaneta = 'gasoso' | 'aneis' | 'terra' | 'marte' | 'lua' | 'ouro';
type RGB = [number, number, number];

export interface DefPlaneta {
  tipo: TipoPlaneta;
  /** Lado da textura em pixels: quanto menor, mais "pixelão". */
  n: number;
  /** Tamanho do sprite em unidades de cena. */
  tamanho: number;
  /** Onde o planeta aparece no instante zero (x, y em unidades, relativo ao centro do sol). */
  alvo: [number, number];
  incl: number;
  rotZ: number;
  /** Velocidade angular da órbita (rad/s). */
  vel: number;
}

// Posições de partida tiradas da composição de referência.
export const PLANETAS: ReadonlyArray<DefPlaneta> = [
  { tipo: 'gasoso', n: 14, tamanho: 0.4, alvo: [-1.63, 0.77], incl: 1.15, rotZ: 0.15, vel: 0.1 },
  { tipo: 'aneis', n: 26, tamanho: 0.52, alvo: [1.45, 0.98], incl: 1.0, rotZ: -0.25, vel: 0.075 },
  { tipo: 'terra', n: 12, tamanho: 0.31, alvo: [1.4, -0.1], incl: 1.25, rotZ: 0.1, vel: 0.13 },
  { tipo: 'marte', n: 10, tamanho: 0.25, alvo: [-1.78, -0.34], incl: 1.1, rotZ: -0.2, vel: 0.12 },
  { tipo: 'lua', n: 8, tamanho: 0.15, alvo: [-1.02, 1.26], incl: 0.95, rotZ: 0.3, vel: 0.19 },
  { tipo: 'ouro', n: 8, tamanho: 0.13, alvo: [1.58, -0.76], incl: 1.2, rotZ: -0.1, vel: 0.22 },
];

export interface Orbita {
  raio: number;
  fase: number;
}

/** Cada órbita é uma elipse inclinada; a fase inicial faz o planeta partir de `alvo`. */
export function calcularOrbita(p: DefPlaneta): Orbita {
  const sen = Math.sin(p.incl);
  const cos = Math.cos(p.rotZ);
  const sin = Math.sin(p.rotZ);
  const lx = p.alvo[0] * cos + p.alvo[1] * sin;
  const ly = (-p.alvo[0] * sin + p.alvo[1] * cos) / sen;
  return { raio: Math.hypot(lx, ly), fase: Math.atan2(ly, lx) };
}

/** Posição (relativa ao sol) de um planeta em um ângulo orbital. */
export function posicaoNaOrbita(p: DefPlaneta, o: Orbita, angulo: number): [number, number, number] {
  const lx = o.raio * Math.cos(angulo);
  const ly = o.raio * Math.sin(angulo) * Math.sin(p.incl);
  const lz = o.raio * Math.sin(angulo) * Math.cos(p.incl);
  const cos = Math.cos(p.rotZ);
  const sin = Math.sin(p.rotZ);
  return [lx * cos - ly * sin, lx * sin + ly * cos, lz];
}

function limitar(v: number, a = 0, b = 255) {
  return v < a ? a : v > b ? b : v;
}

export function canvasSol(): HTMLCanvasElement {
  const T = 512;
  const c = document.createElement('canvas');
  c.width = c.height = T;
  const ctx = c.getContext('2d')!;
  const m = T / 2;
  const g = ctx.createRadialGradient(m, m, 0, m, m, m);
  g.addColorStop(0, 'rgba(255,138,10,1)');
  g.addColorStop(0.3, 'rgba(255,160,10,1)');
  g.addColorStop(0.5, 'rgba(255,196,0,1)');
  g.addColorStop(0.6, 'rgba(255,216,12,1)');
  g.addColorStop(0.615, 'rgba(255,205,10,1)');
  g.addColorStop(0.63, 'rgba(255,96,10,0.95)'); // borda do disco → coroa
  g.addColorStop(0.7, 'rgba(255,64,0,0.5)');
  g.addColorStop(0.85, 'rgba(255,40,0,0.14)');
  g.addColorStop(1, 'rgba(255,30,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, T, T);

  // Manchas suaves na superfície (determinísticas, para não variar entre cargas).
  ctx.save();
  ctx.beginPath();
  ctx.arc(m, m, m * 0.6, 0, Math.PI * 2);
  ctx.clip();
  let semente = 7;
  const aleatorio = () => (semente = (semente * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 34; i++) {
    const x = m + (aleatorio() - 0.5) * m * 1.2;
    const y = m + (aleatorio() - 0.5) * m * 1.2;
    const r = 26 + aleatorio() * 60;
    const quente = aleatorio() > 0.45;
    const b = ctx.createRadialGradient(x, y, 0, x, y, r);
    b.addColorStop(0, quente ? 'rgba(255,110,0,0.22)' : 'rgba(255,236,70,0.2)');
    b.addColorStop(1, 'rgba(255,150,0,0)');
    ctx.fillStyle = b;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.restore();
  return c;
}

const GASOSO: RGB[] = [
  [255, 150, 50],
  [255, 205, 130],
  [224, 96, 30],
  [255, 225, 170],
  [200, 70, 20],
  [255, 180, 90],
];

export function canvasPlaneta(tipo: TipoPlaneta, n: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = n;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(n, n);
  const cx = n / 2;
  const cy = n / 2;
  const raio = tipo === 'aneis' ? n * 0.27 : n / 2 - 0.3;
  const norma = Math.hypot(-0.55, 0.6, 0.58);
  const luz = { x: -0.55 / norma, y: 0.6 / norma, z: 0.58 / norma };
  const ruido = (x: number, y: number) => {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const dx = (x + 0.5 - cx) / raio;
      const dy = (y + 0.5 - cy) / raio;
      const d2 = dx * dx + dy * dy;
      let cor: RGB | null = null;

      if (d2 <= 1) {
        const nz = Math.sqrt(1 - d2);
        const lum = dx * luz.x + -dy * luz.y + nz * luz.z;
        const sombra = Math.round(limitar(0.35 + 0.75 * lum, 0.3, 1.05) * 4) / 4;
        let base: RGB;
        switch (tipo) {
          case 'gasoso': {
            const i = Math.floor((dy * 0.5 + 0.5) * 6 + Math.sin(dx * 2.5) * 0.6);
            base = GASOSO[((i % 6) + 6) % 6];
            break;
          }
          case 'terra': {
            const terra = ruido(Math.floor(x / 2), Math.floor(y / 2)) > 0.56;
            base = ruido(x + 7, y + 3) > 0.84 ? [245, 245, 255] : terra ? [60, 165, 72] : [38, 108, 222];
            break;
          }
          case 'marte':
            base = ruido(x, y) > 0.72 ? [140, 38, 18] : [214, 70, 34];
            break;
          case 'lua':
            base = ruido(x, y) > 0.78 ? [95, 70, 55] : [150, 118, 92];
            break;
          case 'aneis':
            base = Math.floor((dy * 0.5 + 0.5) * 5) % 2 === 0 ? [232, 160, 80] : [244, 196, 120];
            break;
          default:
            base = [255, 196, 80];
        }
        cor = [limitar(base[0] * sombra), limitar(base[1] * sombra), limitar(base[2] * sombra)];
      }

      if (tipo === 'aneis') {
        const ang = 0.35;
        const px = x + 0.5 - cx;
        const py = y + 0.5 - cy;
        const rx = px * Math.cos(ang) + py * Math.sin(ang);
        const ry = -px * Math.sin(ang) + py * Math.cos(ang);
        const e = (rx / (n * 0.47)) ** 2 + (ry / (n * 0.12)) ** 2;
        if (e <= 1 && e >= 0.4) {
          // a metade de baixo do anel passa na frente do planeta; a de cima, atrás
          if (ry > 0 || !cor) cor = ry > 0 ? [246, 210, 150] : [200, 160, 110];
        }
      }

      if (cor) {
        const i = (y * n + x) * 4;
        img.data[i] = cor[0];
        img.data[i + 1] = cor[1];
        img.data[i + 2] = cor[2];
        img.data[i + 3] = 255;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}
