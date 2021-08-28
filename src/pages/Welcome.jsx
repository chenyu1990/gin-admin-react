import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Alert, Typography } from 'antd';
import styles from './Welcome.less';

const CodePreview = ({ children }) => (
  <pre className={styles.pre}>
    <code>
      <Typography.Text copyable>{children}</Typography.Text>
    </code>
  </pre>
);

export default () => {
  return (
    <PageContainer
      title={`您好，祝您开心每一天！`}
    >
      <Card>
        <Alert
          message="gin-admin 6.0.0 现已发布，欢迎使用下载启动体验。"
          type="success"
          showIcon
          banner
          style={{
            margin: -12,
            marginBottom: 24,
          }}
        />
        <Typography.Text strong>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/LyricTian/gin-admin"
          >
            1. 下载并启动服务
          </a>
        </Typography.Text>
        <CodePreview>git clone https://github.com/LyricTian/gin-admin.git</CodePreview>
        <CodePreview>cd gin-admin</CodePreview>
        <CodePreview>
          go run cmd/gin-admin/main.go web -c ./configs/config.toml -m ./configs/model.conf --menu
          ./configs/menu.yaml
        </CodePreview>
        <CodePreview>
          启动成功之后，可在浏览器中输入地址进行访问：http://localhost:8000
        </CodePreview>
        <CodePreview>
          可在浏览器中查看接口文档：http://127.0.0.1:10088/swagger/index.html
        </CodePreview>
        <Typography.Text
          strong
          style={{
            marginBottom: 12,
          }}
        >
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/LyricTian/gin-admin-react"
          >
            2. 下载并运行 gin-admin-react
          </a>
        </Typography.Text>
        <CodePreview>git clone https://github.com/gin-admin/gin-admin-react.git</CodePreview>
        <CodePreview>cd gin-admin-react</CodePreview>
        <CodePreview>yarn</CodePreview>
        <CodePreview>yarn start</CodePreview>
      </Card>
    </PageContainer>
  );
};
