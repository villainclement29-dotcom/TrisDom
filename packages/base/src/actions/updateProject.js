// projectApi.ts
import { supabase } from '@agentix/util'

export async function saveProject(
  projectId,
  nodes,
  edges,
  learnResponses,
  ExercisesFullResponses,
  QcmSummary
) {
  const { data, error } = await supabase
    .from('projects')
    .update({
      data: { nodes, edges },
      LearnResponses: learnResponses,
      ExercisesResponses: ExercisesFullResponses,
      qcm: QcmSummary,
    })
    .eq('id', projectId)
    .select() //  pour récupérer la ligne mise à jour

  if (error) {
    console.error('Error updating project:', error)
    throw error
  }

  return data?.[0] ?? null // la ligne mise à jour
}
