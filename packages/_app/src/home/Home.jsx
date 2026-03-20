import { FlowCanvas } from '@agentix/canvas'
import '@xyflow/react/dist/style.css'
import { Flex } from '@radix-ui/themes'
import { Content } from '@agentix/content-box'
import { Chat } from '@agentix/ai'
import { SaveProjectButton } from '@agentix/base'
import { $currentProjectId, $setProjectId, loadProjectGraph } from '@agentix/store'
import { supabase } from '@agentix/util'
import { useStore } from '@nanostores/react'
import { useEffect } from 'react'
import GalleryButton from '@agentix/base/src/components/GalleryButton'
import { Controls, MiniMap } from '@xyflow/react'

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
      const qcmSummary = projectData?.qcm

      loadProjectGraph(nodes, edges, LearnResponses, ExercisesFullResponses, qcmSummary)
    }

    loadFromSupabase()

    return () => {
      cancelled = true
    }
  }, [projectId])
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <Flex
        justify={'between'}
        gap={'3'}
        style={{ height: '100%' }}>
        <Chat />
        <Flex
          style={{
            position: 'fixed',
            left: '45%',
            top: '1%',
            gap: '5px',
            zIndex: '9999',
            cursor: 'pointer',
          }}>
          <GalleryButton />
          <SaveProjectButton />
        </Flex>
        <FlowCanvas />
        <Content />
      </Flex>
    </div>
  )
}
