import { $addLessonImage, $setLessonImageLoading } from '@agentix/store'

const HF_API_KEY = import.meta.env.VITE_PUBLIC_HF_API_KEY
// FLUX.1-schnell : rapide, haute qualité, gratuit sur le tier HF
// Le router HF supporte CORS contrairement à api-inference.huggingface.co
const HF_MODEL = 'black-forest-labs/FLUX.1-schnell'
const HF_URL = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}`

/**
 * Génère une illustration éducative via Hugging Face Inference API (FLUX.1-schnell)
 * et la stocke dans le store.
 * @param {string} nodeId  - ID du noeud topic (rootNodeId)
 * @param {string} context - La phrase de contexte (ex: "Pilotage automobile > apprendre à piloter")
 */
export async function generateLessonImage(nodeId, context) {
  if (!HF_API_KEY) {
    console.warn("VITE_PUBLIC_HF_API_KEY non défini — génération d'image ignorée")
    return
  }

  $setLessonImageLoading(nodeId)

  const prompt =
    `Flat design educational illustration about: "${context}". ` +
    `Modern, colorful, clean, professional. No text, no letters, no words.`

  try {
    const res = await fetch(HF_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    )

    if (!res.ok) {
      console.error('Hugging Face image error:', res.status, await res.text())
      $addLessonImage(nodeId, null)
      return
    }

    const blob = await res.blob()
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    })

    $addLessonImage(nodeId, dataUrl)
  } catch (err) {
    console.error('Erreur génération image Hugging Face:', err)
    $addLessonImage(nodeId, null)
  }
}
