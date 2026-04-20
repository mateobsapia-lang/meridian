import { useState, useRef } from 'react';
import { Modal } from '../components/Modal';
import { useAppContext } from '../AppContext';
import { createNotification } from '../lib/firestore';

type AnalysisResult = {
  score: number;
  revenue: number | null;
  ebitda: number | null;
  summary: string;
  strengths: string[];
  concerns: string[];
  recommendation: 'approve' | 'review' | 'reject';
  needsManualReview: boolean;
  reason?: string;
};

export function AIAnalysisModal({ isOpen, onClose, onApprove }: {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (data: Partial<AnalysisResult>) => void;
}) {
  const { user, showToast } = useAppContext();
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const analyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setResult(null);

    try {
      const base64 = await toBase64(file);
      const isPDF = file.type === 'application/pdf';

      const prompt = `Sos un analista senior de M&A especializado en PyMEs argentinas. 
Analizá el documento adjunto (puede ser un balance, estado de resultados, o información financiera de una empresa).

Extraé y analizá:
1. Revenue/Ventas totales (último período disponible, en USD o ARS)
2. EBITDA o resultado operativo
3. Tendencia de crecimiento
4. Deudas o pasivos significativos
5. Fortalezas del negocio
6. Riesgos o alertas

Respondé SOLO en JSON válido con esta estructura exacta:
{
  "score": número del 0 al 100,
  "revenue": número en USD (null si no podés determinarlo),
  "ebitda": número en USD (null si no podés determinarlo),
  "summary": "resumen ejecutivo de 2-3 oraciones",
  "strengths": ["fortaleza 1", "fortaleza 2"],
  "concerns": ["preocupación 1", "preocupación 2"],
  "recommendation": "approve" | "review" | "reject",
  "needsManualReview": boolean,
  "reason": "razón si needsManualReview es true"
}

Si el documento no tiene información financiera suficiente, poné needsManualReview: true.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: [
              ...(isPDF ? [{
                type: 'document',
                source: { type: 'base64', media_type: 'application/pdf', data: base64 }
              }] : [{
                type: 'image',
                source: { type: 'base64', media_type: file.type, data: base64 }
              }]),
              { type: 'text', text: prompt }
            ]
          }]
        })
      });

      const data = await response.json();
      const text = data.content?.[0]?.text ?? '';
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed: AnalysisResult = JSON.parse(clean);
      setResult(parsed);

      // Si necesita revisión manual, notificar al admin
      if (parsed.needsManualReview && user) {
        // En producción esto debería ir a una colección de admin reviews
        await createNotification(
          'ADMIN_UID', // Reemplazar con UID real del admin
          'nda_request',
          '⚠ Revisión manual requerida',
          `Un vendedor subió documentos que requieren revisión manual: ${file.name}`,
        );
        showToast('Enviado a revisión manual — te contactaremos en 48hs');
      }

    } catch (err) {
      // Si falla la IA, pedir revisión manual
      setResult({
        score: 0,
        revenue: null,
        ebitda: null,
        summary: 'No se pudo analizar el documento automáticamente.',
        strengths: [],
        concerns: [],
        recommendation: 'review',
        needsManualReview: true,
        reason: 'Error en el análisis automático — revisión manual requerida'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const SCORE_COLOR = (s: number) => s >= 70 ? 'text-[#4ade80]' : s >= 40 ? 'text-amber-400' : 'text-red-400';
  const REC_LABEL = { approve: '✅ Apto para publicar', review: '⚠ Requiere revisión', reject: '❌ No apto' };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Análisis de Documentos con IA">
      <div className="flex flex-col gap-6">
        <div className="bg-accent-light border border-accent/20 p-4 text-[12px] text-accent">
          📄 Subí el balance o estado de resultados de tu empresa. Nuestra IA lo analizará en segundos y generará un score de calidad para agilizar la publicación.
        </div>

        {/* Upload area */}
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-border-strong hover:border-accent transition-colors p-8 text-center cursor-pointer"
        >
          <div className="text-3xl mb-3">📊</div>
          <div className="font-medium text-ink text-[14px]">
            {file ? file.name : 'Click para subir documento'}
          </div>
          <div className="text-[11px] text-ink-mute mt-1">PDF, imagen · Balance, estado de resultados, flujo de caja</div>
          <input ref={fileRef} type="file" className="hidden" onChange={handleFile}
            accept=".pdf,image/*" />
        </div>

        {file && !result && (
          <button onClick={analyze} disabled={analyzing} className="btn-primary w-full">
            {analyzing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analizando con IA...
              </span>
            ) : 'Analizar documento →'}
          </button>
        )}

        {/* Result */}
        {result && (
          <div className="flex flex-col gap-4">
            <div className="border border-border-strong bg-paper-deep p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-widest text-ink-mute mb-1">Score de calidad</div>
                  <div className={`font-serif text-[48px] font-bold ${SCORE_COLOR(result.score)}`}>{result.score}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[9px] uppercase tracking-widest text-ink-mute mb-1">Recomendación</div>
                  <div className="font-medium text-[13px] text-ink">{REC_LABEL[result.recommendation]}</div>
                </div>
              </div>
              <p className="text-[13px] text-ink-soft leading-relaxed border-t border-border-subtle pt-4">{result.summary}</p>
            </div>

            {result.revenue && (
              <div className="grid grid-cols-2 gap-3 text-[12px]">
                <div className="border border-border-subtle p-3">
                  <div className="font-mono text-[9px] text-ink-mute uppercase tracking-widest mb-1">Revenue detectado</div>
                  <div className="font-mono font-medium text-ink">USD {(result.revenue / 1000).toFixed(0)}K</div>
                </div>
                {result.ebitda && (
                  <div className="border border-border-subtle p-3">
                    <div className="font-mono text-[9px] text-ink-mute uppercase tracking-widest mb-1">EBITDA detectado</div>
                    <div className="font-mono font-medium text-ink">USD {(result.ebitda / 1000).toFixed(0)}K</div>
                  </div>
                )}
              </div>
            )}

            {result.strengths.length > 0 && (
              <div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-ink-mute mb-2">Fortalezas</div>
                {result.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-[12px] text-ink-soft py-1">
                    <span className="text-[#4ade80] shrink-0">✓</span> {s}
                  </div>
                ))}
              </div>
            )}

            {result.concerns.length > 0 && (
              <div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-ink-mute mb-2">Alertas</div>
                {result.concerns.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 text-[12px] text-ink-soft py-1">
                    <span className="text-amber-400 shrink-0">⚠</span> {c}
                  </div>
                ))}
              </div>
            )}

            {result.needsManualReview ? (
              <div className="bg-amber-50 border border-amber-300 p-4 text-[12px] text-amber-800">
                <strong>Revisión manual requerida.</strong> {result.reason ?? 'Nuestro equipo revisará tu documentación y te contactará en 24-48hs hábiles.'}
              </div>
            ) : (
              <button onClick={() => onApprove({ revenue: result.revenue ?? undefined, ebitda: result.ebitda ?? undefined })}
                className="btn-primary w-full">
                Continuar con estos datos →
              </button>
            )}

            <button onClick={() => { setResult(null); setFile(null); }}
              className="text-[11px] font-mono text-ink-mute hover:text-ink text-center">
              Subir otro documento
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
