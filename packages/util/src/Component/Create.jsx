import { createProject } from '@agentix/base'
import { $setProjectId, loadProjectGraph } from '@agentix/store'
import { useNavigate } from 'raviger'
import { Button, Flex, Text, TextField } from '@radix-ui/themes'
import { useRef } from 'react'
import { supabase } from '@agentix/util'

export default function Create() {
  const navigate = useNavigate()

  const titleRef = useRef('')
  const authorRef = useRef('')

  const handleCreate = async () => {
    const payload = {
      title: titleRef.current,
      author: authorRef.current,
      data: {
        nodes: [],
        edges: [],
      },
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      console.log('USER =>', user)
      const project = await createProject(payload)

      // ✅ stocker l'id
      $setProjectId(project.id)

      // ✅ charger le graph
      loadProjectGraph(project.data?.nodes || [], project.data?.edges || [])

      // ✅ redirection
      navigate('/home')
    } catch (err) {
      console.error('Erreur création projet', err)
    }
  }

  return (
    <Flex
      align='center'
      justify='center'
      style={{ height: '100vh' }}>
      <Flex
        direction='column'
        gap='4'
        style={{
          width: 420,
          padding: 24,
          borderRadius: 16,
          border: '1px solid #e5e7eb',
        }}>
        <Text
          size='6'
          weight='bold'>
          Create Project
        </Text>

        <TextField.Root
          placeholder='Title'
          onChange={(e) => (titleRef.current = e.target.value)}
        />

        <TextField.Root
          placeholder='Author'
          onChange={(e) => (authorRef.current = e.target.value)}
        />

        <Button onClick={handleCreate}>Create</Button>
      </Flex>
    </Flex>
  )
}
