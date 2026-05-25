'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function CobrosClient({ initialLeads }: { initialLeads: any[] }) {
  const [leads, setLeads] = useState(initialLeads)
  const supabase = createClient()

  async function markPaid(id: number) {
    await supabase.from('leads').update({ pago_confirmado: true }).eq('id', id)
    setLeads(prev => prev.map(l => l.id === id ? { ...l, pago_confirmado: true } : l))
  }

  const totalCobrado = leads.filter(l => l.pago_confirmado).length * 120000
  const pendiente = leads.filter(l => !l.pago_confirmado).length * 120000

  return (
    <>
      <div className="metrics metrics-3">
        <div className="metric-card">
          <div className="metric-value green">${totalCobrado.toLocaleString('es-CL')}</div>
          <div className="metric-label">Cobrado</div>
        </div>
        <div className="metric-card">
          <div className="metric-value red">${pendiente.toLocaleString('es-CL')}</div>
          <div className="metric-label">Pendiente</div>
          {leads.filter(l => !l.pago_confirmado).length > 0 && (
            <div className="metric-sub warn">{leads.filter(l => !l.pago_confirmado).length} alumnos</div>
          )}
        </div>
        <div className="metric-card">
          <div className="metric-value">{leads.length}</div>
          <div className="metric-label">Alumnos activos</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Estado de pagos</span></div>
        {leads.map(l => (
          <div key={l.id} className="cobro-row">
            <div className="cobro-info">
              <div className="cobro-name">{l.nombre}</div>
              <div className="cobro-meta">{l.grupos?.nombre || 'Sin grupo asignado'}</div>
            </div>
            <span className={`pill ${l.pago_confirmado ? 'pill-paid' : 'pill-unpaid'}`}>
              {l.pago_confirmado ? 'Pagado' : 'Pendiente'}
            </span>
            <span className="cobro-amount" style={{ color: l.pago_confirmado ? 'var(--cream)' : 'var(--red)' }}>
              $120.000
            </span>
            {l.pago_confirmado ? (
              <button className="btn btn-sm" style={{ color: 'var(--dim)', cursor: 'default' }} disabled>✓ Ok</button>
            ) : (
              <button className="btn btn-sm btn-success-ghost" onClick={() => markPaid(l.id)}>
                Marcar pagado
              </button>
            )}
          </div>
        ))}
        {leads.length === 0 && (
          <div style={{ padding: '20px 14px', fontSize: 12, color: 'var(--dim)' }}>Sin alumnos inscritos aún</div>
        )}
      </div>
    </>
  )
}
