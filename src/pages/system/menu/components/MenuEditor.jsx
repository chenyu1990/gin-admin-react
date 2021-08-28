import React, { useState } from 'react';
import { AutoComplete, Button, Divider, Input, message, Modal, Tooltip } from 'antd';
import ProForm, {
  ProFormText,
  ProFormRadio, ProFormDigit, ProFormSelect,
} from '@ant-design/pro-form';
import { FooterToolbar } from '@ant-design/pro-layout';
import { EditableProTable } from '@ant-design/pro-table';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Menu as API } from '@/services';

const code = [
  { value: 'add' },
  { value: 'edit' },
  { value: 'del' },
  { value: 'query' },
  { value: 'disable' },
  { value: 'enable' },
];
const name = [
  { value: '新增' },
  { value: '编辑' },
  { value: '删除' },
  { value: '查询' },
  { value: '禁用' },
  { value: '启用' },
];
const method = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'DELETE', label: 'DELETE' },
  { value: 'PATCH', label: 'PATCH' },
  { value: 'HEAD', label: 'HEAD' },
  { value: 'OPTIONS', label: 'OPTIONS' },
];

const defaultActionData = () => {
  const now = Date.now();
  return new Array(6).fill(1).map((_, index) => {
    return {
      id: now + index,
      code: code[index].value,
      name: name[index].value,
      state: 'open',
    };
  });
};

const generateResourceData = (action, path) => {
  const now = Date.now();
  const apiVersion = '/api/v1';
  const resource = {
    'c': [
      { id: now + 1, method: 'POST', path: `${apiVersion}/${path}` },
    ],
    'u': [
      { id: now + 2, method: 'GET', path: `${apiVersion}/${path}/:id` },
      { id: now + 3, method: 'PUT', path: `${apiVersion}/${path}/:id` },
    ],
    'r': [
      { id: now + 4, method: 'GET', path: `${apiVersion}/${path}` },
    ],
    'd': [
      { id: now + 5, method: 'DELETE', path: `${apiVersion}/${path}/:id` },
    ],
    'en': [
      { id: now + 6, method: 'PATCH', path: `${apiVersion}/${path}/:id/enable` },
    ],
    'dis': [
      { id: now + 6, method: 'PATCH', path: `${apiVersion}/${path}/:id/disable` },
    ],
  };
  return resource[action];
};

