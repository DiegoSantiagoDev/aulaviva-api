import { RoteadorProvider, useRoteador } from './app/Roteador';
import LayoutApp from './app/LayoutApp';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import HowItWorks from './components/HowItWorks';
import ProcessFlow from './components/ProcessFlow';
import AIFeatures from './components/AIFeatures';
import StudentPlatform from './components/StudentPlatform';
import TeacherArea from './components/TeacherArea';
import TechStack from './components/TechStack';
import Privacy from './components/Privacy';
import Roadmap from './components/Roadmap';
import CTA from './components/CTA';
import Footer from './components/Footer';

import PaginaEntrar from './pages/PaginaEntrar';
import Pagina404 from './pages/Pagina404';
import BibliotecaAulas from './features/aulas/BibliotecaAulas';
import DetalheAula from './features/aulas/DetalheAula';
import PainelProfessor from './features/professor/PainelProfessor';

function ApresentacaoInstitucional() {
  return (
    <div className="av-pagina min-h-screen bg-parchment">
      <Nav />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        <Hero />
        <Marquee />
        <HowItWorks />
        <ProcessFlow />
        <AIFeatures />
        <StudentPlatform />
        <TeacherArea />
        <TechStack />
        <Privacy />
        <Roadmap />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

function ConteudoRotas() {
  const { rota, parametros } = useRoteador();

  // Rota 1: Apresentação inicial
  if (rota === '/') {
    return <ApresentacaoInstitucional />;
  }

  // Rota 2: Porta de entrada (Sou aluno / Sou professor)
  if (rota === '/entrar') {
    return <PaginaEntrar />;
  }

  // Rotas da aplicação (Aluno e Professor) dentro do LayoutApp
  if (rota === '/aulas' || rota.startsWith('/aulas/') || rota === '/professor') {
    return (
      <LayoutApp>
        {rota === '/aulas' && <BibliotecaAulas />}

        {rota.startsWith('/aulas/') && parametros.id && (
          <DetalheAula id={parametros.id} />
        )}

        {rota === '/professor' && <PainelProfessor />}
      </LayoutApp>
    );
  }

  // Rota inexistente (404)
  return <Pagina404 />;
}

export default function App() {
  return (
    <RoteadorProvider>
      <ConteudoRotas />
    </RoteadorProvider>
  );
}
