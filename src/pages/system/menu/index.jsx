import React, { useState, useRef } from 'react';
import { Button, Layout, Menu, Card, Divider, message, Modal } from 'antd';
import ProTable from '@ant-design/pro-table';
import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import { PlusOutlined } from '@ant-design/icons';
import { Menu as API } from '@/services';
import { jsonToArr } from '@/utils/strings';
import Confirm from '@/pages/components/Confirm';
import sort from '@/utils/sort';
import MenuEditor from '@/pages/system/menu/components/MenuEditor';

// 动态 Icon 图标参考 https://github.com/ant-design/compatible#icon

const { SubMenu } = Menu;
const { Sider, Content } = Layout;

let menusData = [];
const menusDataReload = () => {
  API.query()?.then(msg => {
    if (msg?.status === 'ok') {
      menusData = msg?.data;
    }
  });
};
menusDataReload();

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
      title: '菜单名称',
      hideInForm: true,
      hideInTable: true,
      dataIndex: 'queryValue',
    },
    {
      title: '菜单名称',
      dataIndex: 'name',
      hideInSearch: true,
      formItemProps: {
        rules: [{
          required: true,
          message: '菜单名称为必填项',
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
      title: '菜单图标',
      dataIndex: 'icon',
      tip: '图标仅支持官方Icon图标',
      hideInSearch: true,
    },
    {
      title: '访问路由',
      dataIndex: 'router',
      hideInSearch: true,
      copyable: true,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '访问路由为必填项',
          },
        ],
      },
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
            const { id, name, router } = record;
            return Confirm({
              title: `确认${action}？`,
              content: <>菜单名称：{name}<br />
                路由：{router}</>,
              confirmValue: name,
              placeholder: `请输入“${name}”确认${action}`,
              onOk: async () => {
                const msg = await API.remove({ id });
                if (msg?.status === 'ok') {
                  menusDataReload();
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

  const menus = jsonToArr(menusData, 'id', 'parent_id', sort('sequence'));

  return (
    <PageContainer>
      <Layout>
        <Sider
          width={200}
          style={{
            background: '#fff',
            borderRight: '1px solid lightGray',
          }}
        >
          {/* 三级菜单参考 TreeSelect 控件*/}
          {/* https://ant.design/components/tree-select-cn/ */}
          <Menu
            mode='inline'
            style={{ height: '100%' }}
          >
            {menus.map(item => {
              const { id, name, children } = item;
              if (children) {
                return <SubMenu key={id} title={name}>
                  {children.map(item => {
                    const { id, name } = item;
                    return <Menu.Item key={id}>{name}</Menu.Item>;
                  })}
                </SubMenu>;
              } else {
                return <Menu.Item key={id}>{name}</Menu.Item>;
              }
            })}
          </Menu>
        </Sider>
        <Content>
          <Card bordered={false}>
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
          </Card>
        </Content>
        <Modal
          destroyOnClose
          title='新建'
          visible={createModalVisit}
          onCancel={() => setCreateModalVisit(false)}
          footer={null}
          maskClosable={false}
          width={900}
        >
          <MenuEditor onFinish={({ status }) => {
            if (status === 'ok') {
              setCreateModalVisit(false);
              menusDataReload();
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
            <MenuEditor
              initialValues={stepFormValues}
              onFinish={({ status, data }) => {
                if (status === 'ok') {
                  setDataSource(dataSource.map((item) => {
                    if (item.id === stepFormValues.id) {
                      return { ...data };
                    }
                    return item;
                  }));
                  menusDataReload();
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
                    menusDataReload();
                  }
                },
              });
            }}>批量删除</Button>
          </FooterToolbar>
        )}
      </Layout>
    </PageContainer>
  );
};

export default TableList;
