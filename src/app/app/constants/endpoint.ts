import config from "../config/config";

// const baseUrl = config.apiUrl;
const baseUrl = "127.0.0.1:5000";
const URL = `http://${baseUrl}/api/v1`;

export default {
  chat: {
    CREATE_CHAT: `${URL}/chat/`,
    GET_CHAT: `${URL}/chat/{chat_id}`,
    GET_USER_CHATS: `${URL}/chat/user/{user_id}`,
    UPDATE_CHAT: `${URL}/chat/{chat_id}`,
    DELETE_CHAT: `${URL}/chat/{chat_id}`,
    GET_CHAT_MESSAGES: `${URL}/chat/{chat_id}/messages`,
    CREATE_MESSAGE: `${URL}/chat/{chat_id}/messages`,
    GET_MESSAGE: `${URL}/chat/{chat_id}/messages/{message_id}`,
    UPDATE_MESSAGE: `${URL}/chat/{chat_id}/messages/{message_id}`,
    DELETE_MESSAGE: `${URL}/chat/{chat_id}/messages/{message_id}`,
    WEBSOCKET: `ws://${baseUrl}/api/v1/chat/ws/{chat_id}`,
  },
  docSathi: {
    GET_UPLOADED_DOCUMENTS: `${URL}/docSathi/get-all-documents/:user_id`,
    GET_PRESIGNED_URL: `${URL}/docSathi/pre-signed-url`,
    UPLOAD_DOCUMENTS: `${URL}/docSathi/upload-document`,
    DELETE_DOCUMENT_BY_USER: `${URL}/docSathi/delete-document/:docId`,
    CHECK_TRAINING_DOC_STATUS: `${URL}/docSathi/check-document-status`,
    GET_ALL_CHAT_History_TO_EXPORT_BY_CHAT_ID: `${URL}/docSathi/get-chat-messages/:chat_id`,
  },
  auth: {
    SIGNIN: `${URL}/auth/login`,
    SIGNUP: `${URL}/auth/sign-up`,
    TEMP_USER_ADD: `${URL}/auth/temp-user-add`,
    FORGOT_PASSWORD: `${URL}/auth/forgot-password`,
    OTP_VERIFICATION: `${URL}/auth/otp-verification`,
    RESET_PASSWORD: `${URL}/auth/reset-password`,
    GET_ALL_FORM_DATA: `${URL}/auth/get-all-form-data`,
    ORGANIZATION_DETAIL_SUBMIT: `${URL}/auth/onboard-user`,
    RESEND_OTP: `${URL}/auth/resend-otp-temp`,
    OTP_VERIFICATION_TEMP: `${URL}/auth/otp-verification-temp-user`,
  },
  default_prompt: {
    GET_ALL_LANGUAGES_CODE: `${URL}/default-prompts/get-all-languages-code`,
  },
};
