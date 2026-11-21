import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, MeshDistortMaterial, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from '../animacoes/motor.ts';
import { calcularAlvo, estadoCena, type AlvoNucleo } from './estadoCena.ts';
import {
  ESCALA_SPRITE_SOL,
  PLANETAS,
  RAIO_SOL,
  calcularOrbita,
  canvasPlaneta,
  canvasSol,
  posicaoNaOrbita,
} from '../lib/solPixel.ts';

interface CenaNucleoProps {
  /** Aparelho modesto (celular, pouca memória): menos partículas e malha mais simples. */
  leve: boolean;
  /** Pausa o desenho quando a aba está oculta. */
  ativa: boolean;
  onPronta: () => void;
  onFalha: () => void;
}

const suave = THREE.MathUtils.smoothstep;

/**
 * A gosma tem a cor do sol da abertura (miolo #ffc400 do canvasSol) e só ganha um leve calor
 * na história e no final. Nada de laranja forte, coral ou tons esverdeados.
 */
const OURO = new THREE.Color('#ffc400');
const OURO_QUENTE = new THREE.Color('#ffb400');

/** Escala do grupo do sol (o disco da referência) e raio da malha base (icosaedro) da gosma. */
const ESCALA_GRUPO_SOL = 0.94;
const RAIO_MALHA = 1.2;

/** Altura da barra do topo, em pixels: os planetas esmaecem antes de passar por trás dela. */
const ALTURA_TOPO_PX = 78;

