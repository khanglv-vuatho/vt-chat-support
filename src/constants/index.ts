export const keyPossmessage = {
  CAN_POP: 'canPop',
  CALL: 'call'
}

export const typeOfMessage = {
  TEXT: 0,
  IMAGE: 1
}

export const typeOfSocket = {
  // v2
  JOIN_CONVERSATION_CMS: 'join-conversation-cms',
  LEAVE_CONVERSATION_CMS: 'leave-conversation-cms',
  MESSAGE_ARRIVE_CMS: 'message-arrive-cms',
  MESSAGE_TYPING_CMS: 'message-typing-cms',
  MESSAGE_SEEN_CMS: 'message-seen-cms',
  MESSAGE_BLOCK_CMS: 'message-block-cms'
} as const

export type TypeOfRule = (typeof typeOfRule)[keyof typeof typeOfRule]

export const typeOfRule = {
  CLIENT: 'client',
  WORKER: 'worker'
} as const

export const commonMotionProps = {
  initial: 'initial',
  animate: 'animate',
  transition: { duration: 0.2 },
  viewport: { once: true }
}

export const typeOfGuarante = {
  none: 0, // không có bảo hành
  is_guaranteed: 1, // có bảo hành
  active: 2, // đang trong thời hạn bảo hành
  expired: 3, // hết hạn
  cancel: 4
} as const

export const typeOfPriceOfOrderDetail = {
  frist_price: 0, // không có bảo hành
  final_price: 1
} as const

export const typeOfBlockMessage = {
  cancelOrder: 'BLOCKED BY CANCEL ORDER',
  acceptPrice: 'BLOCKED BY ACCEPT PRICE',
  completeOrder: 'BLOCKED BY COMPLETED ORDER',
  expressGuarantee: 'BLOCKED BY EXPRIED GUARANTEE'
} as const

export const typeOfUser = {
  cms: 'Hệ thống'
} as const
