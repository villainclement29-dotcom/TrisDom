import { atom } from 'nanostores'

export const $CurrentUser = atom(null)

export const $setCurrentUser = (user) => {
  $CurrentUser.set(user)
}
