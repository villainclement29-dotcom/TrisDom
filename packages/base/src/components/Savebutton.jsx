// src/components/SaveProjectButton.jsx
import { useState } from 'react'
import { useStore } from '@nanostores/react'
import {
  $nodes,
  $edges,
  $currentProjectId,
  $LearnResponses,
  $ExerciseFullResponse,
  $QcmSummary
} from '@agentix/store'
import { saveProject } from '@agentix/base'
import { Button } from '@radix-ui/themes'
import { CheckIcon, ReloadIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons'

export function SaveProjectButton() {
  const projectId = useStore($currentProjectId)
  const [status, setStatus] = useState('idle')

  async function handleSave() {
    if (!projectId) {
      console.warn('Aucun projet courant. Impossible de sauvegarder.')
      setStatus('error')
      return
    }

    try {
      setStatus('saving')

      await saveProject(
        projectId,
        $nodes.get(),
        $edges.get(),
        $LearnResponses.get(),
        $ExerciseFullResponse.get(),
        $QcmSummary.get(),
      )

      setStatus('saved')
      setTimeout(() => setStatus('idle'), 1500)
    } catch (err) {
      console.error('Erreur de sauvegarde', err)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 2000)
    }
  }

  // label & icône dynamiques
  let label = 'Save project'
  let icon = null
  let color = '#3e63dd'

  if (status === 'saving') {
    label = 'Saving...'
    icon = <ReloadIcon className='spin' />
    color = '#E3821C'
  } else if (status === 'saved') {
    label = 'Saved!'
    icon = <CheckIcon />
    color = '#2AD52F'
  } else if (status === 'error') {
    label = 'Error'
    icon = <ExclamationTriangleIcon />
    color = '#E2221D'
  }

  return (
    <Button
      style={{
        zIndex: '9999',
        cursor: 'pointer',
        background: color,
      }}
      onClick={handleSave}
      disabled={status === 'saving'}>
      {icon}&nbsp;{label}
    </Button>
  )
}
