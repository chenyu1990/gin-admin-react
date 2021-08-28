import { C, U, R, D, G, status } from '@/services/base';

const api = '/api/v1/menus';
const query = async (params, options) => {
  return R(api, params, options);
};

const update = async (params, options) => {
  return U(api, params, options);
};

const create = async (params, options) => {
  return C(api, params, options);
};

const remove = async (params, options) => {
  return D(api, params, options);
};

const get = async (params, options) => {
  return G(api, params, options);
};

const tree = async (params, options) => {
  return R(api + '.tree', {}, options);
};

const enable = async (params, options) => {
  return status(api, { ...params, status: 'enable' }, options);
};

const disable = async (params, options) => {
  return status(api, { ...params, status: 'disable' }, options);
};

export default {
  query,
  update,
  create,
  remove,
  get,
  tree,
  enable,
  disable,
};
