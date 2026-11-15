/**
 * EmblemaProcessamento — hexágono com três pontos ligados, original.
 * Usado na etapa "Processamento" de "Da sala de aula à tela".
 *
 * Movimento padrão dos emblemas:
 *  - o traço se desenha sozinho (.draw-path / .in-view, 2,2 s)
 *  - o anel externo gira devagar (.anim-rotate-slow, 60 s)
 *  - o ponto central "respira" (.anim-breathe, 5 s)
 */
interface EmblemaProcessamentoProps {
  className?: string;
  inView?: boolean;
}

const OURO = 'var(--av-ouro)';

export default function EmblemaProcessamento({ className, inView = true }: EmblemaProcessamentoProps) {
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

      {/* Hexágono e conexões, desenhados traço a traço */}
      <g className={inView ? 'draw-path in-view' : 'draw-path'}>
        <path d="M60 20 L94 40 V80 L60 100 L26 80 V40 Z" />
        <path d="M60 38 L77 70 H43 Z" />
        <circle cx="60" cy="38" r="4" />
        <circle cx="77" cy="70" r="4" />
        <circle cx="43" cy="70" r="4" />
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
