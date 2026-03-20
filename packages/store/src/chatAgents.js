import { atom, computed } from 'nanostores'
import { $agents } from './agents'

export const $selectedChatAgents = atom([
  'HeadlineAgent',
  'CourseModuleAgent',
  'ModuleTpocisAgent',
  'ToolsModuleAgent',
  'ContentModuleAgent',
])

export const $chatAgents = computed([$selectedChatAgents, $agents], (ids, agents) => {
  return agents.filter((e) => ids.includes(e.id))
})

export const selectChatAgent = (checked, id) => {
  const selected = $selectedChatAgents.get()
  if (checked) {
    $selectedChatAgents.set([...selected, id])
  } else {
    $selectedChatAgents.set(selected.filter((e) => e !== id))
  }
}

export const setSelectChatAgents = (ids) => {
  $selectedChatAgents.set(ids)
}
