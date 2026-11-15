/**
 * EmblemaEntrada — arco de porta aberta com luz ao centro, original.
 * Usado na tela "Como você deseja acessar".
 *
 * Movimento padrão dos emblemas:
 *  - o traço se desenha sozinho (.draw-path / .in-view, 2,2 s)
 *  - o anel externo gira devagar (.anim-rotate-slow, 60 s)
 *  - o ponto de luz "respira" (.anim-breathe, 5 s)
 */
interface EmblemaEntradaProps {
  className?: string;
  inView?: boolean;
}

const OURO = 'var(--av-ouro, #c9a227)';

export default function EmblemaEntrada({ className, inView = true }: EmblemaEntradaProps) {
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

      {/* Arco duplo e degraus, desenhados traço a traço */}
      <g className={inView ? 'draw-path in-view' : 'draw-path'}>
        <path d="M35 90 V56 C35 40 46 29 60 29 C74 29 85 40 85 56 V90" />
        <path d="M46 90 V58 C46 48 52 41 60 41 C68 41 74 48 74 58 V90" />
        <path d="M27 90 H93" />
        <path d="M33 97 H87" />
      </g>

      {/* Luz ao centro da porta */}
      <circle
        cx="60"
        cy="68"
        r="3.2"
        fill={OURO}
        stroke="none"
        className="anim-breathe"
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      />
    </svg>
  );
}
