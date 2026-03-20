import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '@nanostores/react'
import { QcmCard } from './QcmCards'
import { $QcmSummary, $setQCMScore, $setQcmSummary, $setNodeBgColor } from '@agentix/store'

export function Qcm({ data, rootId }) {
    const qcmSummaryMap = useStore($QcmSummary)
    const existingSummary = qcmSummaryMap?.[rootId]

    const questions = data?.questions ?? []
    const totalQuestions = questions.length

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState({})
    const [showSummary, setShowSummary] = useState(false)

    // ✅ 1) Si un résumé existe déjà en store pour ce rootId => on hydrate l’UI
    useEffect(() => {
        if (!existingSummary) return

        // On affiche direct le résumé
        setAnswers(existingSummary.answers ?? {})
        setCurrentQuestionIndex(
            typeof existingSummary.currentQuestionIndex === 'number'
                ? existingSummary.currentQuestionIndex
                : Math.max(0, totalQuestions - 1)
        )
        setShowSummary(true)
    }, [existingSummary, totalQuestions])

    const currentQuestion = questions[currentQuestionIndex]

    const score = useMemo(() => {
        return questions.reduce((acc, q) => {
            const a = answers[q.id]
            if (!a) return acc
            return acc + (a.selectedIndex === q.answerIndex ? 1 : 0)
        }, 0)
    }, [answers, questions])

    

    if (!currentQuestion && !showSummary) {
        return <div>Aucune question disponible.</div>
    }

    const handleAnswer = (choiceIndex) => {
        if (!currentQuestion) return
        if (answers[currentQuestion.id]) return

        setAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: { selectedIndex: choiceIndex },
        }))

        if (currentQuestionIndex === totalQuestions - 1) {
            setShowSummary(true)
        }
    }

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex((i) => i + 1)
        } else {
            setShowSummary(true)
        }
    }

    // ✅ 2) Quand le QCM est terminé, on stocke un résumé dans $QcmSummary[rootId]
    const savedOnceRef = useRef(false)
    useEffect(() => {
        if (!showSummary) return
        if (!rootId) return
        if (savedOnceRef.current) return

        // Si déjà présent, pas besoin de réécrire
        if (existingSummary) {
            savedOnceRef.current = true
            return
        }

        const summary = {
            qcmId: data?.id ?? null,
            title: data?.title ?? '',
            finishedAt: new Date().toISOString(),
            totalQuestions,
            score,
            currentQuestionIndex,
            answers, // { [questionId]: { selectedIndex } }
        }

        $setQcmSummary(rootId, summary)
        $setQCMScore(rootId, score)
        // Appliquer la couleur au noeud via le store
        const bgColor = score === totalQuestions ? "#00d832ff" : "#ff4c4cff"
        $setNodeBgColor(rootId, bgColor, 'évaluer')
        $setNodeBgColor(rootId, bgColor)
        savedOnceRef.current = true
    }, [showSummary, rootId, existingSummary, data, totalQuestions, score, currentQuestionIndex, answers])

    return (
        <div style={{ padding: '8px 0 16px' }}>
            <h2 style={{ marginBottom: 4 }}>{data.title}</h2>
            {data.description && <p style={{ marginTop: 0 }}>{data.description}</p>}

            <p style={{ fontWeight: 'bold', marginBottom: 8 }}>
                Question {Math.min(currentQuestionIndex + 1, totalQuestions)} / {totalQuestions}
                {' • '}
                Score : {score} / {totalQuestions}
            </p>

            {!showSummary && currentQuestion && (
                <QcmCard
                    question={currentQuestion}
                    answer={answers[currentQuestion.id]}
                    onAnswer={handleAnswer}
                    onNext={handleNext}
                />
            )}

            {showSummary && (
                <div style={{ marginTop: 24 }}>
                    <h3>Quiz terminé 🎉</h3>
                    <p>
                        Score final : <strong>{score}</strong> / {totalQuestions}
                    </p>

                    <h4 style={{ marginTop: 16 }}>Vos réponses :</h4>
                    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {questions.map((q) => (
                            <QcmCard
                                key={q.id}
                                question={q}
                                answer={answers[q.id]}
                                readOnly
                                showFeedback
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}