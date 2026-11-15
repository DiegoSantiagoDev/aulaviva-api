/**
 * EmblemaProfessor — quadro de aula com linhas de giz, original.
 * Usado no painel do professor.
 *
 * Movimento padrão dos emblemas:
 *  - o traço se desenha sozinho (.draw-path / .in-view, 2,2 s)
 *  - o anel externo gira devagar (.anim-rotate-slow, 60 s)
 *  - o ponto de giz "respira" (.anim-breathe, 5 s)
 */
interface EmblemaProfessorProps {
  className?: string;
  inView?: boolean;
}

const OURO = 'var(--av-ouro, #c9a227)';

export default function EmblemaProfessor({ className, inView = true }: EmblemaProfessorProps) {
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

      {/* Quadro, pés e linhas de giz, desenhados traço a traço */}
      <g className={inView ? 'draw-path in-view' : 'draw-path'}>
        <rect x="26" y="30" width="68" height="46" rx="4" />
        <path d="M42 76 L35 94 M78 76 L85 94 M60 76 V94" />
        <path d="M36 43 H60 M36 53 H72 M36 63 H52" />
      </g>

      {/* Ponto de giz */}
      <circle
        cx="80"
        cy="43"
        r="3.2"
        fill={OURO}
        stroke="none"
        className="anim-breathe"
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      />
    </svg>
  );
}
