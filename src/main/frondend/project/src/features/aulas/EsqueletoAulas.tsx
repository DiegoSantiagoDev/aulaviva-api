export default function EsqueletoAulas() {
  return (
    <div className="space-y-10 animate-pulse">
      {[1, 2].map((secao) => (
        <div key={secao} className="space-y-4">
          <div className="h-6 w-40 bg-gold/20 rounded-md" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((card) => (
              <div
                key={card}
                className="art-frame rounded-2xl p-6 border border-gold/20 space-y-4 h-48 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div className="h-4 w-20 bg-ink/10 rounded-full" />
                    <div className="h-4 w-24 bg-ink/10 rounded-full" />
                  </div>
                  <div className="h-6 w-3/4 bg-ink/15 rounded-md mb-2" />
                  <div className="h-4 w-1/2 bg-ink/10 rounded-md" />
                </div>
                <div className="pt-4 border-t border-gold/15 flex justify-between">
                  <div className="h-4 w-16 bg-ink/10 rounded" />
                  <div className="h-4 w-20 bg-ink/10 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
