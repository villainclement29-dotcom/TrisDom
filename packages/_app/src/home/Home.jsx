import { PathCanvas } from '@agentix/canvas'
import { Content } from '@agentix/content-box'
import { $currentProjectId, $setProjectId, loadProjectGraph, $justGenerated } from '@agentix/store'
import { supabase } from '@agentix/util'
import { useStore } from '@nanostores/react'
import { useEffect } from 'react'
import GalleryButton from '@agentix/base/src/components/GalleryButton'

export function Home() {
  const projectId = useStore($currentProjectId)

  useEffect(() => {
    // si pas d'id en store, essayer de le récupérer depuis localStorage
    let id = projectId
    if (!id) {
      const stored = localStorage.getItem('currentProjectId')
      if (stored) {
        id = Number(stored)
        $setProjectId(id)
      }
    }

    if (!id) {
      console.warn('Aucun projet courant, rien à charger')
      return
    }

    if ($justGenerated.get()) {
      $justGenerated.set(false)
      return
    }

    let cancelled = false

    async function loadFromSupabase() {
      const { data: projectData, error } = await supabase
        .from('projects')
        .select('data, LearnResponses, ExercisesResponses, qcm')
        .eq('id', id)
        .single()

      if (cancelled) return

      if (error) {
        console.error('Erreur chargement projet', error)
        return
      }

      const nodes = projectData?.data?.nodes ?? []
      const edges = projectData?.data?.edges ?? []
      const LearnResponses = projectData?.LearnResponses
      const ExercisesFullResponses = projectData?.ExercisesResponses
      const qcmData = projectData?.qcm

      loadProjectGraph(nodes, edges, LearnResponses, ExercisesFullResponses, qcmData)
    }

    loadFromSupabase()

    return () => {
      cancelled = true
    }
  }, [projectId])
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <div style={{ position: 'fixed', top: 12, left: 12, zIndex: 10000 }}>
        <GalleryButton />
      </div>
      <PathCanvas />
      <Content />
    </div>
  )
}
