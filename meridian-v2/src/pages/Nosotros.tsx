export function Nosotros() {
  const team = [
    { name: 'Martín Elizalde', role: 'Managing Partner', prev: 'Ex-JPMorgan' },
    { name: 'Sofía Ledesma', role: 'Director M&A', prev: 'Ex-McKinsey' },
    { name: 'Tomás Costa', role: 'Legal & Compliance', prev: 'Marval O\'Farrell' },
    { name: 'Clara Miguez', role: 'Sr. Analyst', prev: 'Ex-PwC Deal Advisory' },
    { name: 'Lucas Pardo', role: 'Sr. Analyst', prev: 'Ex-Deloitte' },
    { name: 'Valentina Rey', role: 'Operations', prev: 'Ex-MercadoLibre' },
  ];

  return (
    <div className="animate-in fade-in duration-500 py-16 md:py-24">
      <div className="container-custom">
        <div className="max-w-[600px] mb-16">
          <p className="eyebrow eyebrow-accent mb-3">El Equipo</p>
          <h1 className="font-serif text-[40px] md:text-[56px] font-bold text-ink leading-[1.05] tracking-[-0.02em] mb-6">
            Rigor analítico y <em className="italic text-accent">experiencia</em> institucional.
          </h1>
          <p className="text-[16px] text-ink-soft leading-[1.65] font-light">
            Nuestro equipo combina experiencia en banca de inversión, consultoría estratégica y derecho corporativo corporativo para estructurar operaciones impecables.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12">
          {team.map((member, i) => (
            <div key={i} className="flex flex-col">
              <div className="w-full aspect-[4/5] bg-paper-deep grayscale mb-4">
                <img 
                  src={`https://picsum.photos/seed/${member.name.replace(' ', '')}/400/500`}
                  alt={member.name}
                  className="w-full h-full object-cover mix-blend-multiply opacity-80"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h3 className="font-serif text-[18px] font-bold text-ink mb-1">{member.name}</h3>
              <p className="text-[12px] text-accent font-medium tracking-[0.05em] uppercase mb-1">{member.role}</p>
              <p className="font-mono text-[10px] text-ink-mute">{member.prev}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
