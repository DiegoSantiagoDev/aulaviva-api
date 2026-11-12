import ArtFigure from './ArtFigure.tsx';
import { useReveal } from '../hooks/useReveal.ts';

type Pose = 'creation' | 'discobolus' | 'nike' | 'david';

interface Work {
  pose: Pose;
  title: string;
  artist: string;
  year: string;
  lesson: string;
  side: 'left' | 'right';
}

const works: Work[] = [
  {
    pose: 'creation',
    title: 'A Criação de Adão',
    artist: 'Michelangelo',
    year: 'c. 1512',
    lesson: 'O toque que desperta a curiosidade — o primeiro instante de aprendizado.',
    side: 'left',
  },
  {
    pose: 'discobolus',
    title: 'Discóbolo',
    artist: 'Míron',
    year: 'c. 460 a.C.',
    lesson: 'O movimento contido antes do lançar. A prática como tensão que se resolve.',
    side: 'right',
  },
  {
    pose: 'david',
    title: 'Davi',
    artist: 'Michelangelo',
    year: '1504',
    lesson: 'A calma antes do desafio. Concentração que precede todo grande feito.',
    side: 'left',
  },
  {
    pose: 'nike',
    title: 'Vitória de Samotrácia',
    artist: 'Grécia helenística',
    year: 'c. 200 a.C.',
    lesson: 'O triunfo que avança contra o vento. Concluir é também seguir em frente.',
    side: 'right',
  },
];

function Row({ work, index }: { work: Work; index: number }) {
  const { ref, inView } = useReveal(0.25);
  const figure = (
    <div className="relative reveal-scale" ref={ref as never}>
      <div className={`art-frame rounded-2xl p-8 ${inView ? 'in-view' : ''} transition-transform duration-700 hover:scale-[1.03]`}>
        <ArtFigure pose={work.pose} inView={inView} className="w-64 h-64 md:w-80 md:h-80" />
      </div>
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
        <span className="text-[10px] tracking-widest2 uppercase text-ink-soft bg-parchment px-3 py-1 rounded-full border border-gold/30 whitespace-nowrap">
          {work.artist} · {work.year}
        </span>
      </div>
    </div>
  );

  const text = (
    <div className="reveal" ref={ref as never}>
      <div className={`flex ${work.side === 'left' ? 'justify-start' : 'justify-end'}`}>
        <span className="font-display text-7xl text-gold/40">0{index + 2}</span>
      </div>
      <h3 className={`font-display text-4xl md:text-5xl font-semibold mt-2 text-ink ${work.side === 'right' ? 'text-right' : ''}`}>
        {work.title}
      </h3>
      <p className={`mt-4 text-ink-soft text-lg max-w-md ${work.side === 'right' ? 'ml-auto text-right' : ''}`}>
        {work.lesson}
      </p>
      <div className={`h-px gold-line mt-6 ${work.side === 'right' ? 'ml-auto' : ''} w-24`} />
    </div>
  );

  return (
    <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center py-20">
      {work.side === 'left' ? (
        <>
          {figure}
          {text}
        </>
      ) : (
        <>
          {text}
          {figure}
        </>
      )}
    </div>
  );
}

export default function Showcase() {
  const { ref, inView } = useReveal(0.15);
  return (
    <section className="relative py-24 px-6 paper-grain">
      <div className="max-w-6xl mx-auto">
        {/* section header */}
        <div ref={ref} className={`text-center mb-16 reveal ${inView ? 'in-view' : ''}`}>
          <span className="text-xs tracking-widest2 uppercase text-gold">A galeria</span>
          <h2 className="font-display text-5xl md:text-6xl font-bold mt-3 text-ink">
            Cada aula, uma obra-prima
          </h2>
          <p className="mt-4 text-ink-soft max-w-xl mx-auto">
            Nosso personagem viaja pela história da arte. Em cada parada, ele empresta a postura
            de uma obra imortal para ensinar uma lição.
          </p>
          <div className="h-px gold-line w-32 mx-auto mt-8" />
        </div>

        {works.map((w, i) => (
          <Row key={w.pose} work={w} index={i} />
        ))}
      </div>
    </section>
  );
}