const MenuEditor = props => {
  const { initialValues } = props;
  const actions = defaultActionData();
  const [actionEditableKeys, setActionEditableRowKeys] = useState(() => initialValues?.actions?.map(item => item.id) || actions.map(item => item.id));
  const [actionDataSource, setActionDataSource] = useState(() => initialValues?.actions || actions);
  const [resourceEditableKeys, setResourceEditableRowKeys] = useState([]);
  const [resourceDataSource, setResourceDataSource] = useState();
  const [resourceModalVisit, setResourceModalVisit] = useState(false);
  const [resourceTitle, setResourceTitle] = useState('');

  const [path, setPath] = useState();
  const [actionID, setActionID] = useState();

  const actionColumns = [
    {
      title: '动作编号',
      dataIndex: 'code',
      fieldProps: {
        options: code,
      },
      renderFormItem: ({ title, fieldProps }) => <AutoComplete {...fieldProps} />,
    },
    {
      title: '动作名称',
      dataIndex: 'name',
      fieldProps: {
        options: name,
      },
      renderFormItem: ({ title, fieldProps }) => <AutoComplete {...fieldProps} />,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
    },
  ];

  const resourceColumns = [
    {
      title: '请求方法',
      dataIndex: 'method',
      valueType: 'select',
      fieldProps: {
        options: method,
      },
    },
    {
      title: 'URI',
      dataIndex: 'path',
    },
    {
      title: '操作',
      valueType: 'option',
    },
  ];

  const saveResourceData = action => {
    const resources = generateResourceData(action, path);
    setResourceDataSource(resources);
    setResourceEditableRowKeys(resources.map(item => item.id));
    setActionDataSource(actionDataSource.map(item => {
      if (item.id === actionID) {
        return { ...item, resources };
      }
      return item;
    }));
  };

  return (
    <ProForm
      submitter={{
        render: (_, dom) => <FooterToolbar>{dom}</FooterToolbar>,
      }}
      onReset={() => {
        console.log('debug onreset');
      }}
      {...props}
      request={async () => {
        const id = initialValues?.id;
        if (!id) return [];
        const msg = await API.get({ id });
        if (msg?.status === 'ok') {
          setActionEditableRowKeys(msg.data.actions?.map(item => item.id));
          setActionDataSource(msg.data.actions || []);
        }
        props.request?.(msg?.data);
        return msg?.data;
      }}
      onFinish={async data => {
        const id = initialValues?.id;
        const params = { id, ...data, actions: actionDataSource };
        const action = id ? '更新' : '创建';
        const api = id ? API.update : API.create;
        const hide = message.loading(`正在${action}`);
        const msg = await api(params);
        hide();
        if (msg?.status === 'ok') {
          message.success(`${action}成功`);
        } else {
          message.error(`${action}失败请重试！`);
        }
        props.onFinish?.({ data: params, status: msg?.status });
      }}
    >
      <ProForm.Group>
        <ProFormText
          name='name'
          width='md'
          label='菜单名称'
          placeholder='请输入菜单'
          required={true}
        />
        <ProFormSelect
          name='parent_id'
          width='md'
          label='父级内码'
          request={async () => {
            const msg = await API.query();
            if (msg?.status === 'ok') {
              return msg.data?.map?.(({ name, id }) => {
                return { label: name, value: id };
              }) || [];
            }
            return [];
          }}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormText
          name='icon'
          width='md'
          label='菜单图标'
          tooltip='图标仅支持官方Icon图标'
        />
        <ProFormText
          name='router'
          width='md'
          label='访问路由'
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormRadio.Group
          name='is_show'
          width='md'
          label='可见状态'
          initialValue={1}
          options={[
            { label: '显示', value: 1 },
            { label: '隐藏', value: 2 },
          ]}
        />
        <ProFormRadio.Group
          name='status'
          width='md'
          label='状态'
          initialValue={1}
          options={[
            { label: '启用', value: 1 },
            { label: '禁用', value: 2 },
          ]}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormDigit
          name='sequence'
          width='md'
          label='排序值'
          tooltip='降序排列，越大越靠前'
          required={true}
        />
      </ProForm.Group>
      <Divider type='horizontal' />
      <EditableProTable headerTitle='动作管理' rowKey='id' value={actionDataSource}
                        onChange={setActionDataSource} columns={actionColumns}
                        recordCreatorProps={{
                          newRecordType: 'dataSource',
                          record: () => ({ id: Date.now() }),
                        }}
                        toolBarRender={() => {
                          return [
                            <Button type='danger' key='clear' onClick={() => {
                              setActionDataSource([]);
                              setActionEditableRowKeys([]);
                            }}>清空</Button>,
                            <Button type='primary' key='tpl_curd' onClick={() => {
                              const actions = defaultActionData().slice(0, 4);
                              setActionDataSource(actions);
                              setActionEditableRowKeys(actions.map(item => item.id));
                            }}>增删改查</Button>,
                            <Button type='primary' key='tpl_normal' onClick={() => {
                              const actions = defaultActionData().slice(0, 6);
                              setActionDataSource(actions);
                              setActionEditableRowKeys(actions.map(item => item.id));
                            }}>常用模板</Button>,
                          ];
                        }}
                        editable={{
                          type: 'multiple',
                          editableKeys: actionEditableKeys,
                          actionRender: (row, config, defaultDoms) => [defaultDoms.delete,
                            <a key={row.id} onClick={() => {
                              setPath('');
                              setActionID(row.id);
                              setResourceDataSource(row.resources || []);
                              setResourceEditableRowKeys(row.resources?.map(item => item.id));
                              setResourceModalVisit(true);
                              setResourceTitle(row.name);
                            }}>资源管理</a>],
                          onValuesChange: (record, recordList) => {
                            const menu_id = initialValues?.id || new Date.now();
                            const actions = recordList.map(item => ({ ...item, menu_id }));
                            setActionDataSource(actions);
                          },
                          onChange: setActionEditableRowKeys,
                        }} />
      <Modal
        destroyOnClose
        title='资源管理'
        visible={resourceModalVisit}
        onCancel={() => setResourceModalVisit(false)}
        footer={null}
        width={800}
      >
        <EditableProTable headerTitle={resourceTitle} rowKey='id' value={resourceDataSource}
                          onChange={setResourceDataSource} columns={resourceColumns}
                          recordCreatorProps={{
                            newRecordType: 'dataSource',
                            record: () => ({ id: Date.now() }),
                          }}
                          toolBarRender={() => {
                            return [
                              <Tooltip title='例：menus，输入后，点击右侧按钮'>
                                <InfoCircleOutlined />
                              </Tooltip>,
                              <Input value={path} onChange={e => {
                                setPath(e.target.value);
                              }} />,
                              <Button type='primary' key='c' onClick={() => saveResourceData('c')}>增</Button>,
                              <Button type='primary' key='u' onClick={() => saveResourceData('u')}>改</Button>,
                              <Button type='primary' key='r' onClick={() => saveResourceData('r')}>查</Button>,
                              <Button type='primary' key='d' onClick={() => saveResourceData('d')}>删</Button>,
                              <Button type='primary' key='en' onClick={() => saveResourceData('en')}>启</Button>,
                              <Button type='primary' key='dis' onClick={() => saveResourceData('dis')}>禁</Button>,
                              <Button type='danger' key='clear' onClick={() => {
                                setResourceDataSource([]);
                                setResourceEditableRowKeys([]);
                              }}>清空</Button>,
                            ];
                          }}
                          editable={{
                            type: 'multiple',
                            editableKeys: resourceEditableKeys,
                            resourceRender: (row, config, defaultDoms) => {
                              return [defaultDoms.delete];
                            },
                            onValuesChange: (record, recordList) => {
                              setResourceDataSource(recordList);
                              setActionDataSource(actionDataSource.map(item => {
                                if (item.id === actionID) {
                                  return { ...item, resources: recordList };
                                }
                                return item;
                              }));
                            },
                            onChange: setResourceEditableRowKeys,
                          }} />
      </Modal>
    </ProForm>
  );
};

export default MenuEditor;
