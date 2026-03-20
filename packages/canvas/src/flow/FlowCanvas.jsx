import { useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  MiniMap,
  Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { NodeWithToolbar } from './NodeWithToolbar'
import { useStore } from '@nanostores/react'
import {
  $edges,
  $nodes,
  $setEdges,
  $setNodes,
  $setSelectedNodeWithId,
  $setRootNode,
  $rootnode,
  $selectedNode,
  $Content,
  $LearnResponses,
  $ExerciseFullResponse,
  $selectedNodeLabel,
  $ContentTitle,
  $QcmFullResponse,
} from '@agentix/store'
import { BasicNode } from './BasicNode'
import { NODE_TOOLBAR } from '@agentix/util'

const nodeTypes = {
  NodeWithToolbar: NodeWithToolbar,
  BasicNode: BasicNode,
}

export function FlowCanvas() {
  const nodes = useStore($nodes)
  const edges = useStore($edges)

  const onNodesChange = (changes) => {
    const prev = $nodes.get()
    $setNodes(applyNodeChanges(changes, prev))
  }

  const onEdgesChange = (changes) => {
    const prev = $edges.get()
    $setEdges(applyEdgeChanges(changes, prev))
  }

  const onConnect = (params) => {
    const prev = $edges.get()
    $setEdges(addEdge(params, prev))
  }
  //TO FIX
  function displayToolNodes(children) {
    // si les enfants sont déjà affichés → collapse
    // const isExpanded = $nodes.get().some((n) => children.includes(n.id))
    // children.forEach((element) => {
    //   if (isExpanded) {
    //     collapseNode(node.id, children)
    //   } else {
    //     expandNode(node.id, children)
    //   }
    // })
  }

  const LearnResponses = useStore($LearnResponses)
  const ExercicesFullResponse = useStore($ExerciseFullResponse)
  const QcmResponse = useStore($QcmFullResponse)

  const SelectTypeOfResponse = () => {
    const selected = $selectedNode.get()
    const root = $rootnode.get()

    if (!selected || !root) return

    const rawLabel = selected.data?.label ?? ''
    const label = rawLabel.trim().toLowerCase()
    

    let response = ''

    switch (label) {
      case 'apprendre':
        response = LearnResponses[root.id]
        $selectedNodeLabel.set('apprendre')
        $ContentTitle.set('leçon')
        if (response) {
          $Content.set(response)
        }
        else {
          $Content.set('No learning content available.')
        }
        break

      case 'appliquer':
        response = ExercicesFullResponse[root.id]
        $selectedNodeLabel.set('appliquer')
        $ContentTitle.set('Exercices')
        if (response) {
          $Content.set(response)
        }
        else {
          $Content.set('No Exercises content available.')
        }
        break

      case 'réviser':
        console.log('reviser')
        if (response) {
          $Content.set(response)
        }
        else {
          $Content.set('No FlashCads content available.')
        }
        break

      case 'évaluer':
        response = QcmResponse[root.id]
        $selectedNodeLabel.set('évaluer')
        $ContentTitle.set('QCM')
        if (response) {
          $Content.set(response)
        }
        else {
          $Content.set('No QCM content available.')
        }
        break

      default:
        break
    }
  }


  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(event, node) => {
          if (node.type === NODE_TOOLBAR) {
            const sourceId = node.sourceNodeId
            $setRootNode(nodes.find((n) => n.id === sourceId))
          }
          $setSelectedNodeWithId(node.id)
          displayToolNodes(node.Children)
          SelectTypeOfResponse()
        }}
        onConnect={onConnect}
        fitView>
        <Background />
        <Panel>
        </Panel>
        <MiniMap style={{ marginRight: '40px' }} />
        <Controls style={{ marginLeft: '40px' }} />
      </ReactFlow>
    </div>
  )
}
