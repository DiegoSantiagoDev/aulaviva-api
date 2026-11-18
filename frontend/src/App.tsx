import { lazy, Suspense } from 'react';
import { RoteadorProvider, useRoteador } from './app/Roteador.tsx';
import { AuthProvider } from './auth/AuthContext.tsx';
import GuardaRota from './auth/GuardaRota.tsx';
import LayoutApp from './app/LayoutApp.tsx';
import TransicaoRota from './animacoes/TransicaoRota.tsx';
import IndicadorCarregamento from './components/ui/IndicadorCarregamento.tsx';
import Pagina404 from './pages/Pagina404.tsx';
import PaginaEntrar from './pages/autenticacao/PaginaEntrar.tsx';
import PaginaCadastro from './pages/autenticacao/PaginaCadastro.tsx';
import BibliotecaAulas from './features/aulas/BibliotecaAulas.tsx';
import DetalheAula from './features/aulas/DetalheAula.tsx';

// Carregamento sob demanda: Three.js/GSAP pesados só na página inicial;
// painéis só para quem tem permissão de abri-los.
const PaginaInicial = lazy(() => import('./home/PaginaInicial.tsx'));
const PainelProfessor = lazy(() => import('./features/professor/PainelProfessor.tsx'));
const PainelAdmin = lazy(() => import('./features/admin/PainelAdmin.tsx'));

function ConteudoRotas() {
  const { rota, parametros } = useRoteador();

  if (rota === '/') return <PaginaInicial />;
  if (rota === '/entrar') return <PaginaEntrar />;
  if (rota === '/cadastro') return <PaginaCadastro />;

  if (rota === '/aulas') {
    return (
      <LayoutApp>
        <BibliotecaAulas />
      </LayoutApp>
    );
  }

  if (rota.startsWith('/aulas/') && parametros.id) {
    return (
      <LayoutApp>
        <DetalheAula id={parametros.id} />
      </LayoutApp>
    );
  }

  if (rota === '/professor') {
    return (
      <LayoutApp>
        <GuardaRota papeis={['PROFESSOR', 'ADMIN']}>
          <PainelProfessor />
        </GuardaRota>
      </LayoutApp>
    );
  }

  if (rota === '/admin') {
    return (
      <LayoutApp>
        <GuardaRota papeis={['ADMIN']}>
          <PainelAdmin />
        </GuardaRota>
      </LayoutApp>
    );
  }

  return <Pagina404 />;
}

export default function App() {
  return (
    <AuthProvider>
      <RoteadorProvider>
        <TransicaoRota>
          <Suspense fallback={<IndicadorCarregamento />}>
            <ConteudoRotas />
          </Suspense>
        </TransicaoRota>
      </RoteadorProvider>
    </AuthProvider>
  );
}
