import { PageLoading } from '@ant-design/pro-layout';
import { history, Link } from 'umi';
import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';
import { Login } from './services';
import { BookOutlined, LinkOutlined } from '@ant-design/icons';
import store, { storeKeys } from './utils/store';

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';
/** 获取用户信息比较慢的时候会展示一个 loading */

export const initialStateConfig = {
  loading: <PageLoading />,
};
/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */

const headerKeys = {
  ContentType: 'Content-Type',
  Authorization: 'Authorization',
};

// request 拦截器
function requestInterceptors(url, options) {
  const token = store.get(storeKeys.AccessToken);
  if (token && token.access_token !== '') {
    options.headers[headerKeys.Authorization] = `${token.token_type} ${token.access_token}`;
  }
  return { url, options };
}

// response 拦截器
function responseInterceptors(response) {
  const { status: statusCode, statusText } = response;
  return response.json()?.then(body => {
    const status = statusCode === 200 ? 'ok' : 'fail';
    const result = { status, statusCode };
    if (body?.list) {
      result.data = body.list;
      result.total = body.pagination?.total;
    } else {
      result.data = body;
    }
    return result;
  }).catch(err => {
    return { errorMessage: err, statusCode, statusText };
  });
}

export const request = {
  useCache: false,
  credentials: 'include',
  errorConfig: {
    adaptor: res => {
      let error = {
        success: res.statusCode === 200,
        errorMessage: res.statusText,
        data: res.data,
        errorCode: res.statusCode,
      };

      if (res.data?.error?.message) {
        error.errorMessage = res.data.error.message;
      }
      if (res.statusCode === 401) {
        history.push(loginPath);
      }
      return error;
    },
  },
  requestInterceptors: [requestInterceptors],
  responseInterceptors: [responseInterceptors],
};

export async function getInitialState() {
  const fetchUserInfo = async () => {
    try {
      const msg = await Login.currentUser();
      return msg.data;
    } catch (error) {
      history.push(loginPath);
    }

    return undefined;
  }; // 如果是登录页面，不执行

  if (history.location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: {},
    };
  }

  return {
    fetchUserInfo,
    settings: {},
  };
} // ProLayout 支持的api https://procomponents.ant.design/components/layout

export const layout = ({ initialState }) => {
  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    waterMarkProps: {
      content: initialState?.currentUser?.name,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history; // 如果没有登录，重定向到 login

      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    links: isDev
      ? [
        <Link to='/umi/plugin/openapi' target='_blank'>
          <LinkOutlined />
          <span>OpenAPI 文档</span>
        </Link>,
        <Link to='/~docs'>
          <BookOutlined />
          <span>业务组件文档</span>
        </Link>,
      ]
      : [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    ...initialState?.settings,
  };
};
