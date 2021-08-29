import { Button, message, Divider, Select } from 'antd';
import React, { useState, useRef } from 'react';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import { User as API, Role } from '@/services';
import Confirm from '@/pages/components/Confirm';
import { BetaSchemaForm } from '@ant-design/pro-form';
import { PlusOutlined } from '@ant-design/icons';

const handleAdd = async (fields) => {
  const action = '添加';
  const hide = message.loading(`正在${action}`);
  const msg = await API.create({ ...fields });
  hide();
  if (msg?.status === 'ok') {
    message.success(`${action}成功`);
    return true;
  } else {
    message.error(`${action}失败请重试！`);
    return false;
  }
};

const handleUpdate = async (fields) => {
  const action = '更新';
  const hide = message.loading(`正在${action}`);
  const msg = await API.update({ ...fields });
  hide();
  if (msg?.status === 'ok') {
    message.success(`${action}成功`);
    return true;
  } else {
    message.error(`${action}失败请重试！`);
    return false;
  }
};

const handleRemove = async (selectedRows) => {
  const action = '删除';
  if (!selectedRows) return true;
  let hide = message.loading(`正在${action}`);

  try {
    for (const { id } of selectedRows) {
      await API.remove({ id });
    }
    hide();
    message.success(`${action}成功，即将刷新`);
    return true;
  } catch (error) {
    hide?.();
    message.error(`${action}失败，请重试`);
    return false;
  }
};

