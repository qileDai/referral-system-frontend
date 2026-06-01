import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Timeline, Spin, message } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  RiseOutlined,
  BriefcaseOutlined,
  GiftOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { Column, Pie } from '@ant-design/charts';
import { api } from '../services/api';
import { DashboardSummary, RecentActivity } from '../types';
import dayjs from 'dayjs';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [summaryData, activitiesData] = await Promise.all([
        api.getDashboardSummary(),
        api.getRecentActivity(),
      ]);
      setSummary(summaryData);
      setActivities(activitiesData);
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: 'blue',
      screening: 'cyan',
      interviewing: 'processing',
      offer_sent: 'warning',
      offer_accepted: 'orange',
      hired: 'success',
      rejected: 'error',
      withdrawn: 'default',
      pending: 'warning',
      paid: 'success',
    };
    return colors[status] || 'default';
  };

  const topReferrersColumns = [
    {
      title: '排名',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '工号',
      dataIndex: 'employee_id',
      key: 'employee_id',
    },
    {
      title: '成功推荐',
      dataIndex: 'successful_referrals',
      key: 'successful_referrals',
      sorter: (a: any, b: any) => a.successful_referrals - b.successful_referrals,
    },
    {
      title: '总推荐',
      dataIndex: 'total_referrals',
      key: 'total_referrals',
    },
    {
      title: '总奖励',
      dataIndex: 'total_rewards',
      key: 'total_rewards',
      render: (value: string) => `¥${value}`,
    },
  ];

  const monthlyChartConfig = {
    data: [
      ...(summary?.monthly_referrals || []).map(item => ({
        month: item.month,
        value: item.count,
        type: '推荐数',
      })),
      ...(summary?.monthly_referrals || []).map(item => ({
        month: item.month,
        value: item.hired,
        type: '入职数',
      })),
    ],
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    isGroup: true,
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
    label: {
      position: 'top',
    },
    meta: {
      month: { alias: '月份' },
      value: { alias: '数量' },
      type: { alias: '类型' },
    },
  };

  const pieChartConfig = {
    data: summary?.status_distribution.map(item => ({
      type: item.status_display,
      value: item.count,
    })) || [],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总推荐数"
              value={summary?.total_referrals || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="成功入职"
              value={summary?.total_hired || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="转化率"
              value={summary?.conversion_rate || 0}
              suffix="%"
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总奖励金额"
              value={summary?.total_rewards || 0}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃岗位"
              value={summary?.active_positions || 0}
              prefix={<BriefcaseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃内推人"
              value={summary?.active_referrers || 0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待发放奖励"
              value={summary?.pending_rewards || 0}
              prefix={<GiftOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="本月新增"
              value={summary?.monthly_referrals[summary?.monthly_referrals.length - 1]?.count || 0}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="月度推荐趋势">
            <Column {...monthlyChartConfig} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="内推状态分布">
            <Pie {...pieChartConfig} height={300} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Top 内推人">
            <Table
              dataSource={summary?.top_referrers || []}
              columns={topReferrersColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="最近动态">
            <Timeline mode="left">
              {activities.slice(0, 10).map((activity, index) => (
                <Timeline.Item
                  key={index}
                  label={dayjs(activity.time).format('MM-DD HH:mm')}
                  color={getStatusColor(activity.status)}
                >
                  <div>
                    <strong>{activity.title}</strong>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      {activity.description}
                    </div>
                    <Tag color={getStatusColor(activity.status)} size="small">
                      {activity.status_display}
                    </Tag>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
