/**
 * EmblemaPortal — arco de entrada com degrau, original.
 * Usado no convite final ("Pronto para ver as aulas
 * ganharem vida?").
 *
 * Movimento padrão dos emblemas:
 *  - o traço se desenha sozinho (.draw-path / .in-view, 2,2 s)
 *  - o anel externo gira devagar (.anim-rotate-slow, 60 s)
 *  - o ponto de luz "respira" (.anim-breathe, 5 s)
 */
interface EmblemaPortalProps {
  className?: string;
  inView?: boolean;
}

const OURO = 'var(--av-ouro)';

export default function EmblemaPortal({ className, inView = true }: EmblemaPortalProps) {
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

      {/* Arco, vão interno e degraus, desenhados traço a traço */}
      <g className={inView ? 'draw-path in-view' : 'draw-path'}>
        <path d="M34 92 V54 C34 38 46 28 60 28 C74 28 86 38 86 54 V92" />
        <path d="M46 92 V58 C46 49 52 43 60 43 C68 43 74 49 74 58 V92" />
        <path d="M28 92 H92 M36 99 H84" />
      </g>

      {/* Ponto de luz no vão */}
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
