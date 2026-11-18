/**
 * Núcleo do Aula Viva em CSS puro: a versão leve do objeto 3D da página inicial.
 * Serve de alternativa quando não há WebGL, em "movimento reduzido" e nas telas de acesso.
 */
export default function NucleoCSS({ className = '' }: { className?: string }) {
  return (
    <div className={`av-nucleo ${className}`} aria-hidden="true">
      <span className="av-nucleo-halo" />
      <span className="av-nucleo-esfera" />
      <span className="av-nucleo-anel av-nucleo-anel-a" />
      <span className="av-nucleo-anel av-nucleo-anel-b" />
      <span className="av-nucleo-satelite" />
    </div>
  );
}
