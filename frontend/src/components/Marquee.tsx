import './institucional.css';

const items = [
  'Whisper Large V3',
  'Qwen 3.8 27B',
  'Spring Boot',
  'PostgreSQL',
  'Vite + React',
  'Tailwind CSS',
  'NotebookLM',
  'Offline-First',
];

/** Esteira de tecnologias: mesmo conteúdo e mesma animação (35 s) de antes. */
export default function Marquee() {
  return (
    <section
      className="marquee-viewport av-inst-marquee"
      aria-label={`Tecnologias: ${items.join(', ')}`}
    >
      <span className="sr-only">{items.join(', ')}</span>
      <div className="marquee-track anim-marquee" aria-hidden="true">
        {[0, 1].map((group) => (
          <div className="marquee-group" key={group}>
            {items.map((name) => (
              <span key={`${group}-${name}`} className="av-inst-marquee-item">
                {name}
                <span className="av-inst-marquee-ponto" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
