import { Position } from '@xyflow/react'
import { NODE_HEIGHT, NODE_WIDTH } from './canvas'
import dagre from '@dagrejs/dagre'

export // fonctions //
function getLayoutedElements(nodes, edges, direction = 'LR') {
  const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}))
  const isHorizontal = direction === 'LR'
  dagreGraph.setGraph({ rankdir: direction, ranksep: 120, nodesep: 80 })

  nodes.forEach((node) => {
    // Si  nodes ont des dimensions différentes, remplace par leurs width/height mesurés
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  })
  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target))

  dagre.layout(dagreGraph)

  const layoutedNodes = nodes.map((node) => {
    const { x, y } = dagreGraph.node(node.id)
    return {
      ...node,
      position: { x: x - NODE_WIDTH / 1.5, y: y - NODE_HEIGHT / 1.5 },
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
    }
  })

  return { nodes: layoutedNodes, edges: edges }
}
