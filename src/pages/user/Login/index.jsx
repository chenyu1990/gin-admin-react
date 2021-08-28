import {
  AlipayCircleOutlined,
  LockOutlined,
  MobileOutlined,
  TaobaoCircleOutlined,
  UserOutlined,
  WeiboCircleOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { Alert, Space, message, Tabs } from 'antd';
import React, { useState } from 'react';
import ProForm, { ProFormCaptcha, ProFormCheckbox, ProFormText } from '@ant-design/pro-form';
import { Link, history, useModel } from 'umi';
import Footer from '@/components/Footer';
import { Login as API } from '@/services';
import styles from './index.less';
import store, { storeKeys } from '@/utils/store';
import md5 from 'md5';

const LoginMessage = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type='error'
    showIcon
  />
);

const Login = () => {
  const getCaptcha = () => {
    API.getCaptcha().then(data => {
      setCaptchaID(data?.data?.captcha_id || '');
    });
    return '';
  };

  const [submitting, setSubmitting] = useState(false);
  const [userLoginState, setUserLoginState] = useState({});
  const [captchaID, setCaptchaID] = useState(getCaptcha);
  const [captchaReload, setCaptchaReload] = useState(new Date);
  const [type, setType] = useState('account');
  const { initialState, setInitialState } = useModel('@@initialState');

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();

    if (userInfo) {
      await setInitialState((s) => ({ ...s, currentUser: userInfo }));
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);

    try {
      // 登录
      const password = md5(values.password);
      const msg = await API.login({ ...values, type, password, captcha_id: captchaID });

      if (msg?.status === 'ok') {
        const defaultLoginSuccessMessage = '登录成功！';
        message.success(defaultLoginSuccessMessage);
        if (msg.data.access_token) {
          store.set(storeKeys.AccessToken, msg.data);
        }
        await fetchUserInfo();
        /** 此方法会跳转到 redirect 参数所在的位置 */

        if (!history) return;
        const { query } = history.location;
        const { redirect } = query;
        history.push(redirect || '/');
        return true;
      } // 如果失败去设置用户错误信息

      setUserLoginState({ status: 'failed', ...msg });
    } catch (error) {
      const defaultLoginFailureMessage = '登录失败，请重试！';
      message.error(defaultLoginFailureMessage);
    }

    setSubmitting(false);
    return false;
  };

  const { status, type: loginType } = userLoginState;
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.top}>
          <div className={styles.header}>
            <Link to='/'>
              <img alt='logo' className={styles.logo} src='/logo.svg' />
              <span className={styles.title}>Gin Admin React</span>
            </Link>
          </div>
          <div
            className={styles.desc}>{'基于 Ant Design React V5 实现的RBAC权限管理脚手架，目的是提供一套轻量的中后台开发框架，方便、快速的完成业务需求的开发。'}</div>
        </div>

        <div className={styles.main}>
          <ProForm
            initialValues={{
              autoLogin: true,
            }}
            submitter={{
              searchConfig: {
                submitText: '登录',
              },
              render: (_, dom) => dom.pop(),
              submitButtonProps: {
                loading: submitting,
                size: 'large',
                style: {
                  width: '100%',
                },
              },
            }}
            onFinish={async (values) => {
              const success = await handleSubmit(values);
              if (success === false) {
                getCaptcha();
              }
            }}
          >
            <Tabs activeKey={type} onChange={setType}>
              <Tabs.TabPane key='account' tab={'账户密码登录'} />
              <Tabs.TabPane key='mobile' tab={'手机号登录'} />
            </Tabs>

            {status === 'error' && loginType === 'account' && (
              <LoginMessage content={'错误的用户名和密码(admin/ant.design)'} />
            )}
            {type === 'account' && (
              <>
                <ProFormText
                  name='user_name'
                  fieldProps={{
                    size: 'large',
                    prefix: <UserOutlined className={styles.prefixIcon} />,
                  }}
                  placeholder={'用户名:'}
                  rules={[
                    {
                      required: true,
                      message: '用户名是必填项！',
                    },
                  ]}
                />
                <ProFormText.Password
                  name='password'
                  fieldProps={{
                    size: 'large',
                    prefix: <LockOutlined className={styles.prefixIcon} />,
                  }}
                  placeholder={'密码:'}
                  rules={[
                    {
                      required: true,
                      message: '密码是必填项！',
                    },
                  ]}
                />
                <>
                  <ProFormText
                    name='captcha_code'
                    fieldProps={{
                      size: 'large',
                      prefix: <MailOutlined className={styles.prefixIcon} />,
                      suffix: captchaID ? <img
                        style={{
                          width: '100px', marginTop: '-20px', marginBottom: '-20px',
                        }}
                        src={`/api/v1/pub/login/captcha?id=${captchaID}&reload=${captchaReload}`}
                        alt='验证码'
                        onClick={() => setCaptchaReload(new Date)}
                      /> : null,
                    }}
                    placeholder={'图形验证码:'}
                  />

                </>
              </>
            )}

            {status === 'error' && loginType === 'mobile' && <LoginMessage content='验证码错误' />}
            {type === 'mobile' && (
              <>
                <ProFormText
                  fieldProps={{
                    size: 'large',
                    prefix: <MobileOutlined className={styles.prefixIcon} />,
                  }}
                  name='mobile'
                  placeholder={'请输入手机号！'}
                  rules={[
                    {
                      required: true,
                      message: '手机号是必填项！',
                    },
                    {
                      pattern: /^1\d{10}$/,
                      message: '不合法的手机号！',
                    },
                  ]}
                />
                <ProFormCaptcha
                  fieldProps={{
                    size: 'large',
                    prefix: <LockOutlined className={styles.prefixIcon} />,
                  }}
                  captchaProps={{
                    size: 'large',
                  }}
                  placeholder={'请输入验证码！'}
                  captchaTextRender={(timing, count) => {
                    if (timing) {
                      return `${count} ${'秒后重新获取'}`;
                    }

                    return '获取验证码';
                  }}
                  name='captcha'
                  rules={[
                    {
                      required: true,
                      message: '验证码是必填项！',
                    },
                  ]}
                  onGetCaptcha={async (phone) => {
                    message.success('获取验证码成功！验证码为：1234');
                  }}
                />
              </>
            )}
            <div
              style={{
                marginBottom: 24,
              }}
            >
              <ProFormCheckbox noStyle name='autoLogin'>
                自动登录
              </ProFormCheckbox>
              <a
                style={{
                  float: 'right',
                }}
              >
                忘记密码 ?
              </a>
            </div>
          </ProForm>
          <Space className={styles.other}>
            其他登录方式 :
            <AlipayCircleOutlined className={styles.icon} />
            <TaobaoCircleOutlined className={styles.icon} />
            <WeiboCircleOutlined className={styles.icon} />
          </Space>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
