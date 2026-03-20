import { useStore } from '@nanostores/react'
import {
  $Content,
  $ContentTitle,
  $rootnode,
  $selectedNode,
  $selectedNodeLabel,
} from '@agentix/store'
import { Markdown } from '@agentix/base'
import { useState, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import { Button, Flex } from '@radix-ui/themes'
import { set } from 'lodash'
import { Qcm } from '@agentix/base/src/components/Qcm'



export function Content() {
  let response = useStore($Content)
  console.log('response dans content.jsx', response)
  let CurrentNodeLabel = useStore($selectedNodeLabel)
  let title = useStore($ContentTitle)
  let RootNode = useStore($rootnode)
  let rootNodeId = null
  if(RootNode){
    rootNodeId = RootNode.id
  }
  const [open, setOpen] = useState(false)
  const [fullyOpen, setFullyOpen] = useState(false)
  const [selected, setSelected] = useState(true)


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
    const PANEL_WIDTH = 600 // largeur ouverte
    const PANEL_CLOSED = 25 // largeur fermée

    // Quand open change → attendre la fin de l’animation avant d'afficher le contenu
    useEffect(() => {
      if (open) {
        // attendre la fin de la transition (~350ms)
        const timeout = setTimeout(() => setFullyOpen(true), 350)
        return () => clearTimeout(timeout)
      } else {
        setFullyOpen(false) // immédiatement cacher en fermeture
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

            transition: `
            width 350ms cubic-bezier(0.16, 1, 0.3, 1)
          `,

            zIndex: 9999,
          }}>
          {/* Contenu masqué tant que le panneau n'est pas entièrement ouvert */}
          {fullyOpen && (
            <>
              <h3
                style={{
                  textAlign: 'center',
                  margin: 0,
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  padding: '16px',
                  borderBottom: '1px solid #eee',
                }}
                >
                {title}
              </h3>
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
                ) : (<Markdown content={response || ''} />
                )}
                
              </div>
            </>
          )}
        </div>
      </>
    )
  }
