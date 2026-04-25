import { useState } from 'react';
import { Modal } from '../components/Modal';
import { useAppContext } from '../AppContext';
import { saveDiagnosticoLead } from '../lib/firestore';

const PREGUNTAS = [
  { id:'contabilidad', text:'¿Tenés estados contables auditados de los últimos 2 años?', opciones:['Sí, auditados','Sí, sin auditar','No tengo'] },
  { id:'dependencia', text:'¿Qué % de las ventas depende de tu presencia personal?', opciones:['Menos del 20%','20% a 50%','Más del 50%'] },
  { id:'contratos', text:'¿Tus principales clientes tienen contratos escritos vigentes?', opciones:['Todos tienen contrato','Algunos tienen','Sin contratos formales'] },
  { id:'concentracion', text:'¿Cuánto representa tu cliente más grande en tu facturación?', opciones:['Menos del 20%','20% al 40%','Más del 40%'] },
  { id:'equipo', text:'¿Tu equipo puede operar sin vos por 30 días?', opciones:['Sí, sin problema','Con algunas dificultades','No podría'] },
  { id:'sistemas', text:'¿Tenés sistemas/procesos documentados (ERP, CRM, manuales)?', opciones:['Sí, completos','Parcialmente','No tenemos'] },
  { id:'crecimiento', text:'¿Tu revenue creció en los últimos 3 años?', opciones:['Sí, consistentemente','+/- estable','Bajó o variable'] },
  { id:'deuda', text:'¿Cuál es tu nivel de deuda financiera vs. EBITDA?', opciones:['Menos de 1×','1× a 2×','Más de 2×'] },
];

const PUNTAJE: Record<string,number> = {
  'Sí, auditados':15, 'Sí, sin auditar':8, 'No tengo':0,
  'Menos del 20%':15, '20% a 50%':8, 'Más del 50%':0,
  'Todos tienen contrato':12, 'Algunos tienen':6, 'Sin contratos formales':0,
  'Menos del 20%':12, '20% al 40%':6, 'Más del 40%':0,
  'Sí, sin problema':12, 'Con algunas dificultades':6, 'No podría':0,
  'Sí, completos':10, 'Parcialmente':5, 'No tenemos':0,
  'Sí, consistentemente':12, '+/- estable':6, 'Bajó o variable':0,
  'Menos de 1×':12, '1× a 2×':6, 'Más de 2×':0,
};

type Paso = 'intro' | 'preguntas' | 'email' | 'resultado';

