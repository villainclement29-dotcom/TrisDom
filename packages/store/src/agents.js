import { CourseModuleRole, HeadlineRole, ModuleTopicsAgent, SYMBOLS } from '@agentix/util'
import {
  ContentModuleAgent,
  CorrectionAgent,
  ExercicesAgent,
  QcmAgent,
  TlContentModuleAgent,
  TlCourseModule,
  TlHeadline,
  TlModuleTopics,
  TlToolAgent,
  ToolsModuleAgent,
} from '@agentix/util/src/agents'
import { atom } from 'nanostores'

export const $selectedAgentId = atom('')

export const $agents = atom([
  {
    id: 'node-agent-1',
    emoji: '😀',
    title: 'Space Scifi Writer',
    role: 'your are a wonderful writer',
    response_format: 'text',
    temperature: 0.1,
    desired_response: 'Exo-planets epic scifi stories',
  },
  {
    id: 'HeadlineAgent',
    emoji: '🎓',
    title: 'Learning Topic Titler',
    role: HeadlineRole,
    response_format: 'text',
    temperature: 0.3,
    tools: [TlHeadline],
    desired_response:
      'A short learning topic title phrased with an infinitive verb only, based on the user intent.',
  },
  {
    id: 'CourseModuleAgent',
    emoji: '📚',
    title: 'Generic Chapter Architect',
    role: CourseModuleRole,
    response_format: 'text',
    temperature: 0.3,
    tools: [TlCourseModule],
    desired_response:
      'A short numbered list of broad, high-level chapter titles only (e.g. "Chapitre 1 : Introduction", "Chapitre 2 : Concepts fondamentaux", etc.). Do not include bullet points, details or explanations.',
  },
  {
    id: 'ModuleTpocisAgent',
    emoji: '🔖​',
    title: 'Task Decomposer',
    role: ModuleTopicsAgent,
    response_format: 'text',
    tools: [TlModuleTopics],
    temperature: 0.2,
    isBridge: true,
    desired_response:
      'A clean bullet list of actionable subtasks only (• ...), without mentioning or rewriting the initial high-level task.',
  },

  {
    id: 'ToolsModuleAgent',
    emoji: '🛠️​',
    title: 'Task Decomposer',
    role: ToolsModuleAgent,
    response_format: 'text',
    tools: [TlToolAgent],
    temperature: 0.2,
    isBridge2: true,
    desired_response:
      'A clean bullet list of actionable subtasks only (• ...), without mentioning or rewriting the initial high-level task.',
  },

  {
    id: 'ContentModuleAgent',
    emoji: '📖',
    title: 'Task Explainer',
    role: ContentModuleAgent,
    response_format: 'JSON',
    tools: [TlContentModuleAgent],
    temperature: 0.2,
    desired_response:
      'A structured, pedagogical explanation of the given task, broken down into major points with detailed content and examples where relevant.',
  },
  {
    id: 'ExercicesAgent',
    emoji: '🗿',
    title: 'Exercises Generator',
    role: ExercicesAgent,
    response_format: 'JSON',
    temperature: 0.2,
    desired_response:
      'Based on the previous explanation, generate 10 practice questions directly related to the topic discussed.',
  },
  {
    id: 'CorrectionAgent',
    emoji: '❤️‍🩹',
    title: 'Correction Generator',
    role: CorrectionAgent,
    response_format: 'JSON',
    temperature: 0.2,
    desired_response:
      'Based on the 10 practice questionscprovided, generate detailed corrections that explain the answers and the reasoning behind each of them.',
  },
  {
    id: 'QcmAgent',
    emoji: '❓​',
    title: 'quizz Generator',
    role: QcmAgent,
    response_format: 'JSON',
    temperature: 0.2,
    desired_response:
      'Extract the key learning concepts from the lesson and generate a structured JSON quiz of 10 MCQs, each with one correct answer, three distractors, and a concise explanation supporting the answer.'
  },
])

export const addAgent = (agent = {}) => {
  const agents = $agents.get()
  // if has id, then update existing,
  // else create new agent
  if (agent?.id) {
    const index = agents.findIndex((e) => e.id === agent.id)
    agents[index] = { ...agents[index], ...agent }
    $agents.set([...agents])
  } else {
    agent.id = Math.random().toString()
    agent.emoji = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
    agent.temperature = 0.7
    $agents.set([agent, ...agents])
  }

  // set current as selected
  $selectedAgentId.set(agent.id)
}

export const removeAgent = (id) => {
  const agents = $agents.get()
  $agents.set(agents.filter((e) => e.id !== id))
}
