import { explainNodeContent } from '@agentix/ai/src/actions/explain'
import { $addEdge, $addNode, $LearnResponses, $rootnode, $selectedNode } from '@agentix/store'
import { useStore } from '@nanostores/react'
import { useState } from 'react'
import { getID, NODE_TOOLBAR, Button, NodeBox } from '@agentix/util'
import { ReloadIcon, PlusIcon, ReaderIcon } from '@radix-ui/react-icons'
import { useReactFlow, Handle, Position, NodeToolbar } from '@xyflow/react'
import { generateExercicesWithCorrection } from '@agentix/ai/src/actions/exercises'
import { generateQcm } from '@agentix/ai/src/actions/quizz'
import { set } from 'lodash'
import { Alert } from '@agentix/util/src/Component/Alert'

export function NodeWithToolbar({ data, id, direction = 'LR' }) {
  const { screenToFlowPosition, getViewport } = useReactFlow()

  const onAdd = () => {
    //calcul la position du nouveau noeud au centre de l'ecran en fonction du viewport
    const viewport = getViewport()
    const centerPos = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    })

    const newNode = {
      id: getID(),
      type: NODE_TOOLBAR,
      position: { x: 0, y: 0 },
      data: { label: 'New node' },
      style: {},
    }

    const newEdge = {
      id: getID(),
      data: { label: 'New edge' },
      source: id,
      target: newNode.id,
    }

    $addNode(newNode)
    $addEdge(newEdge)
  }

  // to delete node
  // const onDelete = () => {
  //   $deleteNode(id)
  // }

  //function to switch icon frome reader to reload after the 1st generation of the learnResponse
  const [hasClicked, setHasClicked] = useState(false)
  const [showMissingLesson, setShowMissingLesson] = useState(false)
  const [isValidated, setIsValidated] = useState(false)

  function handleClick() {
    setHasClicked(true)
    setIsValidated(true) // dès le premier clic → passe à true
    GetDetails() // ton action
  }

  const rootNode = useStore($rootnode)
  // set the variables out to prevent scope errors
  let rootNodeId = null
  let rootNodedata = null
  if (rootNode) {
    rootNodeId = rootNode.id
    rootNodedata = rootNode.data
  }



  function GetDetails() {
    const selected = $selectedNode.get()
    const rawLabel = selected.data?.label ?? ''
    const LearnResponses = $LearnResponses.get()
    const label = rawLabel.trim().toLowerCase()
    switch (label) {
      case 'apprendre':
        explainNodeContent(rootNodeId, rootNodedata)
        data.bgColor = "#01b95aff" // change la couleur de fond pour indiquer que c'est validé
        break
      case 'appliquer':
        if (LearnResponses[rootNodeId]) {
          generateExercicesWithCorrection(rootNodeId)
          data.bgColor = "#01b95aff" // change la couleur de fond pour indiquer que c'est validé
        } else {
          setShowMissingLesson(true)
        }
        break
      case 'réviser':
        break
      case 'évaluer':
        if (LearnResponses[rootNodeId]){
          generateQcm(rootNodeId)
          data.bgColor = "#e0ac00ff" // change la couleur de fond pour indiquer que c'est validé
        } else {
          setShowMissingLesson(true)
        }
        break
      default:
        break
    }
  }

  return (
    <>
      <NodeBox
      style = {{
        backgroundColor: data?.bgColor || '#fff',
        cursor: 'pointer',
      }}>
        <Handle
          type='target'
          position={direction === 'LR' ? Position.Left : Position.Top}
        />
        <Handle
          type='source'
          position={direction === 'LR' ? Position.Right : Position.Bottom}
        />
        <NodeToolbar
        className='nodeToolBar'
          isVisible={data.forceToolbarVisible || undefined}
          position={data.toolbarPosition}
          align={data.align}>
          <Button
            className='xy-theme__button'
            onClick={onAdd}>
            <PlusIcon />
          </Button>
          <Button
            className='xy-theme__button'
            onClick={(handleClick)}>
            {hasClicked ? <ReloadIcon /> : <ReaderIcon />}
          </Button>
        </NodeToolbar>
        <div>{data?.label}</div>
      </NodeBox>
      <Alert 
      open={showMissingLesson}
      onOpenChange={setShowMissingLesson}
      ></Alert>
    </>
  )
}