const DPR_MAXIMO = 2;

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
    () => new THREE.LineBasicMaterial({ color: '#ffcf66', transparent: true, opacity: 0, toneMapped: false }),
    []
  );
  const materialFace = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#ffb000', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }),
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
    g.rotation.y = p.rot[1] + Math.sin(t * 0.3) * 0.12 + estadoCena.mxs * 0.12;
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
    p.rotation.x = estadoCena.mys * 0.05;
    // Na transição, as partículas são sugadas para o centro e se soltam de novo quando a gosma nasce.
    const h = estadoCena.hero;
    const succao = suave(h, 0.1, 0.42) * (1 - suave(h, 0.55, 0.92));
    p.scale.setScalar(1 - 0.42 * succao);
  });

  return (
    <points ref={pontos}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={posicoes} count={quantidade} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.032}
        sizeAttenuation
        color="#ffd27a"
        transparent
        opacity={0.75}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function canvasClarao(): HTMLCanvasElement {
  const T = 256;
  const c = document.createElement('canvas');
  c.width = c.height = T;
  const ctx = c.getContext('2d')!;
  const m = T / 2;
  const g = ctx.createRadialGradient(m, m, 0, m, m, m);
  g.addColorStop(0, 'rgba(255,246,196,1)');
  g.addColorStop(0.22, 'rgba(255,216,12,0.7)');
  g.addColorStop(0.55, 'rgba(255,196,0,0.2)');
  g.addColorStop(1, 'rgba(255,196,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, T, T);
  return c;
}

/** Anel da onda de choque da explosão. */
function canvasAnel(): HTMLCanvasElement {
  const T = 256;
  const c = document.createElement('canvas');
  c.width = c.height = T;
  const ctx = c.getContext('2d')!;
  const m = T / 2;
  const g = ctx.createRadialGradient(m, m, m * 0.62, m, m, m);
  g.addColorStop(0, 'rgba(255,196,0,0)');
  g.addColorStop(0.55, 'rgba(255,226,120,0.85)');
  g.addColorStop(0.7, 'rgba(255,170,0,0.35)');
  g.addColorStop(1, 'rgba(255,140,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, T, T);
  return c;
}

/* =====================================================================
   O ENXAME: as partículas que formam o sol, explodem e voltam a se juntar na gosma
   Tudo é calculado na GPU a partir do progresso (uE = explosão, uJ = junção): sem estado
   acumulado, então rolar para cima desfaz a animação. Cada partícula nasce na posição que ocupa
   dentro do sol (mesma cor do disco), parte em linha reta com giro, flutua, e depois viaja em arco
   até um ponto da superfície da gosma, com atraso próprio para chegar em ondas.
   ===================================================================== */
const VERT_ENXAME = /* glsl */ `
  uniform float uE;
  uniform float uJ;
  uniform float uT;
  uniform float uTR;
  uniform float uScale;
  uniform float uSize;
  attribute vec3 aDir;
  attribute vec4 aRand;
  attribute vec3 aTgt;
  attribute vec3 aCol;
  varying vec3 vCol;
  varying float vBrilho;

  float easeOut(float x) { return 1.0 - pow(1.0 - x, 3.0); }
  float easeInOut(float x) { return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0; }
  mat2 rot(float a) { float c = cos(a); float s = sin(a); return mat2(c, -s, s, c); }

  void main() {
    // 1) explosão: sai do sol em linha reta, desacelera e gira em torno do eixo vertical
    float de = clamp((uE - aRand.y * 0.12) / 0.88, 0.0, 1.0);
    float ex = easeOut(de);
    vec3 p = position + aDir * (ex * aRand.x * 3.3);
    p.xz = rot(ex * (0.5 + aRand.z * 1.5)) * p.xz;
    // 2) enxame vivo: respira e ondula enquanto flutua
    p += aDir * sin(uT * 0.7 + aRand.w * 6.2831) * 0.11 * ex;
    p.y += sin(uT * 0.55 + aRand.z * 6.2831) * 0.09 * ex;

    // 3) junção: viaja em arco até a superfície da gosma, cada partícula com seu atraso
    float dj = clamp((uJ - aRand.y * 0.38) / 0.62, 0.0, 1.0);
    float g = easeInOut(dj);
    vec3 alvo = aTgt * uTR;
    vec3 d = alvo - p;
    vec3 perp = normalize(cross(vec3(0.0, 1.0, 0.0), d) + vec3(0.0001));
    vec3 q = mix(p, alvo, g) + perp * sin(g * 3.14159) * (0.4 + aRand.z) * length(d) * 0.22;

    vec4 mv = modelViewMatrix * vec4(q, 1.0);
    gl_Position = projectionMatrix * mv;
    float tam = uSize * (0.65 + aRand.x * 0.7) * mix(1.0, 0.62, ex * (1.0 - g)) * (1.0 + g * 1.5);
    gl_PointSize = clamp(tam * uScale / -mv.z, 1.0, 34.0);
    vCol = aCol;
    vBrilho = ex * (1.0 - g);
  }
`;

const FRAG_ENXAME = /* glsl */ `
  uniform float uAlpha;
  varying vec3 vCol;
  varying float vBrilho;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.1, d) * uAlpha;
    if (a < 0.01) discard;
    // Alfa pré-multiplicado: no sol (brilho 0) as partículas se fundem como um disco sólido;
    // soltas no espaço (brilho 1) passam a somar luz, como brasas.
    vec3 cor = vCol * (1.0 + vBrilho * 0.45);
    gl_FragColor = vec4(cor * a, a * (1.0 - vBrilho * 0.8));
  }
`;

const COR_NUCLEO = new THREE.Color('#ff8a0a');
const COR_MIOLO = new THREE.Color('#ffc400');
const COR_ARO = new THREE.Color('#ffd80c');

function criarEnxame(n: number): THREE.Points {
  const pos = new Float32Array(n * 3);
  const dir = new Float32Array(n * 3);
  const rnd = new Float32Array(n * 4);
  const tgt = new Float32Array(n * 3);
  const col = new Float32Array(n * 3);
  const cor = new THREE.Color();
  const R = RAIO_SOL;

  const unit = (v: THREE.Vector3) => v.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();

  for (let i = 0; i < n; i++) {
    // posição dentro do sol (metade na superfície, metade no volume: o disco fica cheio)
    unit(a);
    const r = Math.random() < 0.55 ? R : R * Math.cbrt(Math.random());
    pos.set([a.x * r, a.y * r, a.z * r], i * 3);

    // direção da explosão: radial com um pouco de caos
    unit(b);
    b.multiplyScalar(0.5).addScaledVector(a, 0.75).normalize();
    dir.set([b.x, b.y, b.z], i * 3);

    rnd.set([0.35 + Math.random() * 0.65, Math.random(), Math.random(), Math.random()], i * 4);

    // ponto da gosma que esta partícula vai ocupar (quase tudo na superfície)
    unit(b);
    const k = Math.random() < 0.6 ? 1 : 0.2 + Math.random() * 0.75;
    tgt.set([b.x * k, b.y * k, b.z * k], i * 3);

    // cor do disco do sol conforme a distância ao centro (como em canvasSol)
    const rr = Math.min(1, Math.hypot(a.x * r, a.y * r) / R);
    if (rr < 0.5) cor.copy(COR_NUCLEO).lerp(COR_MIOLO, rr / 0.5);
    else cor.copy(COR_MIOLO).lerp(COR_ARO, (rr - 0.5) / 0.5);
    const j = 0.92 + Math.random() * 0.16;
    col.set([cor.r * j, cor.g * j, cor.b * j], i * 3);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aDir', new THREE.BufferAttribute(dir, 3));
  geo.setAttribute('aRand', new THREE.BufferAttribute(rnd, 4));
  geo.setAttribute('aTgt', new THREE.BufferAttribute(tgt, 3));
  geo.setAttribute('aCol', new THREE.BufferAttribute(col, 3));

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uE: { value: 0 },
      uJ: { value: 0 },
      uT: { value: 0 },
      uTR: { value: 1.2 },
      uScale: { value: 600 },
      uSize: { value: 0.085 },
      uAlpha: { value: 0 },
    },
    vertexShader: VERT_ENXAME,
    fragmentShader: FRAG_ENXAME,
    transparent: true,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    blendSrcAlpha: THREE.OneFactor,
    blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
  });

  const pontos = new THREE.Points(geo, mat);
  pontos.frustumCulled = false;
  pontos.visible = false;
  return pontos;
}

