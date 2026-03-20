import { onAgent } from '../actions/agent'
import { styled, getID, NODE_TOOLBAR, BASIC_NODE } from '@agentix/util'
import {
  $chatAgents,
  $messages,
  $nodes,
  $edges,
  addMessage,
  updateMessages,
} from '@agentix/store'
import { PaperPlaneIcon } from '@radix-ui/react-icons'
import { Button, Flex, TextArea } from '@radix-ui/themes'
import { use, useRef, useState } from 'react'

//TO DO
// import { AgentMenu } from './AgentMenu'
// import { AgentSelect } from './AgentSelect'
import { useStore } from '@nanostores/react'
import { isEmpty, isString } from 'lodash'
import { $addEdge, $addNode } from '@agentix/store'
import { useNodes, useReactFlow } from '@xyflow/react'
import {
  TlCourseModule,
  TlHeadline,
  TlModuleTopics,
  TlToolAgent,
} from '@agentix/util/src/agents'
const PromptContainer = styled(Flex, {
  width: '100%',
  height: '100%',
  margin: '8px',
  boxShadow: '-2px 0 6px rgba(0,0,0,0.1)',
  borderRadius: '8px',
  background: 'var(--accent-2)',
})

const PromptArea = styled(TextArea, {
  width: '100%',
  boxShadow: 'none',
  outline: 'none',
  background: 'none',
  '& textarea': {
    fontSize: '1.1rem',
    fontWeight: 450,
  },
})

function constructCtxArray(originalArray) {
  const result = []

  if (originalArray.length === 0) return result
  else if (originalArray.length > 2) {
    result.push(
      originalArray.at(0),
      originalArray[originalArray.length - 3],
      originalArray[originalArray.length - 2],
    )
  }
  return result
}

