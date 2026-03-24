import { atom } from 'nanostores'
import { initialEdges, initialNodes } from './initialData'
import { getLayoutedElements, supabase } from '@agentix/util'
import { $addExerciseFullResponse, $addLearnResponse, $addQcmResponse, $setQcmSummary, $LearnResponses, $ExerciseFullResponse, $QcmFullResponse, $QcmSummary, $addLessonImage } from './response'

// Processed nodes with new positions
const { nodes, edges } = getLayoutedElements(initialNodes, initialEdges)

export const $currentProjectId = atom(null)
export const $nodes = atom(nodes)
export const $edges = atom(edges)
export const $rootnode = atom(null)
export const $Content = atom(null)
export const $selectedNodeId = atom(null)
export const $selectedNode = atom(null)
export const $selectedNodeLabel = atom(null)
export const $ContentTitle = atom('')
export const $isGenerating = atom(false)
export const $generatingProgress = atom({ current: 0, total: 0 })
export const $justGenerated = atom(false)
export const $isContentGenerating = atom(false)
export const $isPanelOpen = atom(false)

// ---------- auto-save ----------

export async function autoSave() {
  const projectId = $currentProjectId.get()
  if (!projectId) return

  const { error } = await supabase
    .from('projects')
    .update({
      data: { nodes: $nodes.get(), edges: $edges.get() },
      LearnResponses: $LearnResponses.get(),
      ExercisesResponses: $ExerciseFullResponse.get(),
      qcm: { data: $QcmFullResponse.get(), summary: $QcmSummary.get() },
    })
    .eq('id', projectId)

  if (error) console.error('[autoSave] erreur:', error)
}


export const $setProjectId = (id) => {
  $currentProjectId.set(id)
  if (id != null) {
    localStorage.setItem('currentProjectId', String(id))
  } else {
    localStorage.removeItem('currentProjectId')
  }
}

export const $setNodes = (nodes) => {
  $nodes.set(nodes)
}
export const $setEdges = (edges) => {
  $edges.set(edges)
}
export const $setRootNode = (childNode) => {
  $rootnode.set(childNode)
}

// helper pour charger un graphe complet depuis Supabase
export const loadProjectGraph = (
  nodes,
  edges,
  LearnResponses,
  ExercisesFullResponses,
  qcmColumn
) => {
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges)
  $nodes.set(layoutedNodes)
  $edges.set(layoutedEdges)

  Object.entries(LearnResponses || {}).forEach(([nodeId, markdown]) => {
    $addLearnResponse(nodeId, markdown)
  })
  Object.entries(ExercisesFullResponses || {}).forEach(([nodeId, content]) => {
    $addExerciseFullResponse(nodeId, content)
  })

  // Nouveau format : { data: {...}, summary: {...} }
  // Ancien format (rétrocompat) : l'objet était directement les données QCM
  const qcmData = qcmColumn?.data ?? qcmColumn ?? {}
  const qcmSummary = qcmColumn?.summary ?? {}
  Object.entries(qcmData).forEach(([nodeId, content]) => {
    $addQcmResponse(nodeId, content)
  })
  Object.entries(qcmSummary).forEach(([nodeId, summary]) => {
    if (summary) $setQcmSummary(nodeId, summary)
  })

  $rootnode.set(null)
  $selectedNodeId.set(null)
  $selectedNode.set(null)
}

export const $addNode = (node) => {
  const newNodes = [...$nodes.get(), node]
  $nodes.set(newNodes)
}

export const $deleteNode = (nodeID) => {
  const newNodes = $nodes.get().filter((node) => node.id !== nodeID)
  $nodes.set(newNodes)
}

export const $addEdge = (edge) => {
  const newEdges = [...$edges.get(), edge]

  // Processed nodes with new positions
  const { nodes, edges } = getLayoutedElements($nodes.get(), newEdges)

  $nodes.set(nodes)
  $edges.set(edges)
}



export const $setSelectedNodeWithId = (id) => {
  $selectedNodeId.set(id)
  $setSelectedNode(id)
}

export const $setSelectedNode = (id) => {
  const selectedNode = $nodes.get().find((n) => n.id === id)
  $selectedNode.set(selectedNode)
}

export const $setNodeBgColor = (nodeId, NewColor, nodename) => {
  const currentNodes = $nodes.get()

  // 1) Déterminer quel node on veut vraiment modifier
  let targetId = nodeId

  if (nodename) {
    const parent = currentNodes.find((n) => n.id === nodeId)
    if (!parent) return

    const children = parent.Children ?? []
    const targetChild =
      children.find((c) => c?.data?.label === nodename) ||
      children.find((c) => (c?.data?.label ?? '').toLowerCase() === nodename.toLowerCase())

    if (!targetChild) return
    if (!targetChild.id) {
      // Si tes Children n'ont pas d'id (objet embedded), on peut quand même mettre à jour le parent.Children,
      // mais ReactFlow ne verra la couleur que si ton rendu lit parent.Children (sinon il faut un vrai node dans $nodes).
      // On gère quand même ce cas ci-dessous.
    } else {
      targetId = targetChild.id
    }
  }

  // 2) Mise à jour immuable du tableau de nodes (et du parent.Children si besoin)
  const newNodes = currentNodes.map((n) => {
    // Cas A: node cible directement dans $nodes
    if (n.id === targetId) {
      const nextData = { ...(n.data ?? {}) }

      // normalisation: on garde bgColor (camelCase)
      nextData.bgColor = NewColor
      if ('bgcolor' in nextData) delete nextData.bgcolor

      return { ...n, data: nextData }
    }

    // Cas B: si nodename fourni mais le child n'existe pas comme node "flat" dans $nodes,
    // on met à jour le parent.Children embedded.
    if (nodename && n.id === nodeId && Array.isArray(n.Children)) {
      const nextChildren = n.Children.map((c) => {
        const label = c?.data?.label
        const match =
          label === nodename ||
          (typeof label === 'string' &&
            typeof nodename === 'string' &&
            label.toLowerCase() === nodename.toLowerCase())

        if (!match) return c

        const nextChildData = { ...(c.data ?? {}) }
        nextChildData.bgColor = NewColor
        if ('bgcolor' in nextChildData) delete nextChildData.bgcolor

        return { ...c, data: nextChildData }
      })

      return { ...n, Children: nextChildren }
    }

    return n
  })

  $nodes.set(newNodes)

  // 3) (optionnel mais utile) si le node sélectionné est celui modifié, on rafraîchit $selectedNode
  const selected = $selectedNode.get()
  const selectedId = selected?.id
  if (selectedId === targetId) {
    const updatedSelected = newNodes.find((x) => x.id === targetId)
    if (updatedSelected) $selectedNode.set(updatedSelected)
  }
}

