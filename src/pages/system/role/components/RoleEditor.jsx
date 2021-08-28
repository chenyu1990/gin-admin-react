import React, { useState } from 'react';
import { Checkbox, Divider, message } from 'antd';
import ProForm, {
  ProFormText,
  ProFormRadio, ProFormDigit, ProFormTextArea,
} from '@ant-design/pro-form';
import { FooterToolbar } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import { Role as API, Menu } from '@/services';

const RoleEditor = props => {
  const { initialValues } = props;
  const [roleMenus, setRoleMenus] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [menuDataSource, setMenuDataSource] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  const actionColumns = [
    {
      title: '菜单名称',
      dataIndex: 'name',
    },
    {
      title: '动作权限',
      dataIndex: 'actions',
      render: (actions, record) => {
        return actions?.map?.(({ name, id }) => <Checkbox
          key={id}
          disabled={!roleMenus.find(item => item.menu_id === record.id)}
          checked={roleMenus.find(item => item.action_id === id)}
          onChange={e => {
            if (e.target.checked) {
              setRoleMenus([...roleMenus, { menu_id: record.id, action_id: id }]);
            } else {
              setRoleMenus(roleMenus.filter(item => item.action_id !== id));
            }
          }}
        >{name}</Checkbox>);
      },
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      let roleMenus = [];
      selectedRows.map(menu => {
        menu.actions?.map(item => {
          roleMenus.push({ menu_id: menu.id, action_id: item.id });
        }) || roleMenus.push({ menu_id: menu.id });
      });
      setRoleMenus(roleMenus);
      setSelectedRowKeys(selectedRowKeys);
    },
    onSelect: (record, selected, selectedRows) => {
      console.log('debug onSelect');
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      console.log('debug onSelectAll');
    },
  };

  return (
    <ProForm
      layout={'horizontal'}
      submitter={{
        render: (_, dom) => <FooterToolbar>{dom}</FooterToolbar>,
      }}
      onReset={() => {
        console.log('debug onreset');
      }}
      {...props}
      dataSource={dataSource}
      onLoad={dataSource => setDataSource(dataSource)}
      request={async () => {
        const id = initialValues?.id;
        let menuIDs = [];
        let msg;
        if (id) {
          msg = await API.get({ id });
          if (msg?.status === 'ok') {
            setRoleMenus(msg.data?.role_menus);

            msg.data?.role_menus?.map(item => {
              menuIDs.find(id => item.menu_id === id) || menuIDs.push(item.menu_id);
            });
            setSelectedRowKeys(menuIDs);
          }
        }

        Menu.tree().then(msg => {
          if (msg.status === 'ok') {
            setMenuDataSource(msg?.data || []);
            msg.data?.map?.(item => {
              item.children?.map(it => {
                menuIDs.find(id => id === it.id) && setExpandedRowKeys([...expandedRowKeys, it.parent_id]);
              });
            });
          }
        });

        props.request?.(msg?.data || []);
        return msg?.data || [];
      }}
      onFinish={async data => {
        const id = initialValues?.id;
        const params = { id, ...data, role_menus: roleMenus };
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
      <ProFormText
        name='name'
        width='md'
        label='角色名称'
        labelCol={{ span: 8 }}
        required={true}
      />
      <ProFormDigit
        name='sequence'
        width='md'
        label='排序值'
        labelCol={{ span: 8 }}
        tooltip='降序排列，越大越靠前'
        required={true}
      />
      <ProFormTextArea
        name='memo'
        width='md'
        label='备注'
        labelCol={{ span: 8 }}
      />
      <ProFormRadio.Group
        name='status'
        width='md'
        label='状态'
        labelCol={{ span: 8 }}
        initialValue={1}
        options={[
          { label: '启用', value: 1 },
          { label: '禁用', value: 2 },
        ]}
      />
      <Divider type='horizontal' />
      <ProTable
        rowKey={'id'}
        search={false}
        toolBarRender={false}
        columns={actionColumns}
        dataSource={menuDataSource}
        rowSelection={{ ...rowSelection, checkStrictly: false }}
        tableAlertRender={false}
        expandedRowKeys={expandedRowKeys}
        onExpandedRowsChange={expandedRows => setExpandedRowKeys(expandedRows)}
        size={'small'}
      />
    </ProForm>
  );
};

export default RoleEditor;
