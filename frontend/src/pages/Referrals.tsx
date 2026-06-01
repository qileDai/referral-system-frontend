import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Card, Input, Select, Modal, Form, message, Popconfirm, Steps, Timeline, Descriptions } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { api } from '../services/api';
import { Referral, Position, Referrer, Candidate } from '../types';
import dayjs from 'dayjs';

const { Option } = Select;
const { Step } = Steps;
const { TextArea } = Input;

const Referrals: React.FC = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [referrers, setReferrers] = useState<Referrer[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [viewingReferral, setViewingReferral] = useState<Referral | null>(null);
  const [editingReferral, setEditingReferral] = useState<Referral | null>(null);
  const [statusHistory, setStatusHistory] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [form] = Form.useForm();
  const [statusForm] = Form.useForm();

  const statusOptions = [
    { value: 'submitted', label: '已提交', color: 'blue' },
    { value: 'screening', label: '筛选中', color: 'cyan' },
    { value: 'interviewing', label: '面试中', color: 'processing' },
    { value: 'offer_sent', label: '已发Offer', color: 'warning' },
    { value: 'offer_accepted', label: '已接受Offer', color: 'orange' },
    { value: 'hired', label: '已入职', color: 'success' },
    { value: 'rejected', label: '已拒绝', color: 'error' },
    { value: 'withdrawn', label: '已撤回', color: 'default' },
  ];

  const sourceOptions = [
    { value: 'internal', label: '内部员工' },
    { value: 'alumni', label: '校友推荐' },
    { value: 'partner', label: '合作伙伴' },
    { value: 'other', label: '其他' },
  ];

  useEffect(() => {
    fetchData();
    fetchOptions();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchText) params.search = searchText;
      if (filterStatus) params.status = filterStatus;
      
      const response = await api.getReferrals(params);
      setReferrals(response.results);
    } catch (error) {
      message.error('获取内推列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [positionsRes, referrersRes, candidatesRes] = await Promise.all([
        api.getActivePositions(),
        api.getReferrers({}),
        api.getCandidates({}),
      ]);
      setPositions(positionsRes);
      setReferrers(referrersRes.results);
      setCandidates(candidatesRes.results);
    } catch (error) {
      message.error('获取选项数据失败');
    }
  };

  const handleAdd = () => {
    setEditingReferral(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleView = async (record: Referral) => {
    try {
      const [detail, history] = await Promise.all([
        api.getReferral(record.id),
        api.getReferralHistory(record.id),
      ]);
      setViewingReferral(detail);
      setStatusHistory(history);
      setDetailModalVisible(true);
    } catch (error) {
      message.error('获取详情失败');
    }
  };

  const handleUpdateStatus = (record: Referral) => {
    setEditingReferral(record);
    statusForm.resetFields();
    setStatusModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      await api.createReferral(values);
      message.success('创建成功');
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleStatusSubmit = async (values: any) => {
    if (!editingReferral) return;
    try {
      await api.updateReferralStatus(editingReferral.id, values.status, values.notes);
      message.success('状态更新成功');
      setStatusModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const getStatusStep = (status: string) => {
    const steps = ['submitted', 'screening', 'interviewing', 'offer_sent', 'offer_accepted', 'hired'];
    return steps.indexOf(status);
  };

  const columns = [
    {
      title: '内推编号',
      dataIndex: 'referral_code',
      key: 'referral_code',
      render: (text: string) => <span style={{ fontFamily: 'monospace' }}>{text}</span>,
    },
    {
      title: '候选人',
      key: 'candidate',
      render: (_: any, record: Referral) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.candidate_name}</div>
        </div>
      ),
    },
    {
      title: '推荐岗位',
      key: 'position',
      render: (_: any, record: Referral) => (
        <div>
          <div>{record.position_title}</div>
        </div>
      ),
    },
    {
      title: '内推人',
      dataIndex: 'referrer_name',
      key: 'referrer_name',
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
      title: '来源',
      dataIndex: 'source_display',
      key: 'source_display',
    },
    {
      title: '提交时间',
      dataIndex: 'submitted_at',
      key: 'submitted_at',
      render: (text: string) => dayjs(text).format('MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (_: any, record: Referral) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            详情
          </Button>
          <Button
            type="text"
            icon={<CheckCircleOutlined />}
            onClick={() => handleUpdateStatus(record)}
          >
            更新状态
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Input
              placeholder="搜索内推编号/候选人/内推人"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={fetchData}
              style={{ width: 280 }}
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
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增内推
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={referrals}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="新增内推"
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="candidate"
            label="候选人"
            rules={[{ required: true, message: '请选择候选人' }]}
          >
            <Select
              placeholder="请选择候选人"
              showSearch
              optionFilterProp="children"
            >
              {candidates.map(c => (
                <Option key={c.id} value={c.id}>{c.name} - {c.email}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="position"
            label="推荐岗位"
            rules={[{ required: true, message: '请选择岗位' }]}
          >
            <Select placeholder="请选择岗位">
              {positions.map(p => (
                <Option key={p.id} value={p.id}>{p.title} ({p.department_name})</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="referrer"
            label="内推人"
            rules={[{ required: true, message: '请选择内推人' }]}
          >
            <Select placeholder="请选择内推人">
              {referrers.map(r => (
                <Option key={r.id} value={r.id}>{r.name} ({r.employee_id})</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="source"
            label="推荐来源"
            rules={[{ required: true }]}
            initialValue="internal"
          >
            <Select>
              {sourceOptions.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="relationship"
            label="与候选人关系"
          >
            <Input placeholder="如：前同事、同学、朋友等" />
          </Form.Item>

          <Form.Item
            name="referrer_notes"
            label="内推人备注"
          >
            <TextArea rows={3} placeholder="请输入内推人对候选人的评价或备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="更新状态"
        open={statusModalVisible}
        onOk={() => statusForm.submit()}
        onCancel={() => setStatusModalVisible(false)}
      >
        <Form
          form={statusForm}
          layout="vertical"
          onFinish={handleStatusSubmit}
        >
          <Form.Item
            name="status"
            label="新状态"
            rules={[{ required: true, message: '请选择新状态' }]}
          >
            <Select placeholder="请选择新状态">
              {statusOptions.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="备注"
          >
            <TextArea rows={3} placeholder="请输入状态变更备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="内推详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {viewingReferral && (
          <div>
            <Steps
              current={getStatusStep(viewingReferral.status)}
              size="small"
              style={{ marginBottom: 24 }}
            >
              <Step title="已提交" />
              <Step title="筛选中" />
              <Step title="面试中" />
              <Step title="已发Offer" />
              <Step title="已接受" />
              <Step title="已入职" />
            </Steps>

            <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="内推编号">{viewingReferral.referral_code}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusOptions.find(s => s.value === viewingReferral.status)?.color}>
                  {viewingReferral.status_display}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="候选人">{viewingReferral.candidate_name}</Descriptions.Item>
              <Descriptions.Item label="推荐岗位">{viewingReferral.position_title}</Descriptions.Item>
              <Descriptions.Item label="内推人">{viewingReferral.referrer_name}</Descriptions.Item>
              <Descriptions.Item label="推荐来源">{viewingReferral.source_display}</Descriptions.Item>
              <Descriptions.Item label="关系">{viewingReferral.relationship || '-'}</Descriptions.Item>
              <Descriptions.Item label="提交时间">
                {dayjs(viewingReferral.submitted_at).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
              {viewingReferral.hired_at && (
                <Descriptions.Item label="入职时间">
                  {dayjs(viewingReferral.hired_at).format('YYYY-MM-DD')}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Card title="状态变更历史" size="small">
              <Timeline>
                {statusHistory.map((item, index) => (
                  <Timeline.Item key={index}>
                    <div>
                      <strong>
                        {item.from_status_display 
                          ? `${item.from_status_display} → ${item.to_status_display}`
                          : `创建: ${item.to_status_display}`
                        }
                      </strong>
                      <span style={{ marginLeft: 8, color: '#999', fontSize: 12 }}>
                        {dayjs(item.created_at).format('YYYY-MM-DD HH:mm')}
                      </span>
                    </div>
                    {item.notes && <div style={{ color: '#666' }}>{item.notes}</div>}
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Referrals;
