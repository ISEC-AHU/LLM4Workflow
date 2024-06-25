/*
 * @Author: dwlinnn
 * @Date: 2024-05-07 12:49:56
 * @LastEditors: dwlinnn
 * @LastEditTime: 2024-05-22 09:57:34
 * @FilePath: \workflow-frontend\src\App.tsx
 * @Description:
 */
import { ConfigProvider } from 'antd';
import Home from './view/Home';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 2,
          fontSize: 16,
        },
        components: {
          Layout: {
            headerBg: '#fff',
            bodyBg: '#fff',
          },
        },
      }}
    >
      <Home />
    </ConfigProvider>
  );
}

export default App;
