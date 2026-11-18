import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { calcularAlvo, estadoCena } from './estadoCena.ts';

interface CenaNucleoProps {
  /** Aparelho modesto: menos geometria, menos partículas, resolução menor. */
  leve: boolean;
  /** Pausa o desenho quando a aba está oculta. */
  ativa: boolean;
  onPronta: () => void;
  onFalha: () => void;
}

const FRIA = new THREE.Color('#5a49ff');
const QUENTE = new THREE.Color('#ff8a2b');
const CORAL = new THREE.Color('#ff5b3a');
const suave = THREE.MathUtils.smoothstep;
const amortecer = THREE.MathUtils.damp;

/** Painéis de vidro flutuantes: são os "slides" da aula, em órbita lenta. */
const PAINEIS: ReadonlyArray<{ pos: [number, number, number]; rot: [number, number, number]; esc: number; fase: number }> = [
  { pos: [-3.3, 1.1, -1.2], rot: [0.1, 0.55, -0.08], esc: 1.0, fase: 0 },
  { pos: [3.6, -0.9, -2.0], rot: [-0.05, -0.6, 0.06], esc: 1.25, fase: 1.7 },
  { pos: [-2.4, -1.9, 0.4], rot: [0.12, 0.35, 0.1], esc: 0.7, fase: 3.1 },
  { pos: [2.6, 2.1, -3.2], rot: [-0.1, -0.4, -0.05], esc: 1.4, fase: 4.4 },
];

function PainelVidro({ indice, borda }: { indice: number; borda: React.MutableRefObject<THREE.LineBasicMaterial[]> }) {
  const p = PAINEIS[indice];
  const grupo = useRef<THREE.Group>(null);
  const bordas = useMemo(() => new THREE.EdgesGeometry(new THREE.PlaneGeometry(1.6, 0.9)), []);
  const materialBorda = useMemo(
    () => new THREE.LineBasicMaterial({ color: '#a79dff', transparent: true, opacity: 0, toneMapped: false }),
    []
  );
  const materialFace = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#6a5cff', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }),
    []
  );

  // Registra os materiais para o loop principal controlar a opacidade com o scroll.
  useEffect(() => {
    const lista = borda.current;
    (materialBorda.userData as { face?: THREE.MeshBasicMaterial }).face = materialFace;
    lista[indice] = materialBorda;
    return () => {
      delete lista[indice];
      materialBorda.dispose();
      materialFace.dispose();
      bordas.dispose();
    };
  }, [borda, indice, materialBorda, materialFace, bordas]);

  useFrame((state) => {
    const g = grupo.current;
    if (!g) return;
    const t = state.clock.elapsedTime + p.fase;
    g.position.y = p.pos[1] + Math.sin(t * 0.5) * 0.18;
    g.rotation.y = p.rot[1] + Math.sin(t * 0.3) * 0.12 + estadoCena.mx * 0.12;
  });

  return (
    <group ref={grupo} position={p.pos} rotation={p.rot} scale={p.esc}>
      <mesh material={materialFace}>
        <planeGeometry args={[1.6, 0.9]} />
      </mesh>
      <lineSegments geometry={bordas} material={materialBorda} />
    </group>
  );
}

