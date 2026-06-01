import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, message, Spin } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  SolutionOutlined,
  GiftOutlined,
  SettingOutlined,
  LogoutOutlined,
  BriefcaseOutlined,
} from '@ant-design/icons';
import { api } from './services/api';
import { User } from './types';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Positions from './pages/Positions';
import Referrers from './pages/Referrers';
import Candidates from './pages/Candidates';
import Referrals from './pages/Referrals';
import Rewards from './pages/Rewards';

const { Header, Sider, Content } = Layout;

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (!api.isAuthenticated()) {
      setLoading(false);
      return;
    }

    try {
      await api.getCurrentUser();
      setAuthenticated(true);
    } catch (error) {
      api.logout();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const MainLayout: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const userData = await api.getCurrentUser();
      setUser(userData);
    } catch (error) {
      message.error('获取用户信息失败');
    }
  };

  const handleLogout = () => {
    api.logout();
    navigate('/login');
    message.success('已退出登录');
  };

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: '仪表板' },
    { key: '/positions', icon: <BriefcaseOutlined />, label: '岗位管理' },
    { key: '/referrers', icon: <TeamOutlined />, label: '内推人管理' },
    { key: '/candidates', icon: <UserOutlined />, label: '候选人管理' },
    { key: '/referrals', icon: <SolutionOutlined />, label: '内推记录' },
    { key: '/rewards', icon: <GiftOutlined />, label: '奖励管理' },
  ];

  const userMenuItems = [
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout },
  ];

  const selectedKey = location.pathname;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        style={{
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
          zIndex: 10,
        }}
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ margin: 0, color: '#1890ff', fontSize: collapsed ? 14 : 18 }}>
            {collapsed ? '内推' : '内推系统'}
          </h2>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems.map(item => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
            onClick: () => navigate(item.key),
          }))}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Button
            type="text"
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16 }}
          >
            {collapsed ? '>' : '<'}
          </Button>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user?.first_name || user?.username}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8, minHeight: 280 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/positions" element={<Positions />} />
            <Route path="/referrers" element={<Referrers />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/rewards" element={<Rewards />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
