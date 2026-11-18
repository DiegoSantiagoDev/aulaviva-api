import { lazy, Suspense, useEffect, useState } from 'react';
import ErroLimite from './ErroLimite.tsx';

// Three.js, R3F e Drei só são baixados pela página inicial, e só quando há WebGL.
const CenaNucleo = lazy(() => import('./CenaNucleo.tsx'));

interface CenaFundoProps {
  leve: boolean;
  aoPronta: () => void;
  aoFalhar: () => void;
}

export default function CenaFundo({ leve, aoPronta, aoFalhar }: CenaFundoProps) {
  const [aba, setAba] = useState(() => document.visibilityState === 'visible');

  useEffect(() => {
    const sincronizar = () => setAba(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', sincronizar);
    return () => document.removeEventListener('visibilitychange', sincronizar);
  }, []);

  return (
    <ErroLimite aoFalhar={aoFalhar}>
      <Suspense fallback={null}>
        <CenaNucleo leve={leve} ativa={aba} onPronta={aoPronta} onFalha={aoFalhar} />
      </Suspense>
    </ErroLimite>
  );
}
