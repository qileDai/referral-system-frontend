import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Card, Input, Select, Modal, Form, message, Statistic, Row, Col, Descriptions, DatePicker } from 'antd';
import { SearchOutlined, EyeOutlined, CheckCircleOutlined, DollarOutlined, GiftOutlined } from '@ant-design/icons';
import { api } from '../services/api';
import { Reward, RewardRule } from '../types';
import dayjs from 'dayjs';

const { Option } = Select;

const Rewards: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [rules, setRules] = useState<RewardRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [viewingReward, setViewingReward] = useState<Reward | null>(null);
  const [processingReward, setProcessingReward] = useState<Reward | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [paymentForm] = Form.useForm();

  const statusOptions = [
    { value: 'pending', label: '待发放', color: 'warning' },
    { value: 'processing', label: '处理中', color: 'processing' },
    { value: 'paid', label: '已发放', color: 'success' },
    { value: 'cancelled', label: '已取消', color: 'default' },
    { value: 'failed', label: '发放失败', color: 'error' },
  ];

  const paymentMethodOptions = [
    { value: 'salary', label: '工资发放' },
    { value: 'bonus', label: '奖金发放' },
    { value: 'gift_card', label: '礼品卡' },
    { value: 'cash', label: '现金' },
    { value: 'other', label: '其他' },
  ];

  useEffect(() => {
    fetchData();
    fetchRules();
    fetchStats();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchText) params.search = searchText;
      if (filterStatus) params.status = filterStatus;
      
      const response = await api.getRewards(params);
      setRewards(response.results);
    } catch (error) {
      message.error('获取奖励列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchRules = async () => {
    try {
      const response = await api.getActiveRewardRules();
      setRules(response);
    } catch (error) {
      message.error('获取奖励规则失败');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.getRewardStats();
      setStats(response);
    } catch (error) {
      message.error('获取统计数据失败');
    }
  };

  const handleView = async (record: Reward) => {
    try {
      const detail = await api.getReward(record.id);
      setViewingReward(detail);
      setDetailModalVisible(true);
    } catch (error) {
      message.error('获取详情失败');
    }
  };

  const handleProcessPayment = (record: Reward) => {
    setProcessingReward(record);
    paymentForm.resetFields();
    setPaymentModalVisible(true);
  };

  const handlePaymentSubmit = async (values: any) => {
    if (!processingReward) return;
    try {
      await api.processPayment(processingReward.id, values);
      message.success('奖励发放处理成功');
      setPaymentModalVisible(false);
      fetchData();
      fetchStats();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    {
      title: '奖励编号',
      dataIndex: 'reward_code',
      key: 'reward_code',
      render: (text: string) => <span style={{ fontFamily: 'monospace' }}>{text}</span>,
    },
    {
      title: '内推人',
      dataIndex: 'referrer_name',
      key: 'referrer_name',
    },
    {
      title: '候选人',
      dataIndex: 'candidate_name',
      key: 'candidate_name',
    },
    {
      title: '岗位',
      dataIndex: 'position_title',
      key: 'position_title',
    },
    {
      title: '奖励金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (value: string) => (
        <span style={{ color: '#fa8c16', fontWeight: 'bold' }}>
          ¥{value}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const option = statusOptions.find(opt => opt.value === status);
        return <Tag color={option?.color}>{option?.label}</Tag>;
      },
    },
    {
      title: '发放方式',
      dataIndex: 'payment_method_display',
      key: 'payment_method_display',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => dayjs(text).format('MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Reward) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            详情
          </Button>
          {record.status === 'pending' && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleProcessPayment(record)}
            >
              发放
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {stats && (
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="总奖励金额"
                value={stats.total_rewards}
                prefix={<DollarOutlined />}
                precision={2}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="待发放金额"
                value={stats.pending_amount}
                prefix={<GiftOutlined />}
                precision={2}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="已发放笔数"
                value={stats.paid_count}
                suffix={`/ ${stats.total_count}`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="待处理笔数"
                value={stats.pending_count}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Input
              placeholder="搜索奖励编号/内推人/候选人"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={fetchData}
              style={{ width: 300 }}
            />
            <Select
              placeholder="状态筛选"
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: 140 }}
              allowClear
            >
              {statusOptions.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
            <Button type="primary" onClick={fetchData}>
              查询
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={rewards}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="奖励详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {viewingReward && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="奖励编号">{viewingReward.reward_code}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusOptions.find(s => s.value === viewingReward.status)?.color}>
                {viewingReward.status_display}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="内推人">{viewingReward.referral?.referrer_name}</Descriptions.Item>
            <Descriptions.Item label="候选人">{viewingReward.referral?.candidate_name}</Descriptions.Item>
            <Descriptions.Item label="岗位">{viewingReward.referral?.position_title}</Descriptions.Item>
            <Descriptions.Item label="奖励金额">
              <span style={{ color: '#fa8c16', fontWeight: 'bold' }}>¥{viewingReward.amount}</span>
            </Descriptions.Item>
            <Descriptions.Item label="代扣税额">¥{viewingReward.tax_deducted}</Descriptions.Item>
            <Descriptions.Item label="实发金额">
              <span style={{ color: '#52c41a', fontWeight: 'bold' }}>¥{viewingReward.net_amount}</span>
            </Descriptions.Item>
            <Descriptions.Item label="发放方式">{viewingReward.payment_method_display}</Descriptions.Item>
            <Descriptions.Item label="发放日期">
              {viewingReward.payment_date || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="支付参考号">
              {viewingReward.payment_reference || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {dayjs(viewingReward.created_at).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {viewingReward.notes || '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal
        title="处理奖励发放"
        open={paymentModalVisible}
        onOk={() => paymentForm.submit()}
        onCancel={() => setPaymentModalVisible(false)}
      >
        {processingReward && (
          <div style={{ marginBottom: 16 }}>
            <p><strong>内推人:</strong> {processingReward.referrer_name}</p>
            <p><strong>候选人:</strong> {processingReward.candidate_name}</p>
            <p><strong>奖励金额:</strong> ¥{processingReward.amount}</p>
          </div>
        )}
        <Form
          form={paymentForm}
          layout="vertical"
          onFinish={handlePaymentSubmit}
        >
          <Form.Item
            name="status"
            label="发放状态"
            rules={[{ required: true }]}
            initialValue="paid"
          >
            <Select>
              <Option value="paid">已发放</Option>
              <Option value="processing">处理中</Option>
              <Option value="cancelled">取消发放</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="payment_method"
            label="发放方式"
            rules={[{ required: true }]}
            initialValue="salary"
          >
            <Select>
              {paymentMethodOptions.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="payment_date"
            label="发放日期"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="payment_reference"
            label="支付参考号"
          >
            <Input placeholder="如银行流水号等" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="备注"
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Rewards;
