import { useStore } from '@nanostores/react'
import {
  $rootnode,
  $LearnResponses,
  $ExerciseFullResponse,
  $QcmFullResponse,
  $LessonImages,
  $LessonImageLoading,
  $isContentGenerating,
  $isPanelOpen,
} from '@agentix/store'
import { Markdown } from '@agentix/base'
import { useState, useEffect } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  Cross2Icon,
  ReloadIcon,
  ReaderIcon,
} from '@radix-ui/react-icons'
import { Qcm } from '@agentix/base/src/components/Qcm'
import { explainNodeContent } from '@agentix/ai/src/actions/explain'
import { generateExercicesWithCorrection } from '@agentix/ai/src/actions/exercises'
import { generateQcm } from '@agentix/ai/src/actions/quizz'
import { Alert } from '@agentix/util/src/Component/Alert'

const PANEL_CLOSED = 25
const TABS = ['lecons', 'exercices', 'qcm']
const TAB_LABELS = { lecons: 'Leçons', exercices: 'Exercices', qcm: 'QCM' }

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 768px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isMobile
}

// ---------- shimmer skeleton ----------

function Skeleton() {
  return (
    <div style={{ padding: '24px 8px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {[1, 0.7, 0.85, 0.6, 0.9].map((w, i) => (
        <div
          key={i}
          style={{
            height: i === 0 ? 22 : 14,
            width: `${w * 100}%`,
            borderRadius: 6,
            background: 'linear-gradient(90deg, #e8eeff 25%, #d0daff 50%, #e8eeff 75%)',
            backgroundSize: '200% 100%',
            animation: `shimmer 1.4s ${i * 0.1}s infinite`,
          }}
        />
      ))}
      <div style={{ height: 1, background: '#e2e8f0', margin: '4px 0' }} />
      {[0.95, 0.75, 0.88, 0.65].map((w, i) => (
        <div
          key={i + 10}
          style={{
            height: 14,
            width: `${w * 100}%`,
            borderRadius: 6,
            background: 'linear-gradient(90deg, #e8eeff 25%, #d0daff 50%, #e8eeff 75%)',
            backgroundSize: '200% 100%',
            animation: `shimmer 1.4s ${i * 0.12}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

// ---------- onglet Leçons ----------

function LeconsTab({ rootNodeId, learnResponse, lessonImage, isImageLoading }) {
  return (
    <div
      key={rootNodeId}
      className="lesson-fade">
      {(isImageLoading || lessonImage) && (
        <div
          style={{
            width: '100%',
            height: 200,
            borderRadius: 12,
            overflow: 'hidden',
            marginBottom: 20,
            background: '#f0f4ff',
            flexShrink: 0,
          }}>
          {isImageLoading ? (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, #e8eeff 25%, #d0daff 50%, #e8eeff 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.4s infinite',
              }}
            />
          ) : (
            <img
              src={lessonImage}
              alt="Illustration de la leçon"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                animation: 'lessonFadeIn 0.5s ease both',
              }}
            />
          )}
        </div>
      )}
      <Markdown content={learnResponse || ''} />
    </div>
  )
}

// ---------- onglet Exercices ----------

function ExercicesTab({ rootNodeId, exerciseResponse }) {
  const [showCorrection, setShowCorrection] = useState(false)

  return (
    <div key={rootNodeId}>
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 16,
          borderBottom: '1px solid #f3f4f6',
          paddingBottom: 8,
        }}>
        <button
          onClick={() => setShowCorrection(false)}
          style={{
            padding: '6px 14px',
            borderRadius: 8,
            border: 'none',
            background: !showCorrection ? '#2F52E0' : '#f3f4f6',
            color: !showCorrection ? '#fff' : '#374151',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}>
          Exercices
        </button>
        <button
          onClick={() => setShowCorrection(true)}
          style={{
            padding: '6px 14px',
            borderRadius: 8,
            border: 'none',
            background: showCorrection ? '#2F52E0' : '#f3f4f6',
            color: showCorrection ? '#fff' : '#374151',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}>
          Correction
        </button>
      </div>
      <Markdown content={showCorrection
        ? (exerciseResponse?.corrections || '')
        : (exerciseResponse?.exercices || '')}
      />
    </div>
  )
}

// ---------- onglet QCM ----------

function QcmTab({ rootNodeId, qcmResponse }) {
  if (!qcmResponse) return null
  if (typeof qcmResponse === 'object') {
    return (
      <Qcm
        data={qcmResponse}
        rootId={rootNodeId}
      />
    )
  }
  return <Markdown content={qcmResponse} />
}

// ---------- composant principal ----------

export function Content() {
  const rootNode = useStore($rootnode)
  const learnResponses = useStore($LearnResponses)
  const exerciseResponses = useStore($ExerciseFullResponse)
  const qcmResponses = useStore($QcmFullResponse)
  const lessonImages = useStore($LessonImages)
  const lessonImageLoading = useStore($LessonImageLoading)
  const isContentGenerating = useStore($isContentGenerating)

  const [open, setOpen] = useState(false)
  const [fullyOpen, setFullyOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('lecons')
  const [showMissingLesson, setShowMissingLesson] = useState(false)

  const isMobile = useIsMobile()

  const rootNodeId = rootNode?.id ?? null
  const rootNodeData = rootNode?.data ?? null

  const learnResponse = learnResponses[rootNodeId]
  const exerciseResponse = exerciseResponses[rootNodeId]
  const qcmResponse = qcmResponses[rootNodeId]
  const lessonImage = lessonImages[rootNodeId] ?? null
  const isImageLoading = !!lessonImageLoading[rootNodeId]

  const currentResponse =
    activeTab === 'lecons' ? learnResponse
    : activeTab === 'exercices' ? exerciseResponse
    : qcmResponse

  // ouvre le panneau dès qu'un noeud est sélectionné
  useEffect(() => {
    if (rootNodeId) setOpen(true)
  }, [rootNodeId])

  useEffect(() => {
    $isPanelOpen.set(open)
    if (open) {
      const timeout = setTimeout(() => setFullyOpen(true), 350)
      return () => clearTimeout(timeout)
    } else {
      setFullyOpen(false)
    }
  }, [open])

  const handleGenerate = () => {
    if (!rootNodeId || !rootNodeData) return
    switch (activeTab) {
      case 'lecons':
        explainNodeContent(rootNodeId, rootNodeData)
        break
      case 'exercices':
        if (learnResponse) {
          generateExercicesWithCorrection(rootNodeId)
        } else {
          setShowMissingLesson(true)
        }
        break
      case 'qcm':
        if (learnResponse) {
          generateQcm(rootNodeId)
        } else {
          setShowMissingLesson(true)
        }
        break
    }
  }

  /* ---- styles ---- */

  const desktopPanelStyle = {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: open ? '50vw' : PANEL_CLOSED,
    backgroundColor: '#fff',
    margin: '8px',
    boxShadow: '0 0 6px #a7b8f8ff',
    borderRadius: '8px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 350ms cubic-bezier(0.16, 1, 0.3, 1)',
    zIndex: 9999,
  }

  const mobilePanelStyle = {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    height: open ? '100dvh' : 0,
    backgroundColor: '#fff',
    boxShadow: '0 -4px 24px rgba(0,0,0,0.18)',
    borderRadius: open ? 0 : '16px 16px 0 0',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'height 350ms cubic-bezier(0.16, 1, 0.3, 1)',
    zIndex: 9999,
    pointerEvents: open ? 'auto' : 'none',
  }

  return (
    <>
      {/* toggle desktop */}
      {!isMobile && (
        <button
          onClick={() => setOpen((o) => !o)}
          style={{
            position: 'fixed',
            top: '50%',
            right: open ? 'calc(50vw + 24px)' : 41,
            transform: 'translateY(-50%)',
            height: '40px',
            width: '40px',
            borderRadius: '20px',
            border: '2px solid #2F52E0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            cursor: 'pointer',
            transition: 'right 350ms cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 10000,
          }}>
          {open ? (
            <ChevronRightIcon style={{ color: '#2F52E0', width: '32px', height: '32px' }} />
          ) : (
            <ChevronLeftIcon style={{ color: '#2F52E0', width: '32px', height: '32px' }} />
          )}
        </button>
      )}

      {/* bouton d'ouverture mobile */}
      {isMobile && !open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            height: '44px',
            paddingInline: '24px',
            borderRadius: '22px',
            border: '2px solid #2F52E0',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            backgroundColor: '#fff',
            color: '#2F52E0',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(47,82,224,0.25)',
            zIndex: 10000,
          }}>
          <ChevronUpIcon style={{ width: '20px', height: '20px' }} />
          Contenu
        </button>
      )}

      {/* panneau */}
      <div style={isMobile ? mobilePanelStyle : desktopPanelStyle}>
        {fullyOpen && (
          <>
            {/* header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px 0',
                gap: 8,
              }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  flex: 1,
                  color: '#111827',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                {rootNodeData?.label || ''}
              </h3>

              <button
                type="button"
                onClick={handleGenerate}
                title={currentResponse ? 'Régénérer' : 'Générer'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: '1px solid #2F52E0',
                  backgroundColor: '#fff',
                  color: '#2F52E0',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>
                {currentResponse ? <ReloadIcon /> : <ReaderIcon />}
                {currentResponse ? 'Régénérer' : 'Générer'}
              </button>

              {isMobile && (
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    border: '2px solid #2F52E0',
                    backgroundColor: '#fff',
                    color: '#2F52E0',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}>
                  <Cross2Icon style={{ width: '16px', height: '16px' }} />
                </button>
              )}
            </div>

            {/* onglets */}
            <div
              style={{
                display: 'flex',
                borderBottom: '2px solid #f3f4f6',
                padding: '0 16px',
                marginTop: 10,
                gap: 4,
              }}>
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderBottom: activeTab === tab ? '2px solid #2F52E0' : '2px solid transparent',
                    background: 'transparent',
                    color: activeTab === tab ? '#2F52E0' : '#9ca3af',
                    fontWeight: activeTab === tab ? 700 : 500,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    marginBottom: '-2px',
                    transition: 'color 0.15s, border-color 0.15s',
                  }}>
                  {TAB_LABELS[tab]}
                </button>
              ))}
            </div>

            {/* contenu */}
            <div
              style={{ padding: '16px', overflowY: 'auto', flex: 1 }}
              className="Content">
              {isContentGenerating ? (
                <Skeleton />
              ) : activeTab === 'lecons' ? (
                <LeconsTab
                  rootNodeId={rootNodeId}
                  learnResponse={learnResponse}
                  lessonImage={lessonImage}
                  isImageLoading={isImageLoading}
                />
              ) : activeTab === 'exercices' ? (
                <ExercicesTab
                  rootNodeId={rootNodeId}
                  exerciseResponse={exerciseResponse}
                />
              ) : (
                <QcmTab
                  rootNodeId={rootNodeId}
                  qcmResponse={qcmResponse}
                />
              )}
            </div>
          </>
        )}
      </div>

      <Alert
        open={showMissingLesson}
        onOpenChange={setShowMissingLesson}
      />
    </>
  )
}
