const CODES = {
    POST_ALREADY_LIKED: 400,
    POST_ALREADY_SAVED: 400,
    BAD_PASSWORD: 400,
    BAD_USERNAME: 400,
    USER_NOT_FOUND: 404,
    POST_NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
}

const MESSAGES = {
    POST_ALREADY_LIKED: 'errors:post_already_liked',
    POST_ALREADY_SAVED: 'errors:post_already_saved',
    BAD_PASSWORD: 'errors:bad_password',
    BAD_USERNAME: 'errors:bad_username',
    USER_NOT_FOUND: 'errors:user_not_found',
    POST_NOT_FOUND: 'errors:post_not_found',
    INTERNAL_SERVER_ERROR: 'errors:internal_server_error',
}

export type ErrorCodesType = typeof CODES
export type ErrorCodesValuesType = typeof CODES[keyof typeof CODES]

export type ErrorMessagesType = typeof MESSAGES
export type ErrorMessagesValuesType = typeof MESSAGES[keyof typeof MESSAGES]

export {
    CODES as ERROR_CODES,
    MESSAGES as ERROR_MESSAGES
}