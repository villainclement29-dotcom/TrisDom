import { Markdown } from '@agentix/base'
import { $messages } from '@agentix/store'
import { useStore } from '@nanostores/react'
import { Box, Flex } from '@radix-ui/themes'

function ChatList() {
  const messages = useStore($messages)

  return (
    <Flex
      direction='column'
      gap='2'
      style={{ height: 'calc(100vh - 200px)', overflowY: 'auto' }}>
      {messages.map((msg) => (
        <Flex key={`message-${msg.id}`}>
          {msg.role === 'assistant' ? (
            <Flex
              style={{
                background: 'var(--accent-5)',
                padding: '4px 8px',
                borderRadius: 18,
              }}>
              <Box>🤖</Box>

              <Markdown content={msg.content || ''} />
            </Flex>
          ) : (
            <Flex
              style={{
                background: 'var(--accent-a3)',
                padding: '4px 8px',
                borderRadius: 18,
                marginLeft: 24,
              }}>
              <Box>😀</Box>
              <Markdown content={msg.content || ''} />
            </Flex>
          )}
        </Flex>
      ))}
    </Flex>
  )
}

export default ChatList