export function DiagnosticoModal() {
  const { isDiagnosticoOpen, setDiagnosticoOpen, showToast, setSellerWizardOpen } = useAppContext();
  const [paso, setPaso] = useState<Paso>('intro');
  const [idx, setIdx] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string,string>>({});
  const [email, setEmail] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<{
    score:number; label:string; diagnostico:string;
    criticos:string[]; recomendaciones:string[];
  } | null>(null);

  const reset = () => {
    setPaso('intro'); setIdx(0); setRespuestas({});
    setEmail(''); setEmpresa(''); setResultado(null);
  };

  const calcScore = (resp: Record<string,string>) => {
    let total = 0;
    Object.values(resp).forEach(r => { total += PUNTAJE[r] ?? 0; });
    return Math.round(total);
  };

  const getLabel = (s:number) =>
    s >= 80 ? '🟢 Lista para el mercado' :
    s >= 60 ? '🟡 Casi lista — mejoras menores' :
    s >= 40 ? '🟠 En desarrollo — 6-12 meses de trabajo' :
    '🔴 Requiere reestructuración antes de vender';

  const getCriticos = (resp: Record<string,string>) => {
    const c: string[] = [];
    if (resp['dependencia'] === 'Más del 50%') c.push('Alta dependencia del dueño — reduce valuación 30-40%');
    if (resp['contabilidad'] === 'No tengo') c.push('Sin estados contables — ningún comprador serio puede avanzar');
    if (resp['concentracion'] === 'Más del 40%') c.push('Concentración de clientes — comprador descuenta riesgo de churn');
    if (resp['contratos'] === 'Sin contratos formales') c.push('Sin contratos escritos — el revenue no es "garantizable"');
    if (resp['equipo'] === 'No podría') c.push('Operación personalista — el comprador está comprando un trabajo, no un negocio');
    if (resp['deuda'] === 'Más de 2×') c.push('Apalancamiento alto — limita el precio neto que recibís');
    return c;
  };

  const getRecs = (resp: Record<string,string>) => {
    const r: string[] = [];
    if (resp['contabilidad'] !== 'Sí, auditados') r.push('Contratá un estudio contable para auditar los últimos 2 ejercicios');
    if (resp['dependencia'] !== 'Menos del 20%') r.push('Delegá funciones comerciales clave a un equipo antes de salir al mercado');
    if (resp['contratos'] !== 'Todos tienen contrato') r.push('Formalizá contratos con los 5 clientes principales');
    if (resp['sistemas'] !== 'Sí, completos') r.push('Documentá procesos operativos clave en un manual de operaciones');
    if (resp['equipo'] !== 'Sí, sin problema') r.push('Delimitá responsabilidades y entrená al segundo nivel de management');
    return r.slice(0,4);
  };

  const handleRespuesta = (opcion: string) => {
    const p = PREGUNTAS[idx];
    const nuevas = { ...respuestas, [p.id]: opcion };
    setRespuestas(nuevas);
    if (idx < PREGUNTAS.length - 1) { setIdx(idx + 1); }
    else { setPaso('email'); }
  };

  const handleSubmit = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const score = calcScore(respuestas);
      const criticos = getCriticos(respuestas);
      const recomendaciones = getRecs(respuestas);
      const label = getLabel(score);

      // Generar diagnóstico con IA
      let diagnostico = '';
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 300,
            messages: [{
              role: 'user',
              content: `Sos un analista senior de M&A en Argentina. Una empresa respondió este diagnóstico de vendibilidad:
Respuestas: ${JSON.stringify(respuestas)}
Score total: ${score}/100
Factores críticos: ${criticos.join(', ')}

Escribí UN párrafo de 3-4 oraciones en español, directo y sin rodeos, que explique:
1. Qué tan lista está esta empresa para venderse
2. El factor más importante que afecta su valuación
3. El primer paso concreto que debería dar

Sin saludos, sin títulos. Solo el párrafo.`,
            }],
          }),
        });
        const data = await res.json();
        diagnostico = data.content?.[0]?.text ?? '';
      } catch {
        diagnostico = `Con un score de ${score}/100, esta empresa ${score >= 60 ? 'está en buena posición para salir al mercado' : 'requiere trabajo previo antes de buscar compradores'}. ${criticos[0] ?? 'Focalicen en mejorar la documentación financiera y la independencia operativa.'}`;
      }

      await saveDiagnosticoLead({
        email, empresa, respuestas, score,
        scoreLabel: label, diagnostico, factoresCriticos: criticos, recomendaciones,
      });

      setResultado({ score, label, diagnostico, criticos, recomendaciones });
      setPaso('resultado');
    } catch { showToast('Error al procesar. Intentá de nuevo.'); }
    finally { setLoading(false); }
  };

  const progress = Math.round((idx / PREGUNTAS.length) * 100);

  return (
    <Modal isOpen={isDiagnosticoOpen} onClose={() => { setDiagnosticoOpen(false); setTimeout(reset,300); }}
      title="Diagnóstico de Vendibilidad" maxWidth="max-w-[520px]">

      {paso === 'intro' && (
        <div className="flex flex-col gap-6">
          <div className="bg-accent-light border border-accent/20 p-5">
            <div className="font-mono text-[9px] uppercase tracking-widest text-accent mb-2">Herramienta gratuita · 5 minutos</div>
            <h3 className="font-serif text-[20px] font-bold text-ink mb-2">¿Qué tan vendible es tu empresa hoy?</h3>
            <p className="text-[13px] text-ink-soft leading-relaxed">
              8 preguntas. Análisis con IA. Recibís un score 0-100 con los factores que más impactan tu valuación y qué hacer antes de salir al mercado.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-[13px] text-ink-soft">
            {['Factores que reducen tu precio de venta','Qué arreglar antes de buscar compradores','Estimación de impacto en valuación'].map(b => (
              <div key={b} className="flex items-center gap-2"><span className="text-accent">✓</span> {b}</div>
            ))}
          </div>
          <button onClick={() => setPaso('preguntas')} className="btn-primary w-full">
            Comenzar diagnóstico →
          </button>
        </div>
      )}

      {paso === 'preguntas' && (
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex justify-between text-[10px] font-mono text-ink-mute mb-2">
              <span>Pregunta {idx+1} de {PREGUNTAS.length}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-1 bg-border-strong">
              <div className="h-1 bg-accent transition-all duration-300" style={{ width:`${progress}%` }} />
            </div>
          </div>
          <div className="min-h-[60px]">
            <h3 className="font-serif text-[18px] font-bold text-ink leading-snug">
              {PREGUNTAS[idx].text}
            </h3>
          </div>
          <div className="flex flex-col gap-2">
            {PREGUNTAS[idx].opciones.map(op => (
              <button key={op} onClick={() => handleRespuesta(op)}
                className="text-left px-5 py-4 border border-border-strong hover:border-accent hover:bg-accent-light transition-all text-[13px] text-ink">
                {op}
              </button>
            ))}
          </div>
          {idx > 0 && (
            <button onClick={() => setIdx(idx-1)} className="text-[10px] font-mono text-ink-mute hover:text-ink">← Anterior</button>
          )}
        </div>
      )}

      {paso === 'email' && (
        <div className="flex flex-col gap-5">
          <div className="bg-paper-deep border border-border-strong p-5 text-center">
            <div className="font-mono text-[9px] uppercase tracking-widest text-ink-mute mb-2">Listo para procesar</div>
            <p className="text-[13px] text-ink-soft">Completaste las {PREGUNTAS.length} preguntas. Ingresá tu email para recibir el análisis completo.</p>
          </div>
          <div>
            <label className="block font-mono text-[9px] uppercase tracking-[0.12em] text-ink-mute mb-1.5">Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
              className="w-full border border-border-strong bg-paper text-ink text-[13px] px-3 py-2.5 focus:outline-none focus:border-accent transition-colors"
              placeholder="tu@empresa.com" />
          </div>
          <div>
            <label className="block font-mono text-[9px] uppercase tracking-[0.12em] text-ink-mute mb-1.5">Nombre de empresa (opcional)</label>
            <input type="text" value={empresa} onChange={e=>setEmpresa(e.target.value)}
              className="w-full border border-border-strong bg-paper text-ink text-[13px] px-3 py-2.5 focus:outline-none focus:border-accent transition-colors"
              placeholder="Ej: Soluciones del Sur" />
          </div>
          <button onClick={handleSubmit} disabled={!email || loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                Analizando con IA...
              </span>
            ) : 'Ver mi diagnóstico →'}
          </button>
          <p className="text-[10px] text-ink-mute text-center font-mono">Confidencial · Sin spam · Proceso 100% privado</p>
        </div>
      )}

      {paso === 'resultado' && resultado && (
        <div className="flex flex-col gap-5">
          {/* Score */}
          <div className="border border-border-strong bg-paper-deep p-6 text-center">
            <div className="font-mono text-[9px] uppercase tracking-widest text-ink-mute mb-2">Score de Vendibilidad</div>
            <div className={`font-serif text-[64px] font-bold leading-none mb-2 ${
              resultado.score >= 80 ? 'text-[#16a34a]' : resultado.score >= 60 ? 'text-amber-500' : resultado.score >= 40 ? 'text-orange-500' : 'text-red-500'
            }`}>{resultado.score}</div>
            <div className="text-[12px] font-medium text-ink">{resultado.label}</div>
          </div>

          {/* Diagnóstico IA */}
          <div className="border-l-2 border-accent pl-4">
            <div className="font-mono text-[9px] uppercase tracking-widest text-ink-mute mb-2">Análisis Meridian</div>
            <p className="text-[13px] text-ink-soft leading-relaxed">{resultado.diagnostico}</p>
          </div>

          {/* Factores críticos */}
          {resultado.criticos.length > 0 && (
            <div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-ink-mute mb-2">Factores que reducen tu precio</div>
              {resultado.criticos.map((c,i) => (
                <div key={i} className="flex items-start gap-2 text-[12px] text-ink-soft py-1.5 border-b border-border-subtle last:border-none">
                  <span className="text-red-400 shrink-0 mt-0.5">▼</span>{c}
                </div>
              ))}
            </div>
          )}

          {/* Recomendaciones */}
          {resultado.recomendaciones.length > 0 && (
            <div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-ink-mute mb-2">Próximos pasos</div>
              {resultado.recomendaciones.map((r,i) => (
                <div key={i} className="flex items-start gap-2 text-[12px] text-ink-soft py-1.5 border-b border-border-subtle last:border-none">
                  <span className="text-accent shrink-0 mt-0.5">→</span>{r}
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="bg-ink text-white p-6 flex flex-col gap-3">
            <div className="font-serif text-[17px] font-bold">
              {resultado.score >= 60 ? 'Tu empresa está lista. Conectate con compradores reales.' : 'Te ayudamos a mejorar este score antes de salir al mercado.'}
            </div>
            <p className="text-[12px] text-white/60">Sin costos anticipados. 5% solo si cerrás.</p>
            <button onClick={() => { setDiagnosticoOpen(false); setTimeout(reset,300); setSellerWizardOpen(true); }}
              className="bg-accent text-white text-[10px] font-medium tracking-[0.15em] uppercase py-3 px-6 hover:bg-accent/90 transition-colors w-full">
              Listar mi empresa en Meridian →
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
