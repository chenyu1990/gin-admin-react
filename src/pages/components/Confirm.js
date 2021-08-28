import React from 'react';
import { Input, Modal } from 'antd';

const { confirm } = Modal;

export default (options) => {
  const { content, placeholder, confirmValue } = options;
  const modal = confirm({
    okType: confirmValue ? 'danger' : '',
    okButtonProps: {
      disabled: !!confirmValue,
    },
    closable: true,
    maskClosable: true,
    centered: true,
    autoFocusButton: 'cancel',
    ...options,
    content: (
      <>
          <span style={{
            marginBottom: '10px',
            display: 'block',
          }}>
            {content}
          </span>
        {confirmValue ?
          <Input placeholder={placeholder}
                 onChange={({ target: { value } }) => {
                   modal.update({
                     okButtonProps: {
                       disabled: value !== confirmValue,
                     },
                   });
                 }} /> : null}
      </>
    ),
  });
}
