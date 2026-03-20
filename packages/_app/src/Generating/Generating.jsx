import { useStore } from '@nanostores/react'
import { $isGenerating, $generatingProgress } from '@agentix/store'
import { useNavigate } from 'raviger'
import { useEffect, useRef } from 'react'

const steps = [
  'Analyse du sujet…',
  'Génération des modules…',
  'Création des thèmes…',
  'Ajout des outils pédagogiques…',
]

const MIN_DISPLAY_MS = 2000

export default function Generating() {
  const isGenerating = useStore($isGenerating)
  const progress = useStore($generatingProgress)
  const navigate = useNavigate()
  const mountedAt = useRef(Date.now())

  const { current, total } = progress
  const percent = total === 0 ? 0 : Math.min(100, Math.round((current / total) * 100))
  const stepLabel = steps[current] ?? steps[steps.length - 1]

  useEffect(() => {
    // accès direct sans génération → redirect immédiate
    if (!isGenerating && total === 0) {
      navigate('/home')
      return
    }
    if (!isGenerating && total > 0) {
      const elapsed = Date.now() - mountedAt.current
      const delay = Math.max(500, MIN_DISPLAY_MS - elapsed)
      const timeout = setTimeout(() => navigate('/home'), delay)
      return () => clearTimeout(timeout)
    }
  }, [isGenerating, total])

  return (
    <div style={{
      height: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 32,
      backgroundColor: '#f8f9fb',
    }}>
      {/* Spinner */}
      <div style={{
        width: 64,
        height: 64,
        border: '5px solid #e5e7eb',
        borderTop: '5px solid #2F52E0',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />

      {/* Titre */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
          Génération de l'arbre en cours
        </p>
        <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: '#6b7280' }}>
          {stepLabel}
        </p>
      </div>

      {/* Barre de progression */}
      <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{
          width: '100%',
          height: 10,
          backgroundColor: '#e5e7eb',
          borderRadius: 99,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${percent}%`,
            backgroundColor: '#2F52E0',
            borderRadius: 99,
            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }} />
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          color: '#9ca3af',
        }}>
          <span>Étape {current} / {total}</span>
          <span>{percent}%</span>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
