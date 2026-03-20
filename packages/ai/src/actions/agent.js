import { getAIClient } from './openai'
import { isEmpty } from 'lodash'

// function générateur : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator

export const onAgent = async function ({
  agent = {},
  prompt,
  canStream = true,
  contextInputs = [],
}) {
  const aiClient = await getAIClient()

  if (isEmpty(agent)) {
    agent = aiClient.cfg
  }

  agent.role = `${agent.role}
                Respond in the same language of the user.
                Be to the point, and do not add any fluff.`

  if (agent.desired_response) {
    agent.role += `<role>**Your utltimate and most effective role is: ${agent.output} nothing less, nothing more**</role>.`
  }

  if (agent.response_format?.toLowerCase() === 'json') {
    agent.role += '\n Output: json \n  ```json ... ```'
  }

  try {
    const stream = await aiClient.openai.chat.completions.create({
      model: agent.model || aiClient.cfg.model,
      stream: canStream,
      messages: [
        {
          role: 'system',
          content: agent.role,
        },
        //...contextInputs,
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
      temperature: agent.temperature || 0.7,
    })

    return stream
  } catch (error) {
    console.error('Sorry something went wrong. IA', error.message)
  }

  return []
}
