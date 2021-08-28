import React, { useState, useRef } from 'react';
import { Button, Layout, Menu, Card, Divider, message, Modal } from 'antd';
import ProTable from '@ant-design/pro-table';
import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import { PlusOutlined } from '@ant-design/icons';
import { Role as API } from '@/services';
import Confirm from '@/pages/components/Confirm';
import RoleEditor from '@/pages/system/role/components/RoleEditor';

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
  const [createModalVisit, setCreateModalVisit] = useState(false);
  const [updateModalVisit, setUpdateModalVisit] = useState(false);
  const [stepFormValues, setStepFormValues] = useState({});
  const [selectedRowsState, setSelectedRows] = useState([]);
  const [dataSource, setDataSource] = useState([]);
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
      title: '角色名称',
      hideInForm: true,
      hideInTable: true,
      dataIndex: 'queryValue',
    },
    {
      title: '角色名称',
      dataIndex: 'name',
      hideInSearch: true,
      formItemProps: {
        rules: [{
          required: true,
          message: '角色名称为必填项',
        }],
      },
    },
    {
      title: '排序',
      hideInSearch: true,
      dataIndex: 'sequence',
      tip: '降序排列，越大越靠前',
      formItemProps: {
        rules: [
          {
            required: true,
            message: '排序为必填项',
          },
        ],
      },
    },
    {
      title: '备注',
      dataIndex: 'memo',
      hideInSearch: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      fieldProps: {
        options: [
          { label: '启用', value: 1 },
          { label: '禁用', value: 2 },
        ],
      },
      valueEnum: {
        1: {
          text: '启用',
          status: 'Processing',
        },
        2: {
          text: '禁用',
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
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <>
          <a onClick={() => {
            setUpdateModalVisit(true);
            setStepFormValues(record);
          }}
          >编辑</a>
          <Divider type='vertical' />
          <a onClick={() => {
            const action = '删除';
            const { id, name } = record;
            return Confirm({
              title: `确认${action}？`,
              content: <>角色名称：{name}</>,
              confirmValue: name,
              placeholder: `请输入“${name}”确认${action}`,
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
        </>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable
        style={{ width: '100%' }}
        actionRef={actionRef}
        rowKey='id'
        search={{ labelWidth: 120 }}
        toolBarRender={() => [<Button type='primary' key='primary' onClick={() => {
          setCreateModalVisit(true);
        }}><PlusOutlined /> 新建</Button>]}
        dataSource={dataSource}
        onLoad={dataSource => setDataSource(dataSource)}
        request={(params, sorter, filter) => API.query({ ...params, sorter, filter })}
        columns={columns}
        rowSelection={{ onChange: (_, selectedRows) => setSelectedRows(selectedRows) }}
        tableAlertRender={false}
        size={'small'}
      />
      <Modal
        destroyOnClose
        title='新建'
        visible={createModalVisit}
        onCancel={() => setCreateModalVisit(false)}
        footer={null}
        maskClosable={false}
        width={900}
      >
        <RoleEditor onFinish={({ status }) => {
          if (status === 'ok') {
            setCreateModalVisit(false);
            actionRef.current?.reload?.();
          }
        }} />
      </Modal>
      {stepFormValues && Object.keys(stepFormValues).length ? (
        <Modal
          destroyOnClose
          title='编辑'
          visible={updateModalVisit}
          onCancel={() => setUpdateModalVisit(false)}
          footer={null}
          maskClosable={false}
          width={900}
        >
          <RoleEditor
            initialValues={stepFormValues}
            onFinish={({ status, data }) => {
              if (status === 'ok') {
                setDataSource(dataSource.map((item) => {
                  if (item.id === stepFormValues.id) {
                    return { ...data };
                  }
                  return item;
                }));
                setUpdateModalVisit(false);
              }
            }}
          />
        </Modal>
      ) : null}
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
    </PageContainer>
  );
};

export default TableList;
