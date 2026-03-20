import { useStore } from '@nanostores/react'
import {
  $Content,
  $ContentTitle,
  $rootnode,
  $selectedNode,
  $selectedNodeLabel,
  $LearnResponses,
  $setNodeBgColor,
} from '@agentix/store'
import { Markdown } from '@agentix/base'
import { useState, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, ReloadIcon, ReaderIcon } from '@radix-ui/react-icons'
import { Button, Flex } from '@radix-ui/themes'
import { Qcm } from '@agentix/base/src/components/Qcm'
import { explainNodeContent } from '@agentix/ai/src/actions/explain'
import { generateExercicesWithCorrection } from '@agentix/ai/src/actions/exercises'
import { generateQcm } from '@agentix/ai/src/actions/quizz'
import { Alert } from '@agentix/util/src/Component/Alert'

const GENERATABLE = ['apprendre', 'appliquer', 'évaluer']

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

  const [open, setOpen] = useState(false)
  const [fullyOpen, setFullyOpen] = useState(false)
  const [selected, setSelected] = useState(true)
  const [showMissingLesson, setShowMissingLesson] = useState(false)

  const label = CurrentNodeLabel?.trim().toLowerCase()
  const canGenerate = GENERATABLE.includes(label)

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
  const PANEL_WIDTH = 600
  const PANEL_CLOSED = 25

  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => setFullyOpen(true), 350)
      return () => clearTimeout(timeout)
    } else {
      setFullyOpen(false)
    }
  }, [open])

  return (
    <>
      {/* --------- Bouton ---------- */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: 'fixed',
          top: '50%',
          right: open ? PANEL_WIDTH + 16 : 41,
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
          transition: `
            right 350ms cubic-bezier(0.16, 1, 0.3, 1),
            transform 350ms cubic-bezier(0.16, 1, 0.3, 1)
          `,
          zIndex: 10000,
        }}>
        {open ? (
          <ChevronLeftIcon style={{ color: '#2F52E0', width: '32px', height: '32px' }} />
        ) : (
          <ChevronRightIcon style={{ color: '#2F52E0', width: '32px', height: '32px' }} />
        )}
      </button>

      {/* --------- Drawer ---------- */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: open ? PANEL_WIDTH : PANEL_CLOSED,
          backgroundColor: '#fff',
          margin: '8px',
          boxShadow: '0 0 6px #a7b8f8ff',
          borderRadius: '8px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transition: `width 350ms cubic-bezier(0.16, 1, 0.3, 1)`,
          zIndex: 9999,
        }}>
        {fullyOpen && (
          <>
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
            </div>

            <Flex
              style={{
                display: CurrentNodeLabel === 'appliquer' ? 'flex' : 'none',
              }}>
              <Button style={{
                border: 'none',
                padding: '10px',
                margin: ' 5px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '16px',
                color: 'white',
                filter: selected ? 'none' : 'brightness(0.7)',
              }}
                onClick={() => setSelected((prev) => !prev)}
              >Exercises</Button>
              <Button style={{
                border: 'none',
                padding: '10px',
                margin: ' 5px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '16px',
                color: 'white',
                filter: selected ? 'brightness(0.7)' : 'none',
              }}
                onClick={() => setSelected((prev) => !prev)}
              >Correction</Button>
            </Flex>

            <div
              style={{
                padding: '5px 0px 0px 16px',
                overflowY: 'auto',
                flex: 1,
              }}
              className='Content'>
              {isQuiz ? (
                <Qcm data={response} rootId={rootNodeId} />
              ) : (
                <Markdown content={response || ''} />
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
