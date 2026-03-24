import { useStore } from '@nanostores/react'
import { useRef, useLayoutEffect, useEffect } from 'react'
import {
  $nodes,
  $edges,
  $setRootNode,
  $rootnode,
  $LearnResponses,
  $ExerciseFullResponse,
  $QcmFullResponse,
  $isPanelOpen,
} from '@agentix/store'

// ---------- tree parsing ----------

function buildCourseTree(nodes, edges) {
  if (!nodes.length) return { root: null, chapters: [] }

  const childrenOf = {}
  const parentOf = {}

  for (const edge of edges) {
    if (!childrenOf[edge.source]) childrenOf[edge.source] = []
    childrenOf[edge.source].push(edge.target)
    parentOf[edge.target] = edge.source
  }

  const structural = nodes.filter((n) => !n.sourceNodeId)
  const structuralIds = new Set(structural.map((n) => n.id))
  const root = structural.find((n) => !structuralIds.has(parentOf[n.id]))
  if (!root) return { root: null, chapters: [] }

  const chapters = (childrenOf[root.id] || [])
    .map((id) => nodes.find((n) => n.id === id))
    .filter((n) => n && !n.sourceNodeId)
    .map((gc) => ({
      ...gc,
      subChapters: (childrenOf[gc.id] || [])
        .map((id) => nodes.find((n) => n.id === id))
        .filter((n) => n && !n.sourceNodeId),
    }))

  return { root, chapters }
}

// ---------- zigzag offsets ----------

const OFFSETS = [-80, -45, 0, 45, 80, 45, 0, -45]

// ---------- ChapterBanner ----------

