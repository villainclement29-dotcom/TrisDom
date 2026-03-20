import { Handle, Position } from '@xyflow/react'
import { NodeBox } from '@agentix/util'

export function BasicNode({ data, selected, direction = 'LR' }) {
  return (
    <NodeBox className={`basic-node ${selected ? 'basic-node--selected' : ''}`}>
      {/* Handles d'entrée / sortie */}
      <Handle
        type='target'
        position={direction === 'LR' ? Position.Left : Position.Top}
      />
      <Handle
        type='source'
        position={direction === 'LR' ? Position.Right : Position.Bottom}
      />

      <div className='basic-node__content'>
        <div className='basic-node__title'>
          {data?.icon && <span className='basic-node__icon'>{data.icon}</span>}
          <span>{data?.label ?? 'Untitled node'}</span>
        </div>

        {data?.description && (
          <div className='basic-node__description'>{data.description}</div>
        )}
      </div>
    </NodeBox>
  )
}
