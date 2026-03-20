import OpenAI from 'openai'

export async function getAIClient({
  baseURL = import.meta.env.VITE_PUBLIC_LLM_BASE_URL,
  apiKey = import.meta.env.VITE_PUBLIC_LLM_API_KEY,
  model = import.meta.env.VITE_PUBLIC_LLM_MODEL,
  role = 'Your are a wonderful assistant',
  temperature = 0.7,
} = {}) {
  return {
    openai: new OpenAI({
      baseURL,
      apiKey,
      dangerouslyAllowBrowser: true,
    }),
    cfg: {
      model,
      role,
      temperature,
    },
  }
}
