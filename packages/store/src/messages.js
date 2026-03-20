import { atom } from 'nanostores'

export const $messages = atom([
  { role: 'user', content: 'bonjour ! comment ça va ?', id: '1' },
])

export const addMessage = (msg) => {
  // get current messages
  const msgs = $messages.get()
  // add msg to the messages
  $messages.set([...msgs, msg])
}

export const updateMessages = (msgs) => {
  $messages.set(msgs)
}
