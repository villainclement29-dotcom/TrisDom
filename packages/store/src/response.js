import { atom } from 'nanostores'

export const $LearnResponses = atom({})
export const $ExerciseFullResponse = atom({})
export const $QcmFullResponse = atom({})
export const $QcmSummary = atom({})
export const $QCMScore = atom({})
export const $LessonImages = atom({})        // { [nodeId]: dataUrl }
export const $LessonImageLoading = atom({})  // { [nodeId]: true }
// export const $QCMbgColor = atom({})

// export const $setQCMbgColor = (rootId, bgColor) => {
//   const current = $QCMbgColor.get()
//   $QCMbgColor.set({ ...current, [rootId]: bgColor })
// }


export const $addLearnResponse = (nodeId, markdown) => {
  const current = $LearnResponses.get()
  $LearnResponses.set({ ...current, [nodeId]: markdown })
}

export const $addExerciseFullResponse = (rootId, reponse) => {
  const current = $ExerciseFullResponse.get()
  $ExerciseFullResponse.set({ ...current, [rootId]: reponse })
}

export const $addQcmResponse = (rootId, reponse) => {
  const current = $QcmFullResponse.get()
  $QcmFullResponse.set({ ...current, [rootId]: reponse })
}

/** ✅ NOUVEAU : stocke le résumé final du QCM */
export const $setQcmSummary = (rootId, summary) => {
  const current = $QcmSummary.get()
  $QcmSummary.set({ ...current, [rootId]: summary })
  console.log('summary du qcm', $QcmSummary.get())
}

export const $removeQcmSummary = (rootId) => {
  const current = $QcmSummary.get()
  const updated = { ...current }
  delete updated[rootId]
  $QcmSummary.set(updated)
}

export const $setQCMScore = (rootId, score) => {
  const current = $QCMScore.get()
  $QCMScore.set({ ...current, [rootId]: score })
}

export const $setLessonImageLoading = (nodeId) => {
  $LessonImageLoading.set({ ...$LessonImageLoading.get(), [nodeId]: true })
}

export const $addLessonImage = (nodeId, dataUrl) => {
  $LessonImages.set({ ...$LessonImages.get(), [nodeId]: dataUrl })
  const loading = { ...$LessonImageLoading.get() }
  delete loading[nodeId]
  $LessonImageLoading.set(loading)
}


