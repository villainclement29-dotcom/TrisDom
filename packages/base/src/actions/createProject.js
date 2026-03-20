import { supabase } from '@agentix/util'

export async function createProject(payload) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Utilisateur non connecté')

  const { data, error } = await supabase
    .from('projects')
    .insert({
      ...payload,
      user_id: user.id, // ✅ indispensable pour la policy RLS
    })
    .select('id, data')
    .single()

  if (error) throw error
  return data
}
