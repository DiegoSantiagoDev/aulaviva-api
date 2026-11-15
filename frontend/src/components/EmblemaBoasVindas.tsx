/**
 * EmblemaBoasVindas — livro aberto sob um sol de raios finos, original.
 * Usado no topo da apresentação (Hero) e no cabeçalho da biblioteca de aulas.
 *
 * Movimento padrão dos emblemas:
 *  - o traço se desenha sozinho (.draw-path / .in-view, 2,2 s)
 *  - o anel externo gira devagar (.anim-rotate-slow, 60 s)
 *  - o ponto do sol "respira" (.anim-breathe, 5 s)
 */
interface EmblemaBoasVindasProps {
  className?: string;
  inView?: boolean;
}

const OURO = 'var(--av-ouro)';

export default function EmblemaBoasVindas({ className, inView = true }: EmblemaBoasVindasProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* Anel externo tracejado, gira em torno do próprio centro */}
      <circle
        cx="60"
        cy="60"
        r="54"
        stroke={OURO}
        strokeWidth={0.8}
        strokeDasharray="2 5"
        opacity={inView ? 0.7 : 0}
        className="anim-rotate-slow"
        style={{
          transformBox: 'fill-box',
          transformOrigin: 'center',
          transition: 'opacity 1.5s ease 1s',
        }}
      />

      {/* Livro aberto e raios, desenhados traço a traço */}
      <g className={inView ? 'draw-path in-view' : 'draw-path'}>
        <path d="M24 80 C39 72 52 72 60 78 C68 72 81 72 96 80 V96 C81 88 68 88 60 94 C52 88 39 88 24 96 Z" />
        <path d="M60 78 V94" />
        <path d="M40 62 A20 20 0 0 1 80 62" />
        <path d="M60 18 V27 M34 28 L40 35 M86 28 L80 35 M22 46 L31 49 M98 46 L89 49" />
      </g>

      {/* Ponto de luz */}
      <circle
        cx="60"
        cy="50"
        r="3.2"
        fill={OURO}
        stroke="none"
        className="anim-breathe"
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      />
    </svg>
  );
}
