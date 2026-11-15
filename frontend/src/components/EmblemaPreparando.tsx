/**
 * EmblemaPreparando — ampulheta original usada
 * na tela "Esta aula ainda está sendo preparada".
 *
 * Movimento padrão dos emblemas:
 *  - o traço se desenha sozinho (.draw-path / .in-view, 2,2 s)
 *  - o anel externo gira devagar (.anim-rotate-slow, 60 s)
 *  - o ponto no centro "respira" (.anim-breathe, 5 s)
 */
interface EmblemaPreparandoProps {
  className?: string;
  inView?: boolean;
}

const OURO = 'var(--av-ouro, #c9a227)';

export default function EmblemaPreparando({ className, inView = true }: EmblemaPreparandoProps) {
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

      {/* Ampulheta desenhada traço a traço */}
      <g className={inView ? 'draw-path in-view' : 'draw-path'}>
        <path d="M38 24 H82" />
        <path d="M38 96 H82" />
        <path d="M44 24 C44 44 60 52 60 60 C60 68 44 76 44 96" />
        <path d="M76 24 C76 44 60 52 60 60 C60 68 76 76 76 96" />
        <path d="M50 88 H70" />
      </g>

      {/* Ponto no estreito da ampulheta */}
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
