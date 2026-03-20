import { $addEdge, $addNode } from '@agentix/store'
import { getID, NODE_TOOLBAR, Button, NodeBox } from '@agentix/util'
import { PlusIcon } from '@radix-ui/react-icons'
import { useReactFlow, Handle, Position, NodeToolbar } from '@xyflow/react'

export function NodeWithToolbar({ data, id, direction = 'LR' }) {
  const { screenToFlowPosition, getViewport } = useReactFlow()

  const onAdd = () => {
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

  return (
    <>
      <NodeBox
        style={{
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
        </NodeToolbar>
        <div>{data?.label}</div>
      </NodeBox>
    </>
  )
}
