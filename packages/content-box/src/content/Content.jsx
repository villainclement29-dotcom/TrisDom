import { useStore } from '@nanostores/react'
import {
  $Content,
  $ContentTitle,
  $rootnode,
  $selectedNode,
  $selectedNodeLabel,
  $LearnResponses,
  $setNodeBgColor,
  $LessonImages,
  $LessonImageLoading,
  $isContentGenerating,
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
import { Button, Flex } from '@radix-ui/themes'
import { Qcm } from '@agentix/base/src/components/Qcm'
import { explainNodeContent } from '@agentix/ai/src/actions/explain'
import { generateExercicesWithCorrection } from '@agentix/ai/src/actions/exercises'
import { generateQcm } from '@agentix/ai/src/actions/quizz'
import { Alert } from '@agentix/util/src/Component/Alert'

const GENERATABLE = ['apprendre', 'appliquer', 'évaluer']
const PANEL_CLOSED = 25

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

export function Content() {
  let response = useStore($Content)
  let CurrentNodeLabel = useStore($selectedNodeLabel)
  let title = useStore($ContentTitle)
  let RootNode = useStore($rootnode)
  const LearnResponses = useStore($LearnResponses)

  let rootNodeId = null
  let rootNodedata = null
  if (RootNode) {
    rootNodeId = RootNode.id
    rootNodedata = RootNode.data
  }

  const selectedNode = useStore($selectedNode)
  const selectedNodeId = selectedNode?.id ?? null

  const lessonImages = useStore($LessonImages)
  const lessonImageLoading = useStore($LessonImageLoading)
  const lessonImage = lessonImages[rootNodeId] ?? null
  const isImageLoading = !!lessonImageLoading[rootNodeId]
  const isContentGenerating = useStore($isContentGenerating)

  const [open, setOpen] = useState(false)
  const [fullyOpen, setFullyOpen] = useState(false)
  const [selected, setSelected] = useState(true)
  const [showMissingLesson, setShowMissingLesson] = useState(false)

  const isMobile = useIsMobile()

  const label = CurrentNodeLabel?.trim().toLowerCase()
  const canGenerate = GENERATABLE.includes(label)

  useEffect(() => {
    if (GENERATABLE.includes(label)) {
      setOpen(true)
    }
  }, [label, selectedNodeId])

  const handleGenerate = () => {
    switch (label) {
      case 'apprendre':
        explainNodeContent(rootNodeId, rootNodedata)
        $setNodeBgColor(selectedNodeId, '#01b95aff')
        break
      case 'appliquer':
        if (LearnResponses[rootNodeId]) {
          generateExercicesWithCorrection(rootNodeId)
          $setNodeBgColor(selectedNodeId, '#01b95aff')
        } else {
          setShowMissingLesson(true)
        }
        break
      case 'évaluer':
        if (LearnResponses[rootNodeId]) {
          generateQcm(rootNodeId)
          $setNodeBgColor(selectedNodeId, '#e0ac00ff')
        } else {
          setShowMissingLesson(true)
        }
        break
      default:
        break
    }
  }

  if (response) {
    if (CurrentNodeLabel === 'appliquer') {
      if (selected) {
        response = response.exercices || 'No exercises available.'
      } else {
        response = response.corrections || 'No correction available.'
      }
    }
  }

  const isQuiz = CurrentNodeLabel === 'évaluer' && response && typeof response === 'object'

  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => setFullyOpen(true), 350)
      return () => clearTimeout(timeout)
    } else {
      setFullyOpen(false)
    }
  }, [open])

  /* ---- Styles conditionnels desktop / mobile ---- */

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
      {/* ---- Bouton toggle desktop ---- */}
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

      {/* ---- Bouton d'ouverture mobile (quand fermé) ---- */}
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
          {title || 'Contenu'}
        </button>
      )}

      {/* ---- Panneau ---- */}
      <div style={isMobile ? mobilePanelStyle : desktopPanelStyle}>
        {fullyOpen && (
          <>
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid #eee',
                gap: 8,
              }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  flex: 1,
                  textAlign: 'center',
                }}>
                {title}
              </h3>
              {canGenerate && (
                <button
                  type="button"
                  onClick={handleGenerate}
                  title={response ? 'Régénérer' : 'Générer'}
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
                  }}>
                  {response ? <ReloadIcon /> : <ReaderIcon />}
                  {response ? 'Régénérer' : 'Générer'}
                </button>
              )}
              {/* Bouton fermeture mobile */}
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

            {/* Tabs exercices/correction */}
            <Flex
              style={{
                display: CurrentNodeLabel === 'appliquer' ? 'flex' : 'none',
              }}>
              <Button
                style={{
                  border: 'none',
                  padding: '10px',
                  margin: '5px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: 'white',
                  filter: selected ? 'none' : 'brightness(0.7)',
                }}
                onClick={() => setSelected((prev) => !prev)}>
                Exercises
              </Button>
              <Button
                style={{
                  border: 'none',
                  padding: '10px',
                  margin: '5px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: 'white',
                  filter: selected ? 'brightness(0.7)' : 'none',
                }}
                onClick={() => setSelected((prev) => !prev)}>
                Correction
              </Button>
            </Flex>

            {/* Contenu */}
            <div
              style={{
                padding: '5px 0px 0px 16px',
                overflowY: 'auto',
                flex: 1,
              }}
              className="Content">
              {isContentGenerating ? (
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
              ) : isQuiz ? (
                <Qcm data={response} rootId={rootNodeId} />
              ) : (
                <div key={`${rootNodeId}-${CurrentNodeLabel}`} className="lesson-fade">
                  {/* Illustration Gemini — visible uniquement pour "apprendre" */}
                  {CurrentNodeLabel === 'apprendre' && (isImageLoading || lessonImage) && (
                    <div style={{
                      width: '100%',
                      height: 200,
                      borderRadius: 12,
                      overflow: 'hidden',
                      marginBottom: 20,
                      background: '#f0f4ff',
                      flexShrink: 0,
                    }}>
                      {isImageLoading ? (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, #e8eeff 25%, #d0daff 50%, #e8eeff 75%)',
                          backgroundSize: '200% 100%',
                          animation: 'shimmer 1.4s infinite',
                        }} />
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
                  <Markdown content={response || ''} />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Alert open={showMissingLesson} onOpenChange={setShowMissingLesson} />
    </>
  )
}
