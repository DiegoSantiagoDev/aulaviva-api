import Nav from './components/Nav';
import Hero from './components/Hero';
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
