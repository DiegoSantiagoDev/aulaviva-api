/**
 * ArtFigure — an animated line-drawing character whose poses reference
 * famous masterworks of art history. Each pose is an SVG that draws itself
 * on scroll into view.
 *
 * References (intentionally NOT "The Thinker" by Rodin, per the brief):
 *  1. "vitruvian"  → Leonardo da Vinci, Vitruvian Man (proportions / learning)
 *  2. "creation"   → Michelangelo, The Creation of Adam (reaching for knowledge)
 *  3. "discobolus" → Discobolus of Myron (the throw / momentum of practice)
 *  4. "nike"       → Winged Victory of Samothrace (triumph / graduation)
 *  5. "david"      → Michelangelo, David (contemplation before the challenge)
 */

type Pose = 'vitruvian' | 'creation' | 'discobolus' | 'nike' | 'david' | 'scholar' | 'scribe';

interface Props {
  pose: Pose;
  inView: boolean;
  className?: string;
}

const STROKE = '#1a1612';
const ACCENT = '#c9a227';

function groupClass(inView: boolean) {
  return inView ? 'draw-path in-view' : 'draw-path';
}

export default function ArtFigure({ pose, inView, className }: Props) {
  return (
    <svg
      viewBox="0 0 300 300"
      className={className}
      fill="none"
      stroke={STROKE}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g className={groupClass(inView)}>
        {renderPose(pose)}
      </g>
      {/* animated accent halo */}
      <circle cx="150" cy="150" r="120" stroke={ACCENT} strokeWidth={0.5} opacity={inView ? 0.4 : 0} style={{ transition: 'opacity 1.5s ease 1s' }} className="anim-rotate-slow" />
    </svg>
  );
}

function renderPose(pose: Pose) {
  switch (pose) {
    case 'vitruvian':
      return <Vitruvian />;
    case 'creation':
      return <Creation />;
    case 'discobolus':
      return <Discobolus />;
    case 'nike':
      return <Nike />;
    case 'david':
      return <David />;
    case 'scholar':
      return <Scholar />;
    case 'scribe':
      return <Scribe />;
  }
}

/* ---------- Vitruvian Man reference ---------- */
function Vitruvian() {
  return (
    <>
      {/* square + circle — the two geometric ideals */}
      <rect x="60" y="60" width="180" height="180" stroke={ACCENT} strokeWidth={0.8} opacity={0.5} />
      <circle cx="150" cy="150" r="90" stroke={ACCENT} strokeWidth={0.8} opacity={0.5} />
      {/* head */}
      <circle cx="150" cy="95" r="14" />
      {/* torso */}
      <line x1="150" y1="109" x2="150" y2="175" />
      {/* arms spread — the famous span */}
      <line x1="150" y1="125" x2="70" y2="120" />
      <line x1="150" y1="125" x2="230" y2="120" />
      {/* arms raised variant */}
      <line x1="150" y1="125" x2="95" y2="70" />
      <line x1="150" y1="125" x2="205" y2="70" />
      {/* legs together */}
      <line x1="150" y1="175" x2="150" y2="225" />
      {/* legs spread */}
      <line x1="150" y1="175" x2="120" y2="225" />
      <line x1="150" y1="175" x2="180" y2="225" />
      {/* label ticks */}
      <line x1="60" y1="150" x2="66" y2="150" stroke={ACCENT} strokeWidth={1} />
      <line x1="234" y1="150" x2="240" y2="150" stroke={ACCENT} strokeWidth={1} />
    </>
  );
}

/* ---------- Creation of Adam reference ---------- */
function Creation() {
  return (
    <>
      {/* reclining figure — Adam */}
      <circle cx="95" cy="130" r="14" />
      {/* body reclining */}
      <path d="M109 138 Q140 150 170 160 Q200 168 215 175" />
      {/* arm reaching out — the iconic gesture */}
      <line x1="105" y1="138" x2="140" y2="105" />
      <line x1="135" y1="108" x2="148" y2="92" />
      {/* torso lines */}
      <line x1="110" y1="150" x2="120" y2="190" />
      <line x1="120" y1="190" x2="100" y2="210" />
      {/* second hand reaching from the other side — the spark gap */}
      <circle cx="225" cy="95" r="11" stroke={ACCENT} />
      <line x1="214" y1="98" x2="180" y2="92" />
      {/* spark between the two fingers */}
      <line x1="148" y1="92" x2="180" y2="92" stroke={ACCENT} strokeWidth={1} strokeDasharray="2 4" />
      <circle cx="164" cy="92" r="3" fill={ACCENT} stroke="none" className="anim-breathe" />
    </>
  );
}

/* ---------- Discobolus reference ---------- */
function Discobolus() {
  return (
    <>
      {/* head looking back */}
      <circle cx="120" cy="100" r="13" />
      {/* arched torso */}
      <path d="M128 110 Q160 120 175 150 Q180 165 170 175" />
      {/* throwing arm drawn back */}
      <path d="M120 118 Q90 130 80 110 Q75 100 85 92" />
      <circle cx="82" cy="88" r="6" stroke={ACCENT} />
      {/* leading leg bent */}
      <path d="M170 175 Q185 200 165 220" />
      <path d="M165 220 L150 230" />
      {/* back leg planted */}
      <path d="M150 175 Q130 205 140 230" />
      <path d="M140 230 L155 235" />
      {/* free arm forward for balance */}
      <path d="M140 130 Q170 145 195 140" />
    </>
  );
}

