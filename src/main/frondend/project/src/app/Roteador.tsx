import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface RoteadorContextType {
  rota: string;
  parametros: Record<string, string>;
  searchParams: URLSearchParams;
  navegar: (caminho: string) => void;
}

const RoteadorContext = createContext<RoteadorContextType>({
  rota: '/',
  parametros: {},
  searchParams: new URLSearchParams(),
  navegar: () => {},
});

/* eslint-disable-next-line react-refresh/only-export-components */
export function useRoteador() {
  return useContext(RoteadorContext);
}

function parseHash(hashCompleto: string): { rota: string; searchParams: URLSearchParams } {
  const limpo = hashCompleto.replace(/^#\/?/, '/');
  const [caminhoComBarra, query] = limpo.split('?');
  const rotaNormalizada = (caminhoComBarra || '/').replace(/\/+$/, '') || '/';
  const searchParams = new URLSearchParams(query || '');
  return { rota: rotaNormalizada, searchParams };
}

export function RoteadorProvider({ children }: { children: React.ReactNode }) {
  const [estadoRota, setEstadoRota] = useState(() =>
    typeof window !== 'undefined'
      ? parseHash(window.location.hash)
      : { rota: '/', searchParams: new URLSearchParams() }
  );

  // Só move o foco/rolagem quando o caminho muda. Trocar apenas a query
  // (por exemplo ?aba=slides) não deve roubar o foco das abas.
  const rotaAnteriorRef = useRef(estadoRota.rota);

  useEffect(() => {
    const aoMudarHash = () => {
      const parsed = parseHash(window.location.hash);
      const mudouRota = rotaAnteriorRef.current !== parsed.rota;
      rotaAnteriorRef.current = parsed.rota;
      setEstadoRota(parsed);

      if (!mudouRota) return;

      window.scrollTo({ top: 0, behavior: 'smooth' });
      requestAnimationFrame(() => {
        const titulo = document.querySelector('h1');
        if (titulo) {
          titulo.setAttribute('tabindex', '-1');
          titulo.focus();
        }
      });
    };

    window.addEventListener('hashchange', aoMudarHash);
    return () => window.removeEventListener('hashchange', aoMudarHash);
  }, []);

  const navegar = (caminho: string) => {
    const hashFormatado = caminho.startsWith('/') ? `#${caminho}` : `#/${caminho}`;
    window.location.hash = hashFormatado;
  };

  const parametros: Record<string, string> = {};
  const matchAula = estadoRota.rota.match(/^\/aulas\/(\d+)$/);
  if (matchAula) {
    parametros.id = matchAula[1];
  }

  return (
    <RoteadorContext.Provider
      value={{
        rota: estadoRota.rota,
        parametros,
        searchParams: estadoRota.searchParams,
        navegar,
      }}
    >
      {children}
    </RoteadorContext.Provider>
  );
}
