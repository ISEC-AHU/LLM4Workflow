/*
 * @Author: dwlinnn
 * @Date: 2024-05-16 16:35:33
 * @LastEditors: Weilin Du
 * @LastEditTime: 2024-06-18 14:32:52
 * @FilePath: \workflow-frontend\src\view\Home.tsx
 * @Description:
 */

import { Layout, theme } from 'antd';
import { Route, Routes, useNavigate } from 'react-router-dom';

import ExternalLinkIcon from '@/assets/external-link.svg?react';
import Logo from '@/assets/logo.svg?react';
import ReadmeViewer from './components/MarkDownViewer/MardkDownViewer';
import Setting from './setting/Setting';
import { UserOutlined } from '@ant-design/icons';
import Workflow from './workflow/Workflow';
import { useEventEmitter } from 'ahooks';

const { Header, Content } = Layout;

function Home() {
  const {
    token: { colorPrimary, borderRadiusLG },
  } = theme.useToken();
  const refresh$ = useEventEmitter();
  const navigate = useNavigate();

  return (
    <Layout>
      <Header
        className="shadow flex items-center justify-between px-4"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
        }}
      >
        <div className="flex items-center">
          <div
            className="font-bold text-2xl cursor-pointer flex items-center"
            onClick={() => navigate('/')}
          >
            <Logo style={{ width: 40, height: 40 }} />
            <span className="ml-2">LLM4Workflow</span>
          </div>
          <a
            target="blank"
            href="https://github.com/ISEC-AHU/EdgeWorkflow"
            className="ml-12 flex items-center"
          >
            <span className="mr-1">EdgeWorkflow</span>
            <ExternalLinkIcon style={{ '--hover-color': colorPrimary }} />
          </a>
        </div>
        <div className="flex items-center">
          {/* <ConfigIcon className="cursor-pointer mr-4 font-medium" /> */}
          <UserOutlined className="cursor-pointer" style={{ fontSize: 20 }} />
        </div>
      </Header>
      <Content>
        <Layout>
          <div
            className="shadow border-r-1 w-[290px] bg-white fixed overflow-auto"
            style={{
              height: '100vh',
              left: 0,
              top: 64,
              bottom: 0,
            }}
          >
            <Setting refresh$={refresh$} />
          </div>
          <Content>
            <div
              className="p-4"
              style={{
                paddingLeft: 400,
                minHeight: 'calc(100vh - 66px)',
                background: '#fff',
                borderRadius: borderRadiusLG,
              }}
            >
              <Routes>
                <Route path="/" element={<ReadmeViewer />} />
                <Route
                  path="/workflow/:workflowId"
                  element={<Workflow refresh$={refresh$} />}
                />
                <Route
                  path="/workflow/add"
                  element={<Workflow refresh$={refresh$} />}
                />
              </Routes>
            </div>
          </Content>
        </Layout>
        {/* <Footer style={{ textAlign: "center" }}>Copy Right</Footer> */}
      </Content>
    </Layout>
  );
}

export default Home;
