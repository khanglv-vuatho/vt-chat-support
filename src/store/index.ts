import { TInfoTyping } from '@/types'
import { createStore } from 'redux'

export const ActionTypes = {
  TOKEN: 'token',
  INFO_TYPING: 'infoTyping'
} as const

export type TInitState = {
  token: string
  infoTyping: TInfoTyping | null
}
const DefaultValueState: TInitState = {
  token: '',
  infoTyping: null
} as const

function counterReducer(state: TInitState = DefaultValueState, action: { type: string; payload: any }) {
  switch (action.type) {
    case ActionTypes.TOKEN:
      return { ...state, token: action.payload }
    case ActionTypes.INFO_TYPING:
      return { ...state, infoTyping: action.payload }
    default:
      return state
  }
}

let store = createStore(counterReducer)

export default store
