import { onAgent } from './agent'
import {
    $addQcmResponse,
    $agents,
    $Content,
    $LearnResponses,
    $setQcmSummary,
    $isContentGenerating,
} from '@agentix/store'

function extractJSON(raw) {
    if (!raw) return ''
    const cleaned = raw.trim()
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start !== -1 && end !== -1 && end > start) {
        return cleaned.slice(start, end + 1)
    }
    return cleaned
}

export async function generateQcm(RootId) {
    const affiliatedLearnResponse = $LearnResponses.get()[RootId]
    $setQcmSummary(RootId, null)
    $isContentGenerating.set(true)
    try {
        const agents = $agents.get()
        const QcmAgent = agents.find((a) => a.id === 'QcmAgent')

        const stream = await onAgent({
            prompt: affiliatedLearnResponse,
            agent: QcmAgent,
            canStream: true,
            contextInputs: [],
        })

        let QcmResponse = ''
        for await (const part of stream) {
            const token = part.choices[0]?.delta?.content || ''
            QcmResponse += token
        }

        console.log('QCM brut (string):', QcmResponse)

        const cleaned = extractJSON(QcmResponse)

        //parser le JSON
        let parsed
        try {
            parsed = JSON.parse(cleaned)
        } catch (e) {
            console.error('Erreur de parsing JSON du QCM :', e)
            console.error('Contenu reçu :', cleaned)

            // en cas d'erreur, on garde l'ancien comportement pour debug
            $addQcmResponse(RootId, QcmResponse)
            $Content.set(QcmResponse)
            return
        }

        $addQcmResponse(RootId, parsed)
        $Content.set(parsed)
    } catch (error) {
        console.error("Erreur lors de la génération du QCM :", error)
    } finally {
        $isContentGenerating.set(false)
    }
}