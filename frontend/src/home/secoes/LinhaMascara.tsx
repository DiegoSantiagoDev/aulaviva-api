import type { ReactNode } from 'react';

/** Linha de título dentro de uma máscara: o GSAP a revela deslizando de baixo para cima. */
export default function LinhaMascara({ children, classe }: { children: ReactNode; classe: string }) {
  return (
    <span className="ini-mascara">
      <span className={`ini-linha ${classe}`}>{children}</span>
    </span>
  );
}
