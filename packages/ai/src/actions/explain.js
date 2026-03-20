import { onAgent } from './agent'
import { $addLearnResponse, $agents, $Content, $nodes, $edges } from '@agentix/store'

function buildAncestorPath(nodeId, nodes, edges) {
  const path = []
  let currentId = nodeId

  while (currentId) {
    const node = nodes.find((n) => n.id === currentId)
    if (!node) break
    path.unshift(node.data?.label ?? '')
    const parentEdge = edges.find((e) => e.target === currentId)
    currentId = parentEdge?.source ?? null
  }

  return path
}

export async function explainNodeContent(id, data) {
  try {
    const agents = $agents.get()
    const explainerAgent = agents.find((a) => a.id === 'ContentModuleAgent')

    const nodes = $nodes.get()
    const edges = $edges.get()
    const path = buildAncestorPath(id, nodes, edges)

    const contextPrompt =
      path.length > 1
        ? `Contexte général : ${path.slice(0, -1).join(' > ')}\n\nSujet à expliquer : ${path[path.length - 1]}`
        : data.label

    const stream = await onAgent({
      prompt: contextPrompt,
      agent: explainerAgent,
      canStream: true,
      contextInputs: [],
    })

    let fullResponse = ''
    for await (const part of stream) {
      const token = part.choices[0]?.delta?.content || ''
      fullResponse += token
    }

    $addLearnResponse(id, fullResponse)
    $Content.set(fullResponse)
  } catch (error) {
    console.error('Erreur lors de l\'explication:', error)
  } finally {
    console.log('Explication terminée.')
  }
}
