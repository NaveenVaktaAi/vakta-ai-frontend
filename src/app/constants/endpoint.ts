import config from "../config/config";

// const baseUrl = config.apiUrl;
const baseUrl = "localhost:5000";
const URL = `${window.location.protocol}//${baseUrl}/api/v1`;

export default {
  // bot: {
  //   CREATE_CHAT_ID: `${URL}/chat/create-new-chat`,
  //   GET_CHAT_MESSAGES: `${URL}/chat/{chat_id}/messages`,
  //   GET_CHATS: `${URL}/chat/all`,
  //   EDIT_CHAT_HISTORY: `${URL}/chat/edit-chat-history`,
  //   DELETE_CHAT_WITH_CHAT_ID: `${URL}/chat/delete-chat`,
  //   DELETE_USERS_ALL_CHAT: `${URL}/chat/delete-user-all-chat`,
  // },
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
