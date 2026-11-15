/**
 * EmblemaEstudo — tela com linhas de texto e apoio, original.
 * Usado na etapa "Plataforma" de "Da sala de aula à tela".
 *
 * Movimento padrão dos emblemas:
 *  - o traço se desenha sozinho (.draw-path / .in-view, 2,2 s)
 *  - o anel externo gira devagar (.anim-rotate-slow, 60 s)
 *  - o ponto de destaque "respira" (.anim-breathe, 5 s)
 */
interface EmblemaEstudoProps {
  className?: string;
  inView?: boolean;
}

const OURO = 'var(--av-ouro)';

export default function EmblemaEstudo({ className, inView = true }: EmblemaEstudoProps) {
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

      {/* Tela e linhas de conteúdo, desenhadas traço a traço */}
      <g className={inView ? 'draw-path in-view' : 'draw-path'}>
        <rect x="22" y="28" width="76" height="50" rx="7" />
        <path d="M34 46 H64 M34 57 H80 M34 68 H56" />
        <path d="M60 78 V92 M44 94 H76" />
      </g>

      {/* Ponto de luz */}
      <circle
        cx="84"
        cy="44"
        r="3.2"
        fill={OURO}
        stroke="none"
        className="anim-breathe"
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      />
    </svg>
  );
}
