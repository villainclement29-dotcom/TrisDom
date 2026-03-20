import { onAgent } from './agent'
import {
    $addQcmResponse,
    $agents,
    $Content,
    $LearnResponses,
    $QcmFullResponse,
} from '@agentix/store'

function stripCodeFences(raw) {
    if (!raw) return ''
    let cleaned = raw.trim()

    if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```[a-zA-Z0-9]*\n?/, '')
    }
    if (cleaned.endsWith('```')) {
        cleaned = cleaned.replace(/```$/, '')
    }
    return cleaned.trim()
}

export async function generateQcm(RootId) {
    const affiliatedLearnResponse = $LearnResponses.get()[RootId]
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

        const cleaned = stripCodeFences(QcmResponse)

        //parser le JSON
        let parsed
        try {
            parsed = JSON.parse(cleaned)
        } catch (e) {
            console.error('Erreur de parsing JSON du QCM :', e)
            console.error('Contenu reçu :', cleaned)

            // en cas d’erreur, on garde l’ancien comportement pour debug
            $addQcmResponse(RootId, QcmResponse)
            $Content.set(QcmResponse)
            return
        }

        $addQcmResponse(RootId, parsed)
        $Content.set(parsed)
    } catch (error) {
        console.error("Erreur lors de la génération du QCM :", error)
    } finally {
        console.log('generation du Qcm terminée.')
    }
}
