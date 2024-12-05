const MESSAGES = {
    // todo: add success messages
}

export type SuccessMessagesType = typeof MESSAGES
export type SuccessMessagesValuesType = typeof MESSAGES[keyof typeof MESSAGES]

export {
    MESSAGES as SUCCESS_MESSAGES
}