/**
 * A abertura e a transformação. Tudo é função do progresso do hero (h, de 0 a 1; o hero fica fixado
 * por ~2,8 telas de rolagem), então rolar para cima desfaz cada passo:
 *
 *  0,00–0,10  o sol vive: planetas em órbita calma.
 *  0,06–0,32  CARGA: planetas aceleram e espiralam para dentro do sol, que incha, vibra e acende.
 *  0,32–0,34  EXPLOSÃO: o disco vira milhares de partículas (mesma cor, mesma posição: sem salto),
 *             com clarão e onda de choque.
 *  0,34–0,62  as partículas voam para todos os lados, girando.
 *  0,62–0,70  o enxame flutua, vivo.
 *  0,70–0,97  JUNÇÃO: as partículas se juntam, em ondas, na superfície da gosma.
 *  0,93–1,00  a gosma 3D (Cena) condensa sobre as partículas e assume.
 */
function Sol({ particulas }: { particulas: number }) {
  const grupo = useRef<THREE.Group>(null);
  const sprites = useRef<Array<THREE.Sprite | null>>([]);
  const solRef = useRef<THREE.Sprite>(null);
  const claraoRef = useRef<THREE.Sprite>(null);
  const anelRef = useRef<THREE.Sprite>(null);
  const viewport = useThree((s) => s.viewport);
  const tamanho = useThree((s) => s.size);
  const tempo = useRef(0);
  const alvo = useRef<AlvoNucleo>({ x: 0, y: 0, escala: 1 });

  const texSol = useMemo(() => {
    const t = new THREE.CanvasTexture(canvasSol());
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  const texClarao = useMemo(() => {
    const t = new THREE.CanvasTexture(canvasClarao());
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  const texAnel = useMemo(() => {
    const t = new THREE.CanvasTexture(canvasAnel());
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  const texPlanetas = useMemo(
    () =>
      PLANETAS.map((p) => {
        const t = new THREE.CanvasTexture(canvasPlaneta(p.tipo, p.n));
        t.colorSpace = THREE.SRGBColorSpace;
        t.magFilter = THREE.NearestFilter;
        t.minFilter = THREE.NearestFilter;
        t.generateMipmaps = false;
        return t;
      }),
    []
  );
  const orbitas = useMemo(() => PLANETAS.map(calcularOrbita), []);
  const enxame = useMemo(() => criarEnxame(particulas), [particulas]);

  useEffect(
    () => () => {
      texSol.dispose();
      texClarao.dispose();
      texAnel.dispose();
      texPlanetas.forEach((t) => t.dispose());
    },
    [texSol, texClarao, texAnel, texPlanetas]
  );
  useEffect(
    () => () => {
      enxame.geometry.dispose();
      (enxame.material as THREE.ShaderMaterial).dispose();
    },
    [enxame]
  );

  useFrame((state, delta) => {
    const g = grupo.current;
    if (!g) return;
    const e = estadoCena;
    const h = e.hero;
    g.visible = h < 0.995;
    if (!g.visible) return;

    tempo.current += delta;
    const t = state.clock.elapsedTime;
    const pose = calcularAlvo(e, alvo.current);
    const ajuste = e.larga ? 1 : Math.min(1, viewport.width / 5.2);

    // ---- fases ----
    const carga = suave(h, 0.1, 0.32);
    const explosao = suave(h, 0.34, 0.62);
    const junta = suave(h, 0.7, 0.97);
    const solida = suave(h, 0.955, 0.99);
    const virouEnxame = suave(h, 0.322, 0.338);

    // O sol incha e vibra na carga; depois da explosão o grupo volta ao tamanho base.
    const vibra = carga * (1 - virouEnxame) * Math.sin(t * 46) * 0.012;
    const escalaGrupo = ajuste * ESCALA_GRUPO_SOL * (1 + Math.sin(t * 0.8) * 0.012 + 0.17 * carga * (1 - explosao) + vibra);
    g.position.set(pose.x + e.mxs * 0.12, pose.y - e.mys * 0.08, 0);
    g.scale.setScalar(escalaGrupo);

    // Disco do sol: dá lugar às partículas (que estão exatamente onde ele estava) no instante da explosão.
    const sol = solRef.current;
    if (sol) {
      const m = sol.material as THREE.SpriteMaterial;
      m.opacity = 1 - virouEnxame;
      m.rotation = t * 0.02;
    }

    // Clarão: acende durante a carga e estoura no instante da explosão.
    const pico = Math.exp(-(((h - 0.335) / 0.032) ** 2));
    const brilho = Math.min(1, carga * 0.5 * (1 - explosao) + pico);
    const clarao = claraoRef.current;
    if (clarao) {
      clarao.visible = brilho > 0.003;
      clarao.scale.setScalar(3.1 + carga * 1.4 + pico * 6.5);
      (clarao.material as THREE.SpriteMaterial).opacity = brilho;
    }
    // Onda de choque: um anel que se expande a partir do ponto da explosão.
    const onda = suave(h, 0.336, 0.56);
    const anel = anelRef.current;
    if (anel) {
      anel.visible = onda > 0.003 && onda < 0.999;
      anel.scale.setScalar(2.6 + onda * 13);
      (anel.material as THREE.SpriteMaterial).opacity = Math.pow(1 - onda, 1.6) * 0.8;
    }

    // Planetas: espiralam para dentro, encolhem e somem antes da explosão (e da barra do topo).
    const mergulho = suave(h, 0.06, 0.3);
    const radial = Math.pow(1 - mergulho, 1.3);
    const encolher = 0.3 + 0.7 * (1 - mergulho);
    const presenca = 1 - suave(h, 0.26, 0.32);
    const topoMundo = viewport.height / 2;
    const margemTopo = viewport.height * (ALTURA_TOPO_PX / Math.max(1, tamanho.height));
    PLANETAS.forEach((p, i) => {
      const sp = sprites.current[i];
      if (!sp) return;
      const o = orbitas[i];
      const [x, y, z] = posicaoNaOrbita(p, o, o.fase + tempo.current * p.vel * (1 + carga * 5) + mergulho * (5 + i * 0.7));
      sp.position.set(x * radial, y * radial, z * radial);
      sp.scale.set(p.tamanho * encolher, p.tamanho * encolher, 1);
      const bordaSuperior = g.position.y + (y * radial + p.tamanho * 0.5) * g.scale.y;
      const faixaLivre = 1 - suave(bordaSuperior, topoMundo - margemTopo - 0.55, topoMundo - margemTopo);
      (sp.material as THREE.SpriteMaterial).opacity = presenca * faixaLivre;
    });

    // Enxame
    const mat = enxame.material as THREE.ShaderMaterial;
    const u = mat.uniforms;
    const alfa = virouEnxame * (1 - solida);
    enxame.visible = alfa > 0.003;
    u.uE.value = explosao;
    u.uJ.value = junta;
    u.uT.value = t;
    u.uAlpha.value = alfa;
    u.uSize.value = 0.085 * escalaGrupo;
    // pixels por unidade de cena à distância 1 (fov 36°): tamanho do ponto = tamanho_mundo * uScale / profundidade
    u.uScale.value = (tamanho.height * state.viewport.dpr) / (2 * Math.tan(THREE.MathUtils.degToRad(18)));
    // raio da gosma (em unidades locais do grupo) para onde as partículas convergem
    u.uTR.value = (RAIO_MALHA * pose.escala * ajuste) / escalaGrupo;
  });

  return (
    <group ref={grupo}>
      <sprite ref={solRef} scale={[ESCALA_SPRITE_SOL, ESCALA_SPRITE_SOL, 1]}>
        <spriteMaterial map={texSol} transparent depthWrite={false} toneMapped={false} />
      </sprite>
      {PLANETAS.map((p, i) => (
        <sprite
          key={p.tipo}
          ref={(el) => {
            sprites.current[i] = el;
          }}
          scale={[p.tamanho, p.tamanho, 1]}
        >
          <spriteMaterial map={texPlanetas[i]} transparent depthWrite={false} toneMapped={false} />
        </sprite>
      ))}
      <primitive object={enxame} />
      <sprite ref={claraoRef} visible={false} renderOrder={5}>
        <spriteMaterial map={texClarao} transparent depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} opacity={0} />
      </sprite>
      <sprite ref={anelRef} visible={false} renderOrder={5}>
        <spriteMaterial map={texAnel} transparent depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} opacity={0} />
      </sprite>
    </group>
  );
}

function Cena({ detalhe, leve }: { detalhe: number; leve: boolean }) {
  const materiaisPainel = useRef<THREE.LineBasicMaterial[]>([]);
  const grupo = useRef<THREE.Group>(null);
  const nucleo = useRef<THREE.Mesh>(null);
  const luzQuente = useRef<THREE.PointLight>(null);
  const luzFria = useRef<THREE.PointLight>(null);
  const luzContra = useRef<THREE.PointLight>(null);
  const alvo = useRef<AlvoNucleo>({ x: 0, y: 0, escala: 1 });
  const giro = useRef(0);
  const energia = useRef(0);
  const anterior = useRef(0);
  const cor = useMemo(() => new THREE.Color(), []);
  const viewport = useThree((s) => s.viewport);

  // Esta cena só LÊ o estado (já suavizado uma única vez em suavizarCena): nenhum amortecimento extra no scroll.
  useFrame((state, delta) => {
    const e = estadoCena;
    const pose = calcularAlvo(e, alvo.current);
    const ajuste = e.larga ? 1 : Math.min(1, viewport.width / 5.2);
    const t = state.clock.elapsedTime;

    // Energia do scroll: quanto mais rápido se rola, mais a gosma se agita (e acalma sozinha depois).
    const total = e.hero + e.historia + e.meio + e.fim;
    const velocidade = Math.abs(total - anterior.current) / Math.max(delta, 1 / 120);
    anterior.current = total;
    energia.current += (Math.min(1, velocidade * 0.7) - energia.current) * (1 - Math.exp(-5 * Math.min(delta, 0.05)));
    const en = energia.current;

    // ---- A gosma: condensa sobre as partículas no fim da junção e assume ----
    const solida = suave(e.hero, 0.955, 0.99);
    const formacao = suave(e.hero, 0.97, 1);
    const mistura = suave(e.historia, 0.12, 0.75);
    if (grupo.current) {
      grupo.current.visible = solida > 0.003;
      grupo.current.position.set(pose.x + e.mxs * 0.12, pose.y - e.mys * 0.08, 0);
      grupo.current.scale.setScalar(pose.escala * ajuste);
      grupo.current.rotation.y = e.mxs * 0.35;
      grupo.current.rotation.x = -e.mys * 0.2;
    }
    const malha = nucleo.current;
    if (malha) {
      // Rotação acumulada (integra a velocidade) para não dar saltos quando a velocidade muda com o scroll.
      giro.current += delta * (0.2 + e.historia * 0.25 + en * 1.1);
      malha.rotation.y = giro.current;
      malha.rotation.x = Math.sin(t * 0.43) * 0.28;
      malha.rotation.z = Math.sin(t * 0.31 + 1.2) * 0.2;

      // Forma que muda a cada cena da história (redonda → esticada → achatada), além do "respirar" contínuo.
      const cena2 = suave(e.historia, 0.26, 0.34) * (1 - suave(e.historia, 0.6, 0.68));
      const cena3 = suave(e.historia, 0.6, 0.68);
      malha.scale.set(
        1 + 0.17 * cena2 - 0.09 * cena3 + 0.045 * Math.sin(t * 1.1) + en * 0.08,
        1 - 0.13 * cena2 + 0.15 * cena3 + 0.05 * Math.sin(t * 1.3 + 1.3) - en * 0.05,
        1 + 0.05 * Math.sin(t * 0.9 + 2.1)
      );

      const material = malha.material as THREE.MeshPhysicalMaterial & { distort?: number };
      // Mesma cor do sol (miolo #ffc400), só um leve calor na história e no final. O brilho próprio é pequeno,
      // de propósito: com muito emissivo a gosma vira uma mancha chapada e perde o volume 3D.
      cor.copy(OURO).lerp(OURO_QUENTE, Math.min(1, mistura * 0.55 + e.fim * 0.3));
      material.color.copy(cor);
      material.emissive.copy(OURO);
      material.emissiveIntensity = 0.36 + mistura * 0.04 + en * 0.1;
      material.opacity = solida;
      // Distorção viva: base + respiração + cena da história + energia do scroll. Começa lisa no instante da troca.
      material.distort = Math.min(0.72, formacao * (0.4 + 0.1 * Math.sin(t * 0.9) + e.historia * 0.16 + e.fim * 0.1 + en * 0.3));
    }
    if (luzQuente.current) luzQuente.current.intensity = 22 + mistura * 10 + e.fim * 6 + en * 12;
    if (luzFria.current) luzFria.current.intensity = 14 - mistura * 5;
    if (luzContra.current) luzContra.current.intensity = 16 + en * 10;

    // Os painéis (slides) surgem na segunda cena da história e permanecem até o meio.
    const painel = suave(e.historia, 0.38, 0.8) * (1 - suave(e.meio, 0.05, 0.5));
    materiaisPainel.current.forEach((m) => {
      if (!m) return;
      m.opacity = painel * 0.85;
      const face = (m.userData as { face?: THREE.MeshBasicMaterial }).face;
      if (face) face.opacity = painel * 0.07;
    });

    // Câmera: aproxima ao longo da história e deriva levemente com o tempo e o mouse; treme na explosão.
    const h = e.hero;
    const tremor = Math.exp(-(((h - 0.345) / 0.035) ** 2)) * 0.07;
    state.camera.position.set(
      Math.sin(t * 0.12) * 0.14 + e.mxs * 0.3 + Math.sin(t * 61) * tremor,
      e.mys * -0.25 + Math.cos(t * 53) * tremor,
      7 - e.historia * 1.3 + e.meio * 1.1 - e.fim * 0.4
    );
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <ambientLight intensity={0.5} color="#fff2b8" />
      <pointLight ref={luzQuente} position={[-5, -1.5, 3.5]} color="#ffb21a" intensity={22} distance={30} decay={1.4} />
      <pointLight ref={luzFria} position={[5, 4, 2]} color="#fff1c7" intensity={14} distance={30} decay={1.4} />
      {/* Contraluz: desenha o contorno da gosma e dá volume ao lado escuro. */}
      <pointLight ref={luzContra} position={[1.5, 1, -5]} color="#ffc400" intensity={16} distance={30} decay={1.4} />
      {/* Reflexos: faixas nítidas em tons de ouro e branco-quente (nada de rosa, coral ou anel). */}
      <Environment resolution={leve ? 256 : 512} frames={1}>
        <Lightformer form="rect" intensity={7} color="#fff3c2" position={[-5, 1.5, 2]} scale={[2.2, 9, 1]} />
        <Lightformer form="rect" intensity={5} color="#ffe08a" position={[3, 5, -1]} scale={[9, 1.6, 1]} />
        <Lightformer form="rect" intensity={3} color="#ffd84a" position={[5, -2, 3]} scale={[1.1, 6, 1]} />
      </Environment>

      <Sol particulas={leve ? 4200 : 9500} />

      {/* A gosma, sem órbitas: só o corpo distorcido */}
      <group ref={grupo} visible={false}>
        <mesh ref={nucleo}>
          <icosahedronGeometry args={[RAIO_MALHA, detalhe]} />
          <MeshDistortMaterial
            color="#ffc400"
            emissive="#ffc400"
            emissiveIntensity={0.36}
            distort={0}
            speed={1.7}
            roughness={0.3}
            metalness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.18}
            envMapIntensity={1.25}
            transparent
            opacity={0}
            toneMapped={false}
          />
        </mesh>
      </group>

      {PAINEIS.slice(0, leve ? 2 : PAINEIS.length).map((_, i) => (
        <PainelVidro key={i} indice={i} borda={materiaisPainel} />
      ))}
      <Particulas quantidade={leve ? 300 : 800} />
    </>
  );
}

/**
 * Dono do relógio de desenho. O Canvas roda em frameloop "demand" e este componente pede um quadro por
 * tick do gsap.ticker (o mesmo relógio que alimenta o ScrollTrigger e a suavização da cena), então o
 * desenho acompanha o scroll sem um segundo laço de rAF. Sem limite fixo de fps: só passa para 30 fps
 * se o PerformanceMonitor medir queda persistente, já com a resolução no mínimo (`limitar30`).
 * Telas de 120 Hz ou mais são limitadas a ~75 quadros por segundo para poupar GPU.
 */
function Relogio({ ativa, limitar30 }: { ativa: boolean; limitar30: boolean }) {
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    if (!ativa) return;
    let ultimo = 0;
    let pular = false;
    const passo = (tempo: number) => {
      if (limitar30) {
        pular = !pular;
        if (pular) return;
      } else if (tempo - ultimo < 1 / 75) {
        return;
      }
      ultimo = tempo;
      invalidate();
    };
    gsap.ticker.add(passo);
    return () => {
      gsap.ticker.remove(passo);
    };
  }, [ativa, limitar30, invalidate]);

  return null;
}

export default function CenaNucleo({ leve, ativa, onPronta, onFalha }: CenaNucleoProps) {
  const dprMaximo = Math.min(typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1, leve ? 1.5 : DPR_MAXIMO);
  const [dpr, setDpr] = useState(dprMaximo);
  // Economia adaptativa: só liga se o fps medido cair; por padrão a cena roda no máximo da qualidade.
  const [economia, setEconomia] = useState(false);

  // Malha lisa por padrão; mais simples só em celular ou depois de queda de fps persistente.
  const detalhe = leve || economia ? 24 : 44;

  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 0, 7], fov: 36, near: 0.1, far: 60 }}
      gl={{ antialias: !leve, alpha: true, powerPreference: 'high-performance' }}
      frameloop="demand"
      style={{ pointerEvents: 'none' }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.domElement.addEventListener('webglcontextlost', (ev) => {
          ev.preventDefault();
          onFalha();
        });
        onPronta();
      }}
    >
      {/* Mede o fps real: abaixo de ~50 baixa a resolução; se ainda assim não der, passa a 30 fps e simplifica a malha. */}
      <PerformanceMonitor
        factor={1}
        onChange={({ factor }) => {
          setDpr(Math.max(1, 1 + (dprMaximo - 1) * factor));
          if (factor <= 0.02) setEconomia(true);
          else if (factor >= 0.6) setEconomia(false);
        }}
      />
      <Relogio ativa={ativa} limitar30={economia} />
      <Cena detalhe={detalhe} leve={leve} />
    </Canvas>
  );
}
