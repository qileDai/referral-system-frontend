import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Card, Input, Select, Modal, Form, message, Popconfirm, Statistic, Row, Col } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, TrophyOutlined } from '@ant-design/icons';
import { api } from '../services/api';
import { Referrer, Department } from '../types';

const { Option } = Select;

const Referrers: React.FC = () => {
  const [referrers, setReferrers] = useState<Referrer[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [statsModalVisible, setStatsModalVisible] = useState(false);
  const [editingReferrer, setEditingReferrer] = useState<Referrer | null>(null);
  const [selectedReferrerStats, setSelectedReferrerStats] = useState<any>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
    fetchDepartments();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchText) params.search = searchText;
      
      const response = await api.getReferrers(params);
      setReferrers(response.results);
    } catch (error) {
      message.error('获取内推人列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.getDepartments();
      setDepartments(response.results);
    } catch (error) {
      message.error('获取部门列表失败');
    }
  };

  const handleAdd = () => {
    setEditingReferrer(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Referrer) => {
    setEditingReferrer(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteReferrer(id);
      message.success('删除成功');
      fetchData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleViewStats = async (record: Referrer) => {
    try {
      const stats = await api.getReferrerStats(record.id);
      setSelectedReferrerStats({ ...stats, name: record.name, employee_id: record.employee_id });
      setStatsModalVisible(true);
    } catch (error) {
      message.error('获取统计数据失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingReferrer) {
        await api.updateReferrer(editingReferrer.id, values);
        message.success('更新成功');
      } else {
        await api.createReferrer(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Referrer) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.employee_id}</div>
        </div>
      ),
    },
    {
      title: '部门',
      dataIndex: 'department_name',
      key: 'department_name',
    },
    {
      title: '联系方式',
      key: 'contact',
      render: (_: any, record: Referrer) => (
        <div>
          <div>{record.email}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.phone}</div>
        </div>
      ),
    },
    {
      title: '推荐统计',
      key: 'stats',
      render: (_: any, record: Referrer) => (
        <Space>
          <Tag color="blue">总推荐: {record.total_referrals}</Tag>
          <Tag color="green">成功: {record.successful_referrals}</Tag>
        </Space>
      ),
    },
    {
      title: '转化率',
      key: 'conversion',
      render: (_: any, record: Referrer) => (
        <span style={{ 
          color: record.conversion_rate && record.conversion_rate > 30 ? '#52c41a' : '#fa8c16',
          fontWeight: 'bold'
        }}>
          {record.conversion_rate}%
        </span>
      ),
    },
    {
      title: '总奖励',
      dataIndex: 'total_rewards',
      key: 'total_rewards',
      render: (value: string) => (
        <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
          ¥{value}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? '活跃' : '停用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Referrer) => (
        <Space size="small">
          <Button
            type="text"
            icon={<TrophyOutlined />}
            onClick={() => handleViewStats(record)}
            title="查看统计"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确定删除此内推人吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
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
              placeholder="搜索姓名/工号/邮箱"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={fetchData}
              style={{ width: 250 }}
            />
            <Button type="primary" onClick={fetchData}>
              查询
            </Button>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增内推人
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={referrers}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingReferrer ? '编辑内推人' : '新增内推人'}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => setModalVisible(false)}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="employee_id"
            label="工号"
            rules={[{ required: true, message: '请输入工号' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="电话"
            rules={[{ required: true, message: '请输入电话' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="department"
            label="所属部门"
            rules={[{ required: true, message: '请选择所属部门' }]}
          >
            <Select placeholder="请选择部门">
              {departments.map(dept => (
                <Option key={dept.id} value={dept.id}>{dept.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="is_active"
            label="状态"
            initialValue={true}
          >
            <Select>
              <Option value={true}>活跃</Option>
              <Option value={false}>停用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="内推人统计"
        open={statsModalVisible}
        onCancel={() => setStatsModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedReferrerStats && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h2>{selectedReferrerStats.name}</h2>
              <p style={{ color: '#666' }}>工号: {selectedReferrerStats.employee_id}</p>
            </div>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="总推荐数"
                    value={selectedReferrerStats.total_referrals}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="成功推荐"
                    value={selectedReferrerStats.successful_referrals}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="转化率"
                    value={selectedReferrerStats.conversion_rate}
                    suffix="%"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="总奖励金额"
                    value={selectedReferrerStats.total_rewards}
                    prefix="¥"
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="进行中推荐"
                    value={selectedReferrerStats.pending_referrals}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Referrers;
