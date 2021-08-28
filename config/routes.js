export default [
  {
    path: '/user',
    layout: false,
    routes: [
      { path: '/user', routes: [{ name: '登录', path: '/user/login', component: './user/Login' }] },
      { component: './404' },
    ],
  },
  {
    path: '/welcome',
    name: '欢迎',
    icon: 'smile',
    component: './Welcome',
  },
  {
    path: '/system',
    name: '系统管理',
    routes: [
      { name: '菜单管理', icon: 'menu', path: '/system/menu', component: './system/menu' },
      { name: '角色管理', icon: 'role', path: '/system/role', component: './system/role' },
      { name: '用户管理', icon: 'user', path: '/system/user', component: './system/user' },
    ],
  },
  { path: '/', redirect: '/welcome' },
  { component: './404' },
];
