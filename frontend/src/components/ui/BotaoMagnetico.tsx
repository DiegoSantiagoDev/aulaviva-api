import type { ReactNode } from 'react';
import { useMagnetico } from '../../animacoes/useMagnetico.ts';

interface BotaoMagneticoProps {
  children: ReactNode;
  onClick: () => void;
  className?: string;
}

/** Botão atraído levemente pelo cursor (só com mouse e sem "movimento reduzido"). */
export default function BotaoMagnetico({ children, onClick, className = '' }: BotaoMagneticoProps) {
  const ref = useMagnetico<HTMLButtonElement>(0.28, 16);
  return (
    <button ref={ref} type="button" className={className} onClick={onClick}>
      {children}
    </button>
  );
}
