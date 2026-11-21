import { useEffect, useRef } from 'react';
import { dispositivoModesto, prefereMovimentoReduzido, temPonteiroFino } from '../../animacoes/movimento.ts';

/**
 * Céu do Aula Viva para as telas de acesso: estrelas em camadas com paralaxe, poeira estelar,
 * nebulosas lentas, estrelas cadentes e asteroides cruzando a tela. Canvas 2D único, sem imagens.
 * Respeita "movimento reduzido" (um quadro estático), pausa com a aba oculta e usa menos
 * objetos em aparelhos modestos.
 */

interface Estrela {
  x: number;
  y: number;
  z: number; // profundidade 0.2 (longe) – 1 (perto)
  r: number;
  fase: number;
  brilho: number;
  cor: string;
}
interface Poeira {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  fase: number;
}
interface Asteroide {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  rot: number;
  vrot: number;
  z: number;
  forma: number[];
}
interface Cadente {
  x: number;
  y: number;
  vx: number;
  vy: number;
  vida: number;
  total: number;
  comp: number;
}

const CORES_ESTRELA = ['#ffffff', '#fff1d6', '#ffd9a0', '#ffc070', '#cfe0ff'];
const aleatorio = (a: number, b: number) => a + Math.random() * (b - a);

function criarAsteroide(w: number, h: number, espalhar: boolean): Asteroide {
  const z = aleatorio(0.25, 1);
  const r = 5 + z * z * 30;
  const pontos = 9 + Math.floor(Math.random() * 4);
  const velocidade = 10 + z * 46;
  return {
    x: espalhar ? aleatorio(0, w) : -r * 3,
    y: espalhar ? aleatorio(0, h) : aleatorio(-0.1 * h, 0.9 * h),
    vx: velocidade,
    vy: velocidade * aleatorio(0.1, 0.32),
    r,
    rot: aleatorio(0, Math.PI * 2),
    vrot: aleatorio(-0.5, 0.5) * (1.2 - z),
    z,
    forma: Array.from({ length: pontos }, () => aleatorio(0.68, 1.05)),
  };
}

