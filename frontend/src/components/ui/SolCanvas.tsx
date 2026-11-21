import { useEffect, useRef } from 'react';
import { prefereMovimentoReduzido } from '../../animacoes/movimento.ts';
import { ESCALA_SPRITE_SOL, PLANETAS, calcularOrbita, canvasPlaneta, canvasSol, posicaoNaOrbita } from '../../lib/solPixel.ts';

/**
 * O sol do Aula Viva com os planetas pixelados em órbita, em canvas 2D.
 * Usado quando não há WebGL (ou o movimento está reduzido) e nas telas de acesso.
 * Os desenhos são os mesmos da cena 3D (lib/solPixel). Quadro único se o movimento estiver reduzido.
 */
export default function SolCanvas({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const sol = canvasSol();
    const planetas = PLANETAS.map((p) => canvasPlaneta(p.tipo, p.n));
    const orbitas = PLANETAS.map(calcularOrbita);
    const reduzido = prefereMovimentoReduzido();
    let lado = 0;
    let raf = 0;
    let t0 = performance.now();

    const medir = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      lado = Math.max(1, Math.round(canvas.clientWidth * dpr));
      canvas.width = lado;
      canvas.height = lado;
    };

    const desenhar = (t: number) => {
      ctx.clearRect(0, 0, lado, lado);
      const u = lado / 5.2; // pixels por unidade de cena: o sprite do sol (5,06 un.) cabe inteiro, sem corte na coroa
      const c = lado / 2;
      const proj = (x: number, y: number, z: number) => {
        const k = 7 / (7 - z);
        return { x: c + x * k * u, y: c - y * k * u, k };
      };

      // Trilhas das órbitas, bem discretas.
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 190, 90, 0.13)';
      ctx.lineWidth = Math.max(1, lado / 520);
      PLANETAS.forEach((p, i) => {
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2 + 0.05; a += 0.12) {
          const [x, y, z] = posicaoNaOrbita(p, orbitas[i], a);
          const q = proj(x, y, z);
          if (a === 0) ctx.moveTo(q.x, q.y);
          else ctx.lineTo(q.x, q.y);
        }
        ctx.stroke();
      });
      ctx.restore();

      const itens = PLANETAS.map((p, i) => {
        const [x, y, z] = posicaoNaOrbita(p, orbitas[i], orbitas[i].fase + t * p.vel);
        return { i, ...proj(x, y, z), z };
      }).sort((a, b) => a.z - b.z);

      const planeta = (it: (typeof itens)[number]) => {
        const s = PLANETAS[it.i].tamanho * u * it.k;
        ctx.drawImage(planetas[it.i], it.x - s / 2, it.y - s / 2, s, s);
      };

      ctx.imageSmoothingEnabled = false;
      itens.filter((it) => it.z < 0).forEach(planeta);

      ctx.imageSmoothingEnabled = true;
      const S = ESCALA_SPRITE_SOL * u * (1 + Math.sin(t * 0.8) * 0.012);
      ctx.save();
      ctx.translate(c, c);
      ctx.rotate(t * 0.02);
      ctx.drawImage(sol, -S / 2, -S / 2, S, S);
      ctx.restore();

      ctx.imageSmoothingEnabled = false;
      itens.filter((it) => it.z >= 0).forEach(planeta);
    };

    const quadro = (agora: number) => {
      desenhar((agora - t0) / 1000);
      raf = requestAnimationFrame(quadro);
    };
    const aoMudarAba = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduzido) {
        t0 = performance.now() - 0; // retoma sem salto grande
        raf = requestAnimationFrame(quadro);
      }
    };

    medir();
    const observador = new ResizeObserver(() => {
      medir();
      if (reduzido) desenhar(0);
    });
    observador.observe(canvas);

    if (reduzido) desenhar(0);
    else {
      raf = requestAnimationFrame(quadro);
      document.addEventListener('visibilitychange', aoMudarAba);
    }

    return () => {
      cancelAnimationFrame(raf);
      observador.disconnect();
      document.removeEventListener('visibilitychange', aoMudarAba);
    };
  }, []);

  return <canvas ref={ref} className={`av-sol-canvas ${className}`} aria-hidden="true" />;
}
