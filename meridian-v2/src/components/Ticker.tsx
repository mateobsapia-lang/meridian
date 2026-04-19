import { deals } from '../data';

export function Ticker() {
  const tickerItems = [...deals, ...deals, ...deals]; // Triple to ensure smooth infinite loop

  return (
    <div className="bg-ink overflow-hidden py-[9px] border-b border-white/10" aria-hidden="true">
      <div className="flex animate-tick whitespace-nowrap w-max">
        {tickerItems.map((d, i) => (
          <div key={i} className="flex items-center gap-[18px] px-9 font-mono text-[11px] text-white/55 border-r border-white/10">
            <span className="text-white/85 font-medium">{d.id}</span>
            <span className="bg-white/10 px-[7px] py-[1px] rounded-sm text-[10px] text-white/50">{d.industry}</span>
            <span>{d.region}</span>
            <span className="text-white">EBITDA {d.ebitda}</span>
            <span className={parseFloat(d.growth) > 15 ? 'text-[#4ade80]' : 'text-[#f87171]'}>{d.growth}</span>
            <span>{d.asking}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