export default function UniversoEstelar() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduzido = prefereMovimentoReduzido();
    const modesto = dispositivoModesto();
    let w = 0;
    let h = 0;
    let dpr = 1;
    let estrelas: Estrela[] = [];
    let poeira: Poeira[] = [];
    let asteroides: Asteroide[] = [];
    const cadentes: Cadente[] = [];
    let proxCadente = aleatorio(1.2, 3);
    let alvoX = 0;
    let alvoY = 0;
    let px = 0;
    let py = 0;
    let raf = 0;
    let ultimo = 0;
    let tempo = 0;

    const montar = () => {
      dpr = Math.min(window.devicePixelRatio || 1, modesto ? 1.25 : 1.5);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const area = w * h;
      const qEstrelas = Math.min(modesto ? 150 : 280, Math.round(area / 5500));
      estrelas = Array.from({ length: qEstrelas }, () => {
        const z = aleatorio(0.2, 1);
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          r: 0.35 + z * 1.15,
          fase: Math.random() * Math.PI * 2,
          brilho: aleatorio(0.4, 1),
          cor: CORES_ESTRELA[Math.floor(Math.random() * CORES_ESTRELA.length)],
        };
      });
      poeira = Array.from({ length: modesto ? 50 : 110 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: aleatorio(-6, 10),
        vy: aleatorio(-5, 5),
        r: aleatorio(0.5, 1.5),
        fase: Math.random() * Math.PI * 2,
      }));
      const qAst = Math.min(modesto ? 4 : 8, Math.max(3, Math.round(area / 150000)));
      asteroides = Array.from({ length: qAst }, () => criarAsteroide(w, h, true));
    };

    const nebulosa = (cx: number, cy: number, raio: number, cor: string) => {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, raio);
      g.addColorStop(0, cor);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(cx - raio, cy - raio, raio * 2, raio * 2);
    };

    const desenharAsteroide = (a: Asteroide) => {
      ctx.save();
      ctx.translate(a.x + px * 26 * a.z, a.y + py * 18 * a.z);
      ctx.rotate(a.rot);
      ctx.beginPath();
      a.forma.forEach((k, i) => {
        const ang = (i / a.forma.length) * Math.PI * 2;
        const x = Math.cos(ang) * a.r * k;
        const y = Math.sin(ang) * a.r * k;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      const g = ctx.createLinearGradient(-a.r, -a.r, a.r, a.r);
      g.addColorStop(0, '#5a4a40');
      g.addColorStop(0.55, '#2a211d');
      g.addColorStop(1, '#0e0a09');
      ctx.fillStyle = g;
      ctx.fill();
      ctx.lineWidth = Math.max(0.8, a.r * 0.07);
      ctx.strokeStyle = `rgba(255, 170, 70, ${0.25 + a.z * 0.4})`; // luz do sol na borda
      ctx.stroke();
      // crateras discretas nos maiores
      if (a.r > 14) {
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.arc(-a.r * 0.25, a.r * 0.1, a.r * 0.17, 0, Math.PI * 2);
        ctx.arc(a.r * 0.3, -a.r * 0.2, a.r * 0.11, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const quadro = (agora: number) => {
      raf = requestAnimationFrame(quadro);
      const dt = Math.min(0.05, (agora - ultimo) / 1000 || 0.016);
      if (modesto && agora - ultimo < 30) return;
      ultimo = agora;
      tempo += dt;
      px += (alvoX - px) * Math.min(1, dt * 2.5);
      py += (alvoY - py) * Math.min(1, dt * 2.5);
      atualizar(dt);
      desenhar();
    };

    const atualizar = (dt: number) => {
      estrelas.forEach((s) => {
        s.x -= dt * 3 * s.z;
        if (s.x < -2) s.x = w + 2;
      });
      poeira.forEach((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < -4) p.x = w + 4;
        if (p.x > w + 4) p.x = -4;
        if (p.y < -4) p.y = h + 4;
        if (p.y > h + 4) p.y = -4;
      });
      asteroides.forEach((a, i) => {
        a.x += a.vx * dt;
        a.y += a.vy * dt;
        a.rot += a.vrot * dt;
        if (a.x - a.r * 3 > w || a.y - a.r * 3 > h) asteroides[i] = criarAsteroide(w, h, false);
      });
      proxCadente -= dt;
      if (proxCadente <= 0 && cadentes.length < 2) {
        const ang = aleatorio(0.45, 0.8);
        const v = aleatorio(650, 1000);
        cadentes.push({
          x: aleatorio(0.3 * w, 1.1 * w),
          y: aleatorio(-0.05 * h, 0.3 * h),
          vx: -Math.cos(ang) * v,
          vy: Math.sin(ang) * v,
          vida: 0,
          total: aleatorio(0.7, 1.2),
          comp: aleatorio(110, 220),
        });
        proxCadente = aleatorio(2.4, 6);
      }
      for (let i = cadentes.length - 1; i >= 0; i--) {
        const c = cadentes[i];
        c.vida += dt;
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        if (c.vida > c.total) cadentes.splice(i, 1);
      }
    };

    const desenhar = () => {
      ctx.clearRect(0, 0, w, h);

      // Nebulosas lentas
      ctx.globalCompositeOperation = 'lighter';
      const o = reduzido ? 0 : tempo;
      nebulosa(w * (0.18 + Math.sin(o * 0.05) * 0.04), h * (0.3 + Math.cos(o * 0.04) * 0.04), Math.max(w, h) * 0.5, 'rgba(255, 120, 10, 0.09)');
      nebulosa(w * (0.85 + Math.cos(o * 0.045) * 0.04), h * (0.85 + Math.sin(o * 0.05) * 0.03), Math.max(w, h) * 0.55, 'rgba(109, 91, 255, 0.1)');
      nebulosa(w * 0.55, h * (0.1 + Math.sin(o * 0.03) * 0.03), Math.max(w, h) * 0.35, 'rgba(255, 60, 30, 0.05)');

      // Poeira estelar
      poeira.forEach((p) => {
        const a = 0.18 + 0.28 * (0.5 + 0.5 * Math.sin(o * 0.9 + p.fase));
        ctx.fillStyle = `rgba(255, 214, 150, ${a})`;
        ctx.fillRect(p.x + px * 12, p.y + py * 8, p.r, p.r);
      });

      // Estrelas em camadas
      estrelas.forEach((s) => {
        const pisca = 0.55 + 0.45 * Math.sin(o * (0.8 + s.z) + s.fase);
        ctx.globalAlpha = s.brilho * (0.45 + 0.55 * pisca);
        ctx.fillStyle = s.cor;
        const x = s.x + px * 22 * s.z;
        const y = s.y + py * 14 * s.z;
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (s.z > 0.88 && s.brilho > 0.8) {
          // estrelas maiores ganham um clarão em cruz
          ctx.globalAlpha *= 0.4;
          ctx.fillRect(x - s.r * 4, y - 0.4, s.r * 8, 0.8);
          ctx.fillRect(x - 0.4, y - s.r * 4, 0.8, s.r * 8);
        }
      });
      ctx.globalAlpha = 1;

      // Estrelas cadentes
      cadentes.forEach((c) => {
        const k = c.vida / c.total;
        const alpha = Math.sin(Math.min(1, k) * Math.PI);
        const norma = Math.hypot(c.vx, c.vy);
        const tx = c.x - (c.vx / norma) * c.comp;
        const ty = c.y - (c.vy / norma) * c.comp;
        const g = ctx.createLinearGradient(c.x, c.y, tx, ty);
        g.addColorStop(0, `rgba(255, 244, 214, ${alpha})`);
        g.addColorStop(0.4, `rgba(255, 170, 60, ${alpha * 0.5})`);
        g.addColorStop(1, 'rgba(255, 90, 20, 0)');
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
      });

      // Asteroides (por cima, em composição normal)
      ctx.globalCompositeOperation = 'source-over';
      [...asteroides].sort((a, b) => a.z - b.z).forEach(desenharAsteroide);
    };

    const aoMover = (e: PointerEvent) => {
      alvoX = (e.clientX / window.innerWidth) * 2 - 1;
      alvoY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const aoMudarAba = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(quadro);
    };
    const aoRedimensionar = () => {
      montar();
      if (reduzido) desenhar();
    };

    montar();
    window.addEventListener('resize', aoRedimensionar);
    if (reduzido) {
      desenhar();
    } else {
      if (temPonteiroFino()) window.addEventListener('pointermove', aoMover);
      document.addEventListener('visibilitychange', aoMudarAba);
      raf = requestAnimationFrame(quadro);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', aoRedimensionar);
      window.removeEventListener('pointermove', aoMover);
      document.removeEventListener('visibilitychange', aoMudarAba);
    };
  }, []);

  return <canvas ref={ref} className="av-universo" aria-hidden="true" />;
}
