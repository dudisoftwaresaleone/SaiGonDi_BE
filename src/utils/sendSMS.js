/* eslint-disable no-console */
import ApiError from './ApiError.js'

const sendSMS = async (to, body) => {
  throw new ApiError(501, 'Tính năng gửi SMS hiện đang được phát triển')
}

export default sendSMS