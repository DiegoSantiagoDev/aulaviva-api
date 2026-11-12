import Nav from './components/Nav.tsx';
import Hero from './components/Hero.tsx';
import HowItWorks from './components/HowItWorks.tsx';
import ProcessFlow from './components/ProcessFlow.tsx';
import AIFeatures from './components/AIFeatures.tsx';
import StudentPlatform from './components/StudentPlatform.tsx';
import TeacherArea from './components/TeacherArea.tsx';
import TechStack from './components/TechStack.tsx';
import Privacy from './components/Privacy.tsx';
import Roadmap from './components/Roadmap.tsx';
import CTA from './components/CTA.tsx';
import Footer from './components/Footer.tsx';

function Marquee() {
  const items = ['ESP32', 'INMP441', 'I2S', 'Spring Boot', 'PostgreSQL', 'IA', 'LGPD', 'Wi-Fi', 'API REST'];
  const row = [...items, ...items];
  return (
    <div className="border-y border-gold/20 bg-parchment py-6 overflow-hidden">
      <div className="flex gap-12 whitespace-nowrap anim-marquee">
        {row.map((name, i) => (
          <span key={i} className="font-display text-3xl text-ink-soft/50 flex items-center gap-12">
            {name}
            <span className="w-2 h-2 rounded-full bg-gold/50" />
          </span>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-parchment">
      <Nav />
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
      <Footer />
    </div>
  );
}

export default App;
