import { request } from 'umi';

const currentUser = async (options) => {
  return request('/api/v1/pub/current/user', {
    method: 'GET',
    ...(options || {}),
  }).catch(() => {
  });
};

const outLogin = async (options) => {
  return request('/api/v1/pub/login/exit', {
    method: 'POST',
    ...(options || {}),
  }).catch(() => {
  });
};

const login = async (body, options) => {
  return request('/api/v1/pub/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  }).catch(() => {
  });
};

const getCaptcha = async () => {
  return request('/api/v1/pub/login/captchaid', {
    method: 'GET',
  }).catch(() => {
  });
};

const resCaptcha = async (captchaID) => {
  try {
    const msg = await request(`/api/v1/pub/login/captcha?id=${captchaID}&reload=true`, {
      method: 'GET',
    });
    return msg.data;
  } catch (error) {
    return '';
  }
};

export default {
  currentUser,
  outLogin,
  login,
  getCaptcha,
  resCaptcha,
};