function ChatPrompt() {
  // eviter les effets boules de neige (TlToolAgent est appelle une fois de plus a chaque iteration)
  let chatAgents = useStore($chatAgents)
  const UpdatedChatAgents = chatAgents.slice(0, -1)

  const promptRef = useRef(null)
  const [isPromptEmpty, setIsPromptEmpty] = useState(true)

  const onTextChange = (e) => {
    promptRef.current = e.target.value
    setIsPromptEmpty(promptRef.current.trim().length === 0)
  }

  const onSendPrompt = async () => {
    const prompt = promptRef.current
    // empeche les doubles soumissons

    addMessage({
      role: 'user',
      content: prompt,
      id: Math.random().toString(),
    })

    // AI response
    const response = {
      role: 'assistant',
      content: '',
      id: Math.random().toString(),
      completed: false, // not complete yet
    }

    // add AI response to chat messages
    addMessage(response)
    let nodeRootId = getID()
    let items = []
    let Topics = []
    let TopicsContent = []

    const steps = isEmpty(UpdatedChatAgents) ? [null] : UpdatedChatAgents

    for (let i = 0, len = steps.length; i < len; i++) {
      const agent = steps[i]

      let cloned = $messages.get()

      const contextInputs = constructCtxArray(cloned)
      // call agent
      // si l'agent est de type isBridge (= ModuleTpocisAgent) alors on lui donne comme noeud racine les noeuds presents dans le tableau items
      if (agent?.isBridge) {
        if (isString(items)) {
          items = [{ data: { label: items } }]
        }

        for (const el of items) {
          // créer un placeholder assistant pour que chaque exécution écrive dans son propre message
          cloned = [
            ...cloned,
            {
              role: 'assistant',
              content: '',
              id: Math.random().toString(),
              completed: false,
            },
          ]
          updateMessages([...cloned])

          await runAgent(el.data.label, agent, contextInputs, cloned, el.id)
        }
        // permet d'utiliser les noeuds presents dans le tableau topics comme noeud racine pour les agents de type isBridge2 (= ToolsModuleAgent)
      } else if (agent?.isBridge2) {
        if (isString(Topics)) {
          Topics = [{ data: { label: Topics } }]
        }

        for (const el of Topics) {
          // chaque topic doit avoir son propre message assistant pour éviter la concaténation
          cloned = [
            ...cloned,
            {
              role: 'assistant',
              content: '',
              id: Math.random().toString(),
              completed: false,
            },
          ]
          updateMessages([...cloned])

          await runAgent(el.data.label, agent, contextInputs, cloned, el.id)
        }
        // sinon on utilise le noeud racine generique
      } else {
        await runAgent(prompt, agent, contextInputs, cloned, nodeRootId)
      }

      // add next prompt to chat
      if (steps.length > 0 && i !== steps.length - 1) {
        cloned = [
          ...cloned,
          {
            role: 'assistant',
            content: '',
            id: Math.random().toString(),
            completed: false,
          },
        ]
      }

      updateMessages([...cloned])
    }

    promptRef.current = ''
    setIsPromptEmpty(true)

    async function runAgent(prompt, agent, contextInputs, cloned, nodeRootId) {
      const stream = await onAgent({ prompt: prompt, agent, contextInputs })
      for await (const part of stream) {
        const token = part.choices[0]?.delta?.content || ''

        const last = cloned.at(-1)
        cloned[cloned.length - 1] = {
          ...last,
          content: last.content + token,
        }

        updateMessages([...cloned])
      }

      const last = cloned.at(-1)

      //handler to add tools node to their parents children array
      function addChildToParentNode(parentId, childNode) {
        const nodes = $nodes.get()

        const updatedNodes = nodes.map((n) =>
          n.id === parentId
            ? {
                ...n,
                Children: [...(n.Children || []), childNode],
              }
            : n,
        )

        $nodes.set(updatedNodes)
      }

      cloned[cloned.length - 1] = {
        ...last,
        completed: true,
      }

      if (!isEmpty(agent.tools)) {
        for (const tool of agent.tools) {
          switch (tool) {
            case TlHeadline: {
              // add root node
              const node = {
                id: nodeRootId,
                data: { label: last.content },
                position: { x: 0, y: 0 },
                type: BASIC_NODE,
              }
              $addNode(node)
              break
            }

            case TlCourseModule: {
              const elements = last.content.split('- ')

              // add linked node to root node
              for (const item of elements) {
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
                  source: nodeRootId,
                  target: newNode.id,
                }

                items.push(newNode)

                $addNode(newNode)
                $addEdge(newEdge)
              }
              break
            }

            case TlModuleTopics: {
              const elements = last.content.split('- ')
              TopicsContent = elements

              // add linked node to root node
              for (const item of elements) {
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
                  source: nodeRootId,
                  target: newTopicNode.id,
                }
                Topics.push(newTopicNode)
                $addNode(newTopicNode)
                $addEdge(newTopicEdge)
              }
              break
            }
            case TlToolAgent: {
              const elements = last.content.split('- ')
              // add linked node to root node
              for (const item of elements) {
                if (!item.trim()) continue

                const newNode = {
                  id: getID(),
                  data: { label: item, bgColor: '#fff' },
                  position: { x: 0, y: 0 },
                  type: NODE_TOOLBAR,
                  sourceNodeId: nodeRootId,
                }

                const newEdge = {
                  id: getID(),
                  data: { label: 'New edge' },
                  source: nodeRootId,
                  target: newNode.id,
                }
                $addNode(newNode)
                $addEdge(newEdge)
                addChildToParentNode(nodeRootId, newNode)
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
      justify='center'
      mt='auto'
      width='100%'>
      <PromptContainer
        align='center'
        direction='column'>
        <PromptArea
          // ref={promptRef}
          id='Todo'
          placeholder='Comment puis-je aider...'
          onChange={onTextChange}
          onKeyDown={(e) => {
            const canSend = !isPromptEmpty && e.key === 'Enter'
            const mod = e.metaKey || e.ctrlKey || e.altKey || e.shiftKey
            if (canSend && !mod) {
              // Prevent default behavior of Enter key
              e.preventDefault()
              onSendPrompt()
            }
          }}
        />
        <Flex
          justify='start'
          align='center'
          width='100%'>
          <Flex
            justify='start'
            align='center'
            width='100%'>
            {/* TO DO  */}
            {/* <AgentMenu /> */}
            {/* <AgentSelect /> */}
          </Flex>
        </Flex>
        <Flex
          justify='end'
          width='100%'>
          <Button
            disabled={isPromptEmpty}
            onClick={onSendPrompt}>
            <PaperPlaneIcon />
          </Button>
        </Flex>
      </PromptContainer>
    </Flex>
  )
}

export default ChatPrompt
