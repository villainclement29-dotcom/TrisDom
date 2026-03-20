import { ArrowRightIcon } from '@radix-ui/react-icons'
import { Button } from '@radix-ui/themes'
import { useState, useEffect } from 'react'

export function QcmCard({
    question,
    answer,          // { selectedIndex, isCorrect } | undefined
    onAnswer,        // (choiceIndex: number) => void
    onNext,          // () => void
    readOnly = false,
    showFeedback = false, // pour le mode résumé final
}) {
    const [localSelected, setLocalSelected] = useState(
        answer ? answer.selectedIndex : null
    )
    const hasAnswered = !!answer

    // si on change de question, on reset la sélection locale
    useEffect(() => {
        setLocalSelected(answer ? answer.selectedIndex : null)
    }, [question.id, answer])

    const handleChoiceClick = (index) => {
        if (readOnly || hasAnswered) return
        setLocalSelected(index)
        onAnswer?.(index)
    }

    const isCorrectChoice = (index) => index === question.answerIndex
    const shouldShowFeedback = showFeedback || hasAnswered

    return (
        <div
            style={{
                border: '1px solid #eee',
                borderRadius: 8,
                padding: 12,
                marginBottom: 8,
            }}
        >
            <p style={{ fontWeight: 'bold', marginBottom: 8 }}>{question.question}</p>

            <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
                {question.choices.map((choice, index) => {
                    const selected = localSelected === index
                    const isCorrect = isCorrectChoice(index)

                    let bg = '#f7f7f7'
                    if (shouldShowFeedback && selected && isCorrect) bg = '#d4edda' // vert clair
                    else if (shouldShowFeedback && selected && !isCorrect) bg = '#f8d7da' // rouge clair
                    else if (shouldShowFeedback && !selected && isCorrect) bg = '#d1ecf1' // bleu clair pour la bonne

                    return (
                        <li key={index} style={{ marginBottom: 6 }}>
                            <button
                                type='button'
                                onClick={() => handleChoiceClick(index)}
                                disabled={readOnly || hasAnswered}
                                style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '8px 10px',
                                    borderRadius: 6,
                                    border: '1px solid #ddd',
                                    backgroundColor: bg,
                                    cursor: readOnly || hasAnswered ? 'default' : 'pointer',
                                }}
                            >
                                {choice}
                            </button>
                        </li>
                    )
                })}
            </ul>

            {shouldShowFeedback && (
                <div style={{ marginTop: 8 }}>
                    {answer?.selectedIndex === question.answerIndex ? (
                        <p style={{ color: 'green', marginBottom: 4 }}>Bonne réponse ✅</p>
                    ) : (
                        <p style={{ color: 'red', marginBottom: 4 }}>Mauvaise réponse ❌</p>
                    )}
                    {question.explanation && (
                        <p style={{ fontStyle: 'italic', marginTop: 0 }}>{question.explanation}</p>
                    )}
                </div>
            )}

            {/* Bouton "Question suivante" uniquement en mode interactif */}
            {!readOnly && hasAnswered && onNext && (
                <div style={{ marginTop: 10, textAlign: 'right' }}>
                    <Button onClick={onNext}>
                        Question suivante
                        <ArrowRightIcon />
                    </Button>
                </div>
            )}
        </div>
    )
}
