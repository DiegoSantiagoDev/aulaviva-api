/**
 * EmblemaIndisponivel — livro fechado com marcador, original. Usado
 * na tela "Esta aula ainda não está disponível".
 *
 * Movimento padrão dos emblemas:
 *  - o traço se desenha sozinho (.draw-path / .in-view, 2,2 s)
 *  - o anel externo gira devagar (.anim-rotate-slow, 60 s)
 *  - o ponto sobre a capa "respira" (.anim-breathe, 5 s)
 */
interface EmblemaIndisponivelProps {
  className?: string;
  inView?: boolean;
}

const OURO = 'var(--av-ouro, #c9a227)';

export default function EmblemaIndisponivel({ className, inView = true }: EmblemaIndisponivelProps) {
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

      {/* Livro fechado e marcador, desenhados traço a traço */}
      <g className={inView ? 'draw-path in-view' : 'draw-path'}>
        <path d="M38 27 H82 V93 H45 C41 93 38 90 38 86 Z" />
        <path d="M48 27 V93" />
        <path d="M60 40 H72" />
        <path d="M60 48 H68" />
        <path d="M74 27 V44 L78 40 L82 44 V27" />
      </g>

      {/* Ponto sobre a capa */}
      <circle
        cx="66"
        cy="72"
        r="3.2"
        fill={OURO}
        stroke="none"
        className="anim-breathe"
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      />
    </svg>
  );
}
