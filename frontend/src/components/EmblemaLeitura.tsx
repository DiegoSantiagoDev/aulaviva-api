/**
 * EmblemaLeitura — livro aberto com marcador, original.
 * Usado abaixo da plataforma do aluno e no estado vazio da biblioteca de aulas.
 *
 * Movimento padrão dos emblemas:
 *  - o traço se desenha sozinho (.draw-path / .in-view, 2,2 s)
 *  - o anel externo gira devagar (.anim-rotate-slow, 60 s)
 *  - o ponto de destaque "respira" (.anim-breathe, 5 s)
 */
interface EmblemaLeituraProps {
  className?: string;
  inView?: boolean;
}

const OURO = 'var(--av-ouro)';

export default function EmblemaLeitura({ className, inView = true }: EmblemaLeituraProps) {
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

      {/* Livro aberto, linhas de texto e marcador, desenhados traço a traço */}
      <g className={inView ? 'draw-path in-view' : 'draw-path'}>
        <path d="M60 36 C50 30 36 30 24 34 V82 C36 78 50 78 60 84 C70 78 84 78 96 82 V34 C84 30 70 30 60 36 Z" />
        <path d="M60 36 V84" />
        <path d="M32 46 H52 M32 56 H52 M32 66 H46 M68 46 H88 M68 56 H88" />
        <path d="M78 34 V48 L82 44 L86 48 V32" />
      </g>

      {/* Ponto de luz */}
      <circle
        cx="76"
        cy="66"
        r="3.2"
        fill={OURO}
        stroke="none"
        className="anim-breathe"
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      />
    </svg>
  );
}
