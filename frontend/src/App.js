import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme, Badge } from 'antd';
import {
  DashboardOutlined,
  LineChartOutlined,
  SettingOutlined,
  ExperimentOutlined,
  BarChartOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import Dashboard from './pages/Dashboard';
import RealTimeMonitor from './pages/RealTimeMonitor';
import PerformanceAnalysis from './pages/PerformanceAnalysis';
import DataExport from './pages/DataExport';
import './App.css';

const { Header, Content, Sider } = Layout;

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '系统仪表板',
    },
    {
      key: 'monitor',
      icon: <LineChartOutlined />,
      label: '实时监测',
    },
    {
      key: 'analysis',
      icon: <BarChartOutlined />,
      label: '性能分析',
    },
    {
      key: 'export',
      icon: <DownloadOutlined />,
      label: '数据导出',
    },
  ];

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'monitor':
        return <RealTimeMonitor />;
      case 'analysis':
        return <PerformanceAnalysis />;
      case 'export':
        return <DataExport />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{
          height: 64,
          margin: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? 16 : 18,
          fontWeight: 'bold',
        }}>
          {collapsed ? '关节监测' : '人体关节监测系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentPage]}
          items={menuItems}
          onClick={({ key }) => setCurrentPage(key)}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <h2 style={{ margin: 0 }}>
            多功能传感器仿真与性能分析平台
          </h2>
          <Badge status="processing" text="系统运行中" />
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