const TableList = props => {
  const { route: { name: headerTitle } } = props;
  const [layoutType, setLayoutType] = useState('ModalForm');
  const [createModalVisit, setCreateModalVisit] = useState(false);
  const [updateModalVisit, setUpdateModalVisit] = useState(false);
  const [stepFormValues, setStepFormValues] = useState({});
  const [selectedRowsState, setSelectedRows] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [rolesDataSource, setRolesDataSource] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const actionRef = useRef();

  const columns = [
    {
      title: 'ID',
      hideInSearch: true,
      hideInTable: true,
      readonly: true,
      dataIndex: 'id',
    },
    {
      title: '用户名',
      hideInForm: true,
      hideInTable: true,
      dataIndex: 'queryValue',
    },
    {
      title: '用户名',
      hideInSearch: true,
      dataIndex: 'user_name',
      formItemProps: {
        rules: [{ required: true }],
      },
    },
    {
      title: '登录密码',
      hideInSearch: true,
      hideInTable: true,
      dataIndex: 'password',
      formItemProps: {
        rules: [{ required: true }],
      },
    },
    {
      title: '真实姓名',
      hideInSearch: true,
      dataIndex: 'real_name',
      formItemProps: {
        rules: [{ required: true }],
      },
    },
    {
      title: '所属角色',
      hideInSearch: true,
      hideInForm: true,
      dataIndex: 'roles',
      render: (val) => {
        return val.map(item => item.name).join(' | ');
      },
    },
    {
      title: '所属角色',
      hideInTable: true,
      dataIndex: 'user_roles',
      formItemProps: {
        rules: [{ required: true }],
      },
      renderFormItem: (_, __, actions) => {
        return (
          <Select
            mode='multiple'
            allowClear
            style={{ width: '100%' }}
            placeholder='请选择'
            value={selectedRoles}
            onChange={values => {
              setSelectedRoles(values);
              actions?.setFieldsValue?.({ user_roles: values.map(role_id => ({ role_id })) });
            }}
            options={rolesDataSource?.map(({ name, id }) => ({ label: name, value: id }))}
          />
        );
      },
    },
    {
      title: '状态',
      hideInSearch: true,
      hideInTable: true,
      dataIndex: 'status',
      valueType: 'radio',
      initialValue: 1,
      fieldProps: {
        options: [
          { label: '启用', value: 1 },
          { label: '停用', value: 2 },
        ],
      },
    },
    {
      title: '状态',
      hideInForm: true,
      dataIndex: 'status',
      valueType: 'select',
      fieldProps: {
        options: [
          { label: '启用', value: 1 },
          { label: '停用', value: 2 },
        ],
      },
      valueEnum: {
        1: {
          text: '启用',
          status: 'Processing',
        },
        2: {
          text: '停用',
          status: 'Error',
        },
      },
      render: (val, { id, status }) => <Button type='link' onClick={async () => {
        let api = status === 1 ? API.disable : API.enable;
        const msg = await api({ id });
        if (msg?.status === 'ok') {
          setDataSource(dataSource.map((item) => {
            if (item.id === id) {
              return { ...item, status: status === 1 ? 2 : 1 };
            }
            return item;
          }));
        }
      }}>{val}</Button>,
    },
    {
      title: '邮箱',
      hideInSearch: true,
      dataIndex: 'email',
    },
    {
      title: '手机号',
      hideInSearch: true,
      dataIndex: 'phone',
    },
    {
      title: '创建时间',
      hideInForm: true,
      hideInSearch: true,
      dataIndex: 'created_at',
      valueType: 'dateTime',
    },
    {
      title: '操作',
      hideInForm: true,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (<>
        <a onClick={() => {
          setUpdateModalVisit(true);
          const user_roles = record.roles.map(item => ({ role_id: item.id }));
          setStepFormValues({ ...record, user_roles });
          setSelectedRoles(record.roles.map(item => item.id));
        }}>编辑</a>
        <Divider type='vertical' />
        <a onClick={() => {
          const action = '删除';
          const { id, user_name, real_name } = record;
          console.log('debug', record);
          return Confirm({
            title: `确认${action}？`,
            content: <>用户名称：{user_name}<br />
              真是姓名：{real_name}</>,
            confirmValue: user_name,
            placeholder: `请输入“${user_name}”确认${action}`,
            onOk: async () => {
              const msg = await API.remove({ id });
              if (msg?.status === 'ok') {
                setDataSource(dataSource.filter((item) => {
                  return item.id !== record.id;
                }));
              }
            },
          });
        }}>删除</a>
      </>),
    },
  ];
  return (
    <PageContainer>
      <ProTable
        headerTitle={headerTitle}
        actionRef={actionRef}
        rowKey='id'
        search={{ labelWidth: 120 }}
        toolBarRender={() => [<Button type='primary' key='primary' onClick={() => {
          setCreateModalVisit(true);
        }}><PlusOutlined /> 新建</Button>]}
        dataSource={dataSource}
        onLoad={dataSource => setDataSource(dataSource)}
        request={async (params, sorter, filter) => {
          Role.query({ q: 'select' }).then(msg => {
            if (msg?.status === 'ok') {
              setRolesDataSource(msg.data);
            }
          });
          const roleIDs = params.user_roles?.map?.(({ role_id }) => role_id).join(',');
          return API.query({ ...params, roleIDs, sorter, filter });
        }}
        columns={columns}
        tableAlertRender={false}
        rowSelection={{ onChange: (_, selectedRows) => setSelectedRows(selectedRows) }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar extra={<div>已选择{' '}
          <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}项
        </div>}>
          <Button onClick={async () => {
            const action = '删除';
            Confirm({
              title: `确认执行批量？`,
              content: '谨慎操作',
              confirmValue: `确认${action}`,
              placeholder: `请输入“确认${action}”`,
              onOk: async () => {
                const success = await handleRemove(selectedRowsState);
                if (success) {
                  actionRef.current?.reload?.();
                  setSelectedRows([]);
                }
              },
            });
          }}>批量删除</Button>
        </FooterToolbar>
      )}

      {createModalVisit ? (
        <BetaSchemaForm
          title='新建'
          submitter={{
            render: (_, dom) => <FooterToolbar>{dom}</FooterToolbar>,
          }}
          visible={createModalVisit}
          onVisibleChange={setCreateModalVisit}
          modalProps={{
            maskClosable: false,
            destroyOnClose: true,
          }}
          request={async () => {
            const msg = await Role.query({ q: 'select' });
            if (msg?.status === 'ok') {
              setRolesDataSource(msg.data);
              return msg.data;
            }
            return [];
          }}
          width={600}
          layoutType={layoutType}
          onFinish={async values => {
            const success = await handleAdd(values);
            if (success) {
              setCreateModalVisit(false);
              actionRef.current?.reload?.();
            }
          }}
          columns={columns}
        />) : null}

      {stepFormValues && Object.keys(stepFormValues).length ? (
        <BetaSchemaForm
          title='编辑'
          submitter={{
            render: (_, dom) => <FooterToolbar>{dom}</FooterToolbar>,
          }}
          visible={updateModalVisit}
          onVisibleChange={setUpdateModalVisit}
          modalProps={{
            maskClosable: false,
            destroyOnClose: true,
          }}
          initialValues={stepFormValues}
          width={600}
          layoutType={layoutType}
          request={async () => {
            const msg = await Role.query({ q: 'select' });
            if (msg?.status === 'ok') {
              setRolesDataSource(msg.data);
              return msg.data;
            }
            return [];
          }}
          onFinish={async values => {
            const success = await handleUpdate(values);
            if (success) {
              setUpdateModalVisit(false);
              actionRef.current?.reload?.();
            }
          }}
          columns={columns.map(item => {
            if (item.dataIndex === 'password') {
              delete item.formItemProps;
            }
            return item;
          })}
        />
      ) : null}
    </PageContainer>
  );
};

export default TableList;
