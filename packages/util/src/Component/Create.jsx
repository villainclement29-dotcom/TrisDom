import { createProject } from '@agentix/base'
import { $setProjectId, loadProjectGraph, $chatAgents, $nodes, $edges, $isGenerating, $generatingProgress, $currentProjectId, $LearnResponses, $ExerciseFullResponse, $QcmSummary, $justGenerated } from '@agentix/store'
import { $addEdge, $addNode } from '@agentix/store'
import { saveProject } from '@agentix/base'
import { useNavigate } from 'raviger'
import { Button, Flex, Text, TextField, TextArea } from '@radix-ui/themes'
import { useRef, useState } from 'react'
import { supabase } from '@agentix/util'
import { useStore } from '@nanostores/react'
import { onAgent } from '@agentix/ai/src/actions/agent'
import { getID, BASIC_NODE } from '@agentix/util'
import { TlCourseModule, TlHeadline, TlModuleTopics, TlToolAgent } from '@agentix/util/src/agents'
import { isEmpty } from 'lodash'

export default function Create() {
  const navigate = useNavigate()
  const chatAgents = useStore($chatAgents)

  const themeRef = useRef('')
  const promptRef = useRef('')
  const [promptEmpty, setPromptEmpty] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const handleCreate = async () => {
    if (!themeRef.current.trim()) return
    setIsLoading(true)
    try {
      await supabase.auth.getUser()
      const project = await createProject({
        title: themeRef.current,
        data: { nodes: [], edges: [] },
      })

      $setProjectId(project.id)
      loadProjectGraph([], [])

      const prompt = promptRef.current.trim()
      if (prompt) {
        const agents = chatAgents.slice(0, -1)
        const steps = isEmpty(agents) ? [null] : agents
        $isGenerating.set(true)
        $generatingProgress.set({ current: 0, total: steps.length })
        generateGraph(prompt, agents)
          .then(() => saveProject(
            $currentProjectId.get(),
            $nodes.get(),
            $edges.get(),
            $LearnResponses.get(),
            $ExerciseFullResponse.get(),
            $QcmSummary.get(),
          ))
          .catch(console.error)
          .finally(() => {
            $justGenerated.set(true)
            $isGenerating.set(false)
          })
        navigate('/Generating')
      } else {
        navigate('/home')
      }
    } catch (err) {
      console.error('Erreur création projet', err)
      setIsLoading(false)
    }
  }

  async function generateGraph(prompt, agents) {
    let nodeRootId = getID()
    let items = []
    let Topics = []
    const steps = isEmpty(agents) ? [null] : agents

    for (let i = 0; i < steps.length; i++) {
      const agent = steps[i]
      if (agent?.isBridge) {
        for (const el of items) {
          await runAgent(el.data.label, agent, el.id)
        }
      } else if (agent?.isBridge2) {
        for (const el of Topics) {
          await runAgent(el.data.label, agent, el.id)
        }
      } else {
        await runAgent(prompt, agent, nodeRootId)
      }
      $generatingProgress.set({ current: i + 1, total: steps.length })
    }

    async function runAgent(promptText, agent, rootId) {
      const stream = await onAgent({ prompt: promptText, agent, contextInputs: [] })
      let content = ''
      for await (const part of stream) {
        content += part.choices[0]?.delta?.content || ''
      }

      function addChildToParentNode(parentId, childNode) {
        const nodes = $nodes.get()
        $nodes.set(
          nodes.map((n) =>
            n.id === parentId ? { ...n, Children: [...(n.Children || []), childNode] } : n,
          ),
        )
      }

      if (!isEmpty(agent?.tools)) {
        for (const tool of agent.tools) {
          switch (tool) {
            case TlHeadline: {
              $addNode({
                id: rootId,
                data: { label: content },
                position: { x: 0, y: 0 },
                type: BASIC_NODE,
              })
              break
            }
            case TlCourseModule: {
              for (const item of content.split('- ')) {
                if (!item.trim()) continue
                const newNode = {
                  id: getID(),
                  data: { label: item },
                  position: { x: 0, y: 0 },
                  type: BASIC_NODE,
                }
                const newEdge = {
                  id: getID(),
                  data: { label: 'New edge' },
                  source: rootId,
                  target: newNode.id,
                }
                items.push(newNode)
                $addNode(newNode)
                $addEdge(newEdge)
              }
              break
            }
            case TlModuleTopics: {
              for (const item of content.split('- ')) {
                if (!item.trim()) continue
                const newTopicNode = {
                  id: getID(),
                  data: { label: item, bgColor: '#fff' },
                  position: { x: 0, y: 0 },
                  type: BASIC_NODE,
                  Children: [],
                }
                const newTopicEdge = {
                  id: getID(),
                  data: { label: 'New edge' },
                  source: rootId,
                  target: newTopicNode.id,
                }
                Topics.push(newTopicNode)
                $addNode(newTopicNode)
                $addEdge(newTopicEdge)
              }
              break
            }
            case TlToolAgent: {
              for (const item of content.split('- ')) {
                if (!item.trim()) continue
                const newNode = {
                  id: getID(),
                  data: { label: item, bgColor: '#fff' },
                  position: { x: 0, y: 0 },
                  type: BASIC_NODE,
                  sourceNodeId: rootId,
                }
                const newEdge = {
                  id: getID(),
                  data: { label: 'New edge' },
                  source: rootId,
                  target: newNode.id,
                }
                $addNode(newNode)
                $addEdge(newEdge)
                addChildToParentNode(rootId, newNode)
              }
              break
            }
            default:
              break
          }
        }
      }
    }
  }

  return (
    <Flex
      align='center'
      justify='center'
      style={{ height: '100vh', backgroundColor: '#f8f9fb' }}>
      <Flex
        direction='column'
        gap='4'
        style={{
          width: 520,
          padding: 32,
          borderRadius: 16,
          border: '1px solid #e5e7eb',
          backgroundColor: '#fff',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>
        <Text size='6' weight='bold'>
          Créer un projet
        </Text>

        <TextField.Root
          placeholder='Thème (ex: Photosynthèse, Révolution française…)'
          onChange={(e) => (themeRef.current = e.target.value)}
        />

        <Flex direction='column' gap='1'>
          <Text size='2' weight='medium' style={{ color: '#374151' }}>
            Générer l'arbre de connaissances
          </Text>
          <Text size='1' style={{ color: '#6b7280', lineHeight: 1.5 }}>
            Décrivez le contenu souhaité. Exemples de prompts :<br />
            • <em>"Cours complet sur la photosynthèse pour lycée"</em><br />
            • <em>"Introduction à l'algorithmique : structures de données et tri"</em><br />
            • <em>"Les grandes batailles de Napoléon et leurs conséquences"</em>
          </Text>
          <TextArea
            placeholder='Décrivez le sujet à explorer… (optionnel, vous pourrez générer depuis le projet)'
            rows={4}
            onChange={(e) => {
              promptRef.current = e.target.value
              setPromptEmpty(e.target.value.trim().length === 0)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                handleCreate()
              }
            }}
            style={{ marginTop: 4 }}
          />
        </Flex>

        <Button
          onClick={handleCreate}
          disabled={isLoading}
          size='3'>
          {isLoading ? 'Création en cours…' : promptEmpty ? 'Créer le projet' : 'Créer et générer'}
        </Button>
      </Flex>
    </Flex>
  )
}
