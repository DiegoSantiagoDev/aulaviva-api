/**
 * EmblemaCaptura — lente de câmera entre ondas de som, original.
 * Usado na etapa "Captura" de "Da sala de aula à tela".
 *
 * Movimento padrão dos emblemas:
 *  - o traço se desenha sozinho (.draw-path / .in-view, 2,2 s)
 *  - o anel externo gira devagar (.anim-rotate-slow, 60 s)
 *  - o ponto da lente "respira" (.anim-breathe, 5 s)
 */
interface EmblemaCapturaProps {
  className?: string;
  inView?: boolean;
}

const OURO = 'var(--av-ouro)';

export default function EmblemaCaptura({ className, inView = true }: EmblemaCapturaProps) {
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

      {/* Lente e ondas sonoras, desenhadas traço a traço */}
      <g className={inView ? 'draw-path in-view' : 'draw-path'}>
        <circle cx="60" cy="60" r="24" />
        <circle cx="60" cy="60" r="11" />
        <path d="M27 44 A38 38 0 0 0 27 76" />
        <path d="M93 44 A38 38 0 0 1 93 76" />
        <path d="M60 20 V30" />
      </g>

      {/* Ponto de luz */}
      <circle
        cx="60"
        cy="60"
        r="3.2"
        fill={OURO}
        stroke="none"
        className="anim-breathe"
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      />
    </svg>
  );
}