function Particulas({ quantidade }: { quantidade: number }) {
  const pontos = useRef<THREE.Points>(null);
  const posicoes = useMemo(() => {
    const arr = new Float32Array(quantidade * 3);
    for (let i = 0; i < quantidade; i++) {
      const raio = 3.2 + Math.random() * 7.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = raio * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = raio * Math.sin(phi) * Math.sin(theta) * 0.7;
      arr[i * 3 + 2] = raio * Math.cos(phi) - 2;
    }
    return arr;
  }, [quantidade]);

  useFrame((_, delta) => {
    const p = pontos.current;
    if (!p) return;
    p.rotation.y += delta * (0.012 + estadoCena.historia * 0.05);
    p.rotation.x = estadoCena.my * 0.05;
  });

  return (
    <points ref={pontos}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={posicoes} count={quantidade} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.032}
        sizeAttenuation
        color="#d6cfff"
        transparent
        opacity={0.75}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Cena({ leve }: { leve: boolean }) {
  const grupo = useRef<THREE.Group>(null);
  const nucleo = useRef<THREE.Mesh>(null);
  const aneis = useRef<Array<THREE.Group | null>>([]);
  const luzQuente = useRef<THREE.PointLight>(null);
  const luzFria = useRef<THREE.PointLight>(null);
  const materiaisPainel = useRef<THREE.LineBasicMaterial[]>([]);
  const suavizado = useRef({ x: 0, y: 0, escala: 0.9, mistura: 0, distorcao: 0.3 });
  const cor = useMemo(() => new THREE.Color(), []);

  useFrame((state, delta) => {
    const s = suavizado.current;
    const e = estadoCena;
    const alvo = calcularAlvo(e);
    const t = state.clock.elapsedTime;

    s.x = amortecer(s.x, alvo.x, 3.2, delta);
    s.y = amortecer(s.y, alvo.y, 3.2, delta);
    s.escala = amortecer(s.escala, alvo.escala, 3.2, delta);
    // 0 = frio/violeta (captura), 1 = quente/brasa (luz), >1 mistura coral no final
    const calor = suave(e.historia, 0.12, 0.75);
    s.mistura = amortecer(s.mistura, calor, 2.5, delta);
    s.distorcao = amortecer(s.distorcao, 0.26 + e.historia * 0.22 + e.fim * 0.1, 2.5, delta);

    if (grupo.current) {
      grupo.current.position.set(s.x, s.y, 0);
      grupo.current.scale.setScalar(s.escala);
      grupo.current.rotation.y = amortecer(grupo.current.rotation.y, e.mx * 0.35, 2, delta);
      grupo.current.rotation.x = amortecer(grupo.current.rotation.x, -e.my * 0.2, 2, delta);
    }

    const malha = nucleo.current;
    if (malha) {
      malha.rotation.y = t * (0.12 + e.historia * 0.25);
      malha.rotation.z = t * 0.05;
      const material = malha.material as THREE.MeshPhysicalMaterial & { distort?: number; speed?: number };
      cor.copy(FRIA).lerp(QUENTE, s.mistura).lerp(CORAL, e.fim * 0.55);
      material.color.copy(cor);
      material.emissive.copy(cor);
      material.emissiveIntensity = 0.04 + s.mistura * 0.5 + e.fim * 0.25;
      material.distort = s.distorcao;
      material.speed = 1.1 + e.historia * 1.6;
    }

    aneis.current.forEach((anel, i) => {
      if (!anel) return;
      const sentido = i % 2 === 0 ? 1 : -1;
      anel.rotation.z += delta * sentido * (0.22 + i * 0.07 + e.historia * 0.9);
    });

    if (luzQuente.current) luzQuente.current.intensity = 10 + s.mistura * 34 + e.fim * 18;
    if (luzFria.current) luzFria.current.intensity = 26 - s.mistura * 14;

    // Os painéis (slides) surgem na segunda cena da história e permanecem até o meio.
    const aparecer = suave(e.historia, 0.38, 0.8) * (1 - suave(e.meio, 0.05, 0.5));
    materiaisPainel.current.forEach((m) => {
      if (!m) return;
      m.opacity = aparecer * 0.85;
      const face = (m.userData as { face?: THREE.MeshBasicMaterial }).face;
      if (face) face.opacity = aparecer * 0.07;
    });

    // Câmera: aproxima ao longo da história e deriva levemente com o tempo e o mouse.
    const cam = state.camera;
    cam.position.x = amortecer(cam.position.x, Math.sin(t * 0.12) * 0.35 + e.mx * 0.45, 2, delta);
    cam.position.y = amortecer(cam.position.y, e.my * -0.25, 2, delta);
    cam.position.z = amortecer(cam.position.z, 7 - e.historia * 1.3 + e.meio * 1.1 - e.fim * 0.4, 2.2, delta);
    cam.lookAt(0, 0, 0);
  });

  const detalhe = leve ? 24 : 56;
  const raios = [2.05, 2.5, 3.0];
  const inclinacoes: Array<[number, number, number]> = [
    [1.15, 0.2, 0],
    [0.55, -0.7, 0.3],
    [1.5, 0.6, -0.4],
  ];

  return (
    <>
      <ambientLight intensity={0.12} />
      <pointLight ref={luzQuente} position={[-5, -1.5, 3.5]} color="#ff9a3c" intensity={10} distance={30} decay={1.4} />
      <pointLight ref={luzFria} position={[5, 4, 2]} color="#7b6cff" intensity={26} distance={30} decay={1.4} />

      <Environment resolution={leve ? 128 : 256} frames={1}>
        <Lightformer form="rect" intensity={4.5} color="#ffa51f" position={[-5, 1, 2]} scale={[4, 7, 1]} />
        <Lightformer form="rect" intensity={3.5} color="#7b6cff" position={[5, 3, -2]} scale={[7, 2.5, 1]} />
        <Lightformer form="ring" intensity={2.2} color="#ff5b3a" position={[0, -4, 3]} scale={4} />
        <Lightformer form="circle" intensity={1.6} color="#ffffff" position={[0, 5, 4]} scale={2} />
      </Environment>

      <group ref={grupo}>
        <mesh ref={nucleo}>
          <icosahedronGeometry args={[1.2, detalhe]} />
          <MeshDistortMaterial color="#5a49ff" distort={0.3} speed={1.2} roughness={0.2} metalness={0.78} envMapIntensity={1.3} />
        </mesh>

        {raios.map((r, i) => (
          <group key={r} rotation={inclinacoes[i]}>
            <group ref={(g) => { aneis.current[i] = g; }}>
              <mesh>
                <torusGeometry args={[r, 0.0085, 8, leve ? 96 : 220]} />
                <meshBasicMaterial color={i === 1 ? '#ffa51f' : '#d6cfff'} transparent opacity={0.55} toneMapped={false} />
              </mesh>
              <mesh position={[r, 0, 0]}>
                <sphereGeometry args={[0.055 + i * 0.01, 12, 12]} />
                <meshBasicMaterial color="#fff1d6" toneMapped={false} />
              </mesh>
            </group>
          </group>
        ))}
      </group>

      {PAINEIS.slice(0, leve ? 2 : PAINEIS.length).map((_, i) => (
        <PainelVidro key={i} indice={i} borda={materiaisPainel} />
      ))}

      <Particulas quantidade={leve ? 380 : 1100} />
    </>
  );
}

export default function CenaNucleo({ leve, ativa, onPronta, onFalha }: CenaNucleoProps) {
  return (
    <Canvas
      dpr={leve ? [1, 1.25] : [1, 2]}
      camera={{ position: [0, 0, 7], fov: 36, near: 0.1, far: 60 }}
      gl={{ antialias: !leve, alpha: true, powerPreference: 'high-performance' }}
      frameloop={ativa ? 'always' : 'never'}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.domElement.addEventListener('webglcontextlost', (ev) => {
          ev.preventDefault();
          onFalha();
        });
        onPronta();
      }}
    >
      <Cena leve={leve} />
    </Canvas>
  );
}