function ChapterBanner({ chapter, index }) {
  return (
    <div
      style={{
        margin: '36px auto 8px',
        maxWidth: 460,
        width: 'calc(100% - 48px)',
        background: 'linear-gradient(135deg, #2F52E0 0%, #1a3bbf 100%)',
        borderRadius: 18,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 0 #1530a0',
      }}>
      <div>
        <div
          style={{
            color: 'rgba(255,255,255,0.8)',
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}>
          Chapitre {index + 1}
        </div>
        <div
          style={{
            color: '#fff',
            fontWeight: 800,
            fontSize: '1rem',
            marginTop: 4,
            maxWidth: 280,
          }}>
          {chapter.data?.label || 'Sans titre'}
        </div>
      </div>
      <div
        style={{
          width: 44,
          height: 44,
          background: 'rgba(255,255,255,0.2)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem',
          flexShrink: 0,
        }}>
        📖
      </div>
    </div>
  )
}

// ---------- PathNode ----------

function PathNode({ node, offset, isSelected, status, circleRef, onClick }) {
  const label = node.data?.label || 'Sans titre'

  const bg =
    status === 'done' ? '#58cc02'
    : status === 'partial' ? '#ffc800'
    : '#e5e7eb'

  const shadow =
    status === 'done' ? '0 6px 0 #46a002'
    : status === 'partial' ? '0 6px 0 #cc9c00'
    : '0 6px 0 #b0b8c1'

  const icon = status === 'done' ? '⭐' : status === 'partial' ? '📝' : '🔒'

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '10px 0',
      }}>
      <div
        style={{
          transform: `translateX(${offset}px)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          maxWidth: 180,
        }}>
        {/* label — toujours visible, sans troncature */}
        <div
          style={{
            background: isSelected ? '#2F52E0' : '#fff',
            border: `2px solid ${isSelected ? '#2F52E0' : '#e5e7eb'}`,
            borderRadius: 12,
            padding: '5px 12px',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: isSelected ? '#fff' : '#374151',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            textAlign: 'center',
            lineHeight: 1.4,
            transition: 'background 0.2s, color 0.2s',
          }}>
          {label}
        </div>

        <button
          ref={circleRef}
          onClick={onClick}
          title={label}
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            border: isSelected ? '3px solid #1cb0f6' : '3px solid transparent',
            background: isSelected ? '#1cb0f6' : bg,
            boxShadow: isSelected ? '0 6px 0 #0a8fc3' : shadow,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            transform: isSelected ? 'scale(1.12)' : 'scale(1)',
            transition: 'transform 0.15s ease, background 0.2s ease',
            outline: 'none',
            flexShrink: 0,
          }}>
          {isSelected ? '📚' : icon}
        </button>
      </div>
    </div>
  )
}

// ---------- PathSection (un chapitre) ----------
// Utilise des refs pour mesurer les positions réelles des cercles
// et dessine le SVG directement dans le DOM (sans re-render).

function PathSection({ chapter, startIndex, selectedRoot, learnResponses, exerciseResponses, qcmResponses, chapterIndex }) {
  const subs = chapter.subChapters
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const circleRefs = useRef([])
  const measureRef = useRef(null)

  circleRefs.current = circleRefs.current.slice(0, subs.length)

  // Fonction de mesure — stockée dans un ref pour que le ResizeObserver
  // appelle toujours la version la plus récente sans recréer l'observer.
  useLayoutEffect(() => {
    measureRef.current = () => {
      const container = containerRef.current
      const svg = svgRef.current
      if (!container || !svg || circleRefs.current.length < 2) return

      const containerRect = container.getBoundingClientRect()
      const points = circleRefs.current
        .map((el) => {
          if (!el) return null
          const r = el.getBoundingClientRect()
          return `${r.left + r.width / 2 - containerRect.left},${r.top + r.height / 2 - containerRect.top}`
        })
        .filter(Boolean)
        .join(' ')

      const polyline = svg.querySelector('polyline')
      if (polyline) polyline.setAttribute('points', points)
      svg.setAttribute('height', String(containerRect.height))
      svg.setAttribute('width', String(containerRect.width))
    }
    measureRef.current()
  })

  // ResizeObserver : re-mesure à chaque frame de la transition CSS
  // (le container rétrécit quand le panneau s'ouvre).
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const ro = new ResizeObserver(() => measureRef.current?.())
    ro.observe(container)
    return () => ro.disconnect()
  }, [])

  return (
    <div key={chapter.id}>
      <ChapterBanner chapter={chapter} index={chapterIndex} />

      <div ref={containerRef} style={{ position: 'relative' }}>
        {/* SVG de la ligne directrice — dessiné via refs */}
        <svg
          ref={svgRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            zIndex: 0,
          }}>
          <polyline
            points=""
            fill="none"
            stroke="#d1d5db"
            strokeWidth={3}
            strokeDasharray="8 6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {subs.map((sub, si) => {
          const offset = OFFSETS[(startIndex + si) % OFFSETS.length]
          const isSelected = selectedRoot?.id === sub.id
          const hasLearn = !!learnResponses[sub.id]
          const hasExercise = !!exerciseResponses[sub.id]
          const hasQcm = !!qcmResponses[sub.id]
          const status =
            hasLearn && hasExercise && hasQcm ? 'done'
            : hasLearn ? 'partial'
            : 'none'

          return (
            <div key={sub.id} style={{ position: 'relative', zIndex: 1 }}>
              <PathNode
                node={sub}
                offset={offset}
                isSelected={isSelected}
                status={status}
                circleRef={(el) => { circleRefs.current[si] = el }}
                onClick={() => $setRootNode(sub)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------- main component ----------

export function PathCanvas() {
  const nodes = useStore($nodes)
  const edges = useStore($edges)
  const selectedRoot = useStore($rootnode)
  const learnResponses = useStore($LearnResponses)
  const exerciseResponses = useStore($ExerciseFullResponse)
  const qcmResponses = useStore($QcmFullResponse)

  const isPanelOpen = useStore($isPanelOpen)
  const { root, chapters } = buildCourseTree(nodes, edges)

  if (!chapters.length) {
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          color: '#9ca3af',
          background: '#f8f9fb',
        }}>
        <span style={{ fontSize: '2.5rem' }}>📭</span>
        <span style={{ fontSize: '1rem', fontWeight: 600 }}>Aucun cours chargé</span>
      </div>
    )
  }

  let globalIndex = 0

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        overflowY: 'auto',
        paddingBottom: 120,
        paddingTop: 70,
        paddingRight: isPanelOpen ? 'calc(50vw + 16px)' : '0',
        background: '#f8f9fb',
        transition: 'padding-right 350ms cubic-bezier(0.16, 1, 0.3, 1)',
        boxSizing: 'border-box',
      }}>
      {root && (
        <div
          style={{
            textAlign: 'center',
            padding: '0 24px 8px',
            fontWeight: 800,
            fontSize: '1.3rem',
            color: '#111827',
          }}>
          {root.data?.label}
        </div>
      )}

      {chapters.map((chapter, ci) => {
        const startIndex = globalIndex
        globalIndex += chapter.subChapters.length
        return (
          <PathSection
            key={chapter.id}
            chapter={chapter}
            chapterIndex={ci}
            startIndex={startIndex}
            selectedRoot={selectedRoot}
            learnResponses={learnResponses}
            exerciseResponses={exerciseResponses}
            qcmResponses={qcmResponses}
          />
        )
      })}
    </div>
  )
}
