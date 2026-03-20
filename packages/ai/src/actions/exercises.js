import { onAgent } from './agent'
import {
  $addExerciseFullResponse,
  $agents,
  $Content,
  $ExerciseFullResponse,
  $LearnResponses,
} from '@agentix/store'
import { getID, NODE_TOOLBAR } from '@agentix/util'

export async function generateExercicesWithCorrection(RootId) {
  const affiliatedLearnResponse = $LearnResponses.get()[RootId]
  try {
    const agents = $agents.get()
    const exercisesAgent = agents.find((a) => a.id === 'ExercicesAgent')
    const correctionAgent = agents.find((a) => a.id === 'CorrectionAgent')

    const stream = await onAgent({
      prompt: affiliatedLearnResponse,
      agent: exercisesAgent,
      canStream: true,
      contextInputs: [],
    })

    let ExerciseResponse = ''
    for await (const part of stream) {
      const token = part.choices[0]?.delta?.content || ''
      ExerciseResponse += token
    }

    const stream2 = await onAgent({
      prompt: ExerciseResponse,
      agent: correctionAgent,
      canStream: true,
      contextInputs: [],
    })
    let CorrectionResponse = ''
    for await (const part of stream2) {
      const token = part.choices[0]?.delta?.content || ''
      CorrectionResponse += token
    }

    let fullResponse = { exercices: ExerciseResponse, corrections: CorrectionResponse }
    $addExerciseFullResponse(RootId, fullResponse)
    $Content.set(fullResponse)
  } catch (error) {
    console.error('Erreur lors de l’explication:', error)
  } finally {
    console.log('Exercices correctement générés.')
  }
}
