import { onAgent } from './agent'
import { $addLearnResponse, $agents, $Content, $LearnResponses } from '@agentix/store'
import { getID, NODE_TOOLBAR } from '@agentix/util'

export async function explainNodeContent(id, data) {
  try {
    const agents = $agents.get()
    const explainerAgent = agents.find((a) => a.id === 'ContentModuleAgent')

    const stream = await onAgent({
      prompt: data.label,
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
    console.error('Erreur lors de l’explication:', error)
  } finally {
    console.log('Explication terminée.')
  }
}