/* ---------- Winged Victory of Samothrace reference ---------- */
function Nike() {
  return (
    <>
      {/* headless — statue has no head, so we start at shoulders */}
      {/* wing — the signature */}
      <path d="M180 110 Q230 80 260 120 Q255 140 230 135 Q240 125 250 130" />
      <path d="M180 115 Q220 100 245 125" />
      <path d="M175 125 Q215 115 240 140" />
      {/* drapery / body surging forward */}
      <path d="M150 110 Q140 140 145 175 Q150 210 160 235" />
      <path d="M160 115 Q160 145 168 180 Q175 215 185 235" />
      {/* flowing robe folds */}
      <path d="M145 175 Q165 180 185 175" stroke={ACCENT} opacity={0.6} />
      <path d="M150 200 Q170 205 190 200" stroke={ACCENT} opacity={0.6} />
      <path d="M155 225 Q172 230 188 225" stroke={ACCENT} opacity={0.6} />
      {/* forward stride */}
      <path d="M168 235 L175 250" />
      <path d="M182 235 L190 250" />
      {/* prow of the ship base */}
      <path d="M110 255 L210 255 L200 265 L120 265 Z" stroke={ACCENT} opacity={0.4} />
    </>
  );
}

/* ---------- David reference (contemplative, pre-battle) ---------- */
function David() {
  return (
    <>
      {/* head — the calm, focused expression */}
      <circle cx="150" cy="80" r="15" />
      <line x1="142" y1="78" x2="146" y2="78" />
      <line x1="154" y1="78" x2="158" y2="78" />
      {/* neck */}
      <line x1="150" y1="95" x2="150" y2="108" />
      {/* shoulders — relaxed, weight on one leg (contrapposto) */}
      <path d="M150 108 Q120 112 110 130" />
      <path d="M150 108 Q180 112 190 130" />
      {/* torso */}
      <line x1="150" y1="108" x2="150" y2="180" />
      {/* right arm hanging relaxed */}
      <path d="M190 130 Q195 155 188 180" />
      {/* left hand raised to shoulder — the sling arm */}
      <path d="M110 130 Q95 145 100 165" />
      {/* hips — shifted for contrapposto */}
      <path d="M140 180 L160 180" />
      {/* weight-bearing right leg */}
      <path d="M160 180 Q165 210 162 240" />
      {/* relaxed left leg */}
      <path d="M140 180 Q132 205 138 235" />
      {/* sling detail in left hand */}
      <circle cx="98" cy="167" r="4" stroke={ACCENT} />
      <line x1="98" y1="170" x2="92" y2="180" stroke={ACCENT} />
    </>
  );
}

/* ---------- Scholar reference — "A Leitora" (a student at a desk), inspired by Vermeer's "Girl Reading a Letter" ---------- */
function Scholar() {
  return (
    <>
      {/* head tilted down toward the book */}
      <circle cx="135" cy="95" r="14" />
      {/* neck + bent posture */}
      <line x1="135" y1="109" x2="140" y2="125" />
      {/* torso hunched forward in study */}
      <path d="M140 125 Q155 145 165 175" />
      {/* arm reaching to the desk/book */}
      <path d="M140 125 Q115 145 100 160" />
      <path d="M100 160 L110 165" />
      {/* other arm resting */}
      <path d="M150 140 Q175 160 185 175" />
      {/* legs under the desk */}
      <path d="M165 175 L155 230" />
      <path d="M175 175 L180 230" />
      {/* the book / desk surface */}
      <path d="M70 165 L140 158 L145 175 L75 180 Z" stroke={ACCENT} opacity={0.6} />
      <line x1="90" y1="163" x2="120" y2="160" stroke={ACCENT} opacity={0.4} />
      <line x1="92" y1="168" x2="118" y2="165" stroke={ACCENT} opacity={0.4} />
      {/* small lamp glow above */}
      <circle cx="210" cy="70" r="8" stroke={ACCENT} opacity={0.5} className="anim-breathe" />
      <line x1="210" y1="78" x2="210" y2="95" stroke={ACCENT} opacity={0.3} />
    </>
  );
}

/* ---------- Scribe reference — hand writing, inspired by classical depictions of St. Jerome in his study ---------- */
function Scribe() {
  return (
    <>
      {/* hand poised writing with a quill */}
      <path d="M100 90 Q120 100 140 110 Q160 120 180 115" />
      {/* fingers gripping quill */}
      <path d="M175 113 Q185 108 195 100" />
      <path d="M178 116 Q190 112 200 105" />
      {/* quill feather */}
      <path d="M195 100 Q215 85 230 70 Q225 80 210 95" stroke={ACCENT} opacity={0.6} />
      {/* inkwell */}
      <circle cx="105" cy="120" r="6" stroke={ACCENT} />
      {/* parchment lines being written */}
      <line x1="120" y1="130" x2="190" y2="128" stroke={ACCENT} opacity={0.4} />
      <line x1="120" y1="140" x2="175" y2="138" stroke={ACCENT} opacity={0.4} />
      <line x1="120" y1="150" x2="195" y2="148" stroke={ACCENT} opacity={0.4} />
      {/* drop of ink */}
      <circle cx="196" cy="125" r="2" fill={ACCENT} stroke="none" className="anim-float-soft" />
    </>
  );
}
