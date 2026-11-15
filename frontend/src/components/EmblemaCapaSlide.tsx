/**
 * EmblemaCapaSlide — livro aberto sob um ponto de luz, original. Usado na
 * capa dos slides.
 *
 * Movimento padrão dos emblemas:
 *  - o traço se desenha sozinho (.draw-path / .in-view, 2,2 s)
 *  - o anel externo gira devagar (.anim-rotate-slow, 60 s)
 *  - o ponto de luz "respira" (.anim-breathe, 5 s)
 */
interface EmblemaCapaSlideProps {
  className?: string;
  inView?: boolean;
}

const OURO = 'var(--av-ouro, #c9a227)';

export default function EmblemaCapaSlide({ className, inView = true }: EmblemaCapaSlideProps) {
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
        <path d="M60 86 C50 78 38 76 28 78 V52 C38 50 50 52 60 60 Z" />
        <path d="M60 86 C70 78 82 76 92 78 V52 C82 50 70 52 60 60 Z" />
        <path d="M24 88 C40 84 52 88 60 94 C68 88 80 84 96 88" />
        <path d="M60 24 V17 M44 30 L39 24 M76 30 L81 24" />
      </g>

      {/* Ponto de luz acima do livro */}
      <circle
        cx="60"
        cy="40"
        r="3.2"
        fill={OURO}
        stroke="none"
        className="anim-breathe"
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      />
    </svg>
  );
}
