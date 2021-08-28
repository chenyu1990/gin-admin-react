import { request } from 'umi';

const R = async (api, params, options) => {
  return request(api, {
    method: 'GET',
    params: { ...params },
    ...(options || {}),
  }).catch(() => {
  });
};

const U = async (api, params, options) => {
  const { id } = params;
  return request(`${api}/${id}`, {
    method: 'PUT',
    data: { ...params },
    ...(options || {}),
  }).catch(() => {
  });
};

const C = async (api, params, options) => {
  return request(api, {
    method: 'POST',
    data: { ...params },
    ...(options || {}),
  }).catch(() => {
  });
};

const D = async (api, params, options) => {
  const { id } = params;
  return request(`${api}/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  }).catch(() => {
  });
};

const G = async (api, params, options) => {
  const { id } = params;
  return request(`${api}/${id}`, {
    method: 'GET',
    ...(options || {}),
  }).catch(() => {
  });
};

const status = async (api, params, options) => {
  const { id, status } = params;
  return request(`${api}/${id}/${status}`, {
    method: 'PATCH',
    ...(options || {}),
  }).catch(() => {
  });
};

export {
  C,
  U,
  R,
  D,
  G,
  status,
};
