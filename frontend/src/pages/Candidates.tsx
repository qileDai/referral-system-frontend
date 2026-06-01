import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Card, Input, InputNumber, Select, Modal, Form, message, Popconfirm, Descriptions } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { api } from '../services/api';
import { Candidate } from '../types';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const Candidates: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [viewingCandidate, setViewingCandidate] = useState<Candidate | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const genderOptions = [
    { value: 'male', label: '男' },
    { value: 'female', label: '女' },
    { value: 'other', label: '其他' },
  ];

  const educationOptions = [
    { value: 'high_school', label: '高中' },
    { value: 'associate', label: '大专' },
    { value: 'bachelor', label: '本科' },
    { value: 'master', label: '硕士' },
    { value: 'phd', label: '博士' },
    { value: 'other', label: '其他' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchText) params.search = searchText;
      
      const response = await api.getCandidates(params);
      setCandidates(response.results);
    } catch (error) {
      message.error('获取候选人列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCandidate(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Candidate) => {
    setEditingCandidate(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleView = (record: Candidate) => {
    setViewingCandidate(record);
    setDetailModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteCandidate(id);
      message.success('删除成功');
      fetchData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingCandidate) {
        await api.updateCandidate(editingCandidate.id, values);
        message.success('更新成功');
      } else {
        await api.createCandidate(values);
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
      render: (text: string, record: Candidate) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <Tag color={record.gender === 'male' ? 'blue' : record.gender === 'female' ? 'pink' : 'default'} size="small">
            {record.gender_display}
          </Tag>
        </div>
      ),
    },
    {
      title: '联系方式',
      key: 'contact',
      render: (_: any, record: Candidate) => (
        <div>
          <div>{record.email}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.phone}</div>
        </div>
      ),
    },
    {
      title: '学历',
      dataIndex: 'education_display',
      key: 'education_display',
    },
    {
      title: '工作经验',
      key: 'experience',
      render: (_: any, record: Candidate) => (
        <span>{record.work_experience_years} 年</span>
      ),
    },
    {
      title: '当前公司',
      dataIndex: 'current_company',
      key: 'current_company',
      render: (text: string) => text || '-',
    },
    {
      title: '当前职位',
      dataIndex: 'current_position',
      key: 'current_position',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Candidate) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确定删除此候选人吗？"
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
              placeholder="搜索姓名/邮箱/电话/公司"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={fetchData}
              style={{ width: 300 }}
            />
            <Button type="primary" onClick={fetchData}>
              查询
            </Button>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增候选人
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={candidates}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingCandidate ? '编辑候选人' : '新增候选人'}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => setModalVisible(false)}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input />
          </Form.Item>

          <Space style={{ width: '100%' }}>
            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
              style={{ width: 300 }}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="phone"
              label="电话"
              rules={[{ required: true, message: '请输入电话' }]}
              style={{ width: 200 }}
            >
              <Input />
            </Form.Item>
          </Space>

          <Space style={{ width: '100%' }}>
            <Form.Item
              name="gender"
              label="性别"
              rules={[{ required: true }]}
              style={{ width: 150 }}
            >
              <Select>
                {genderOptions.map(opt => (
                  <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="age"
              label="年龄"
              style={{ width: 150 }}
            >
              <InputNumber min={18} max={70} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="education"
              label="学历"
              rules={[{ required: true }]}
              style={{ width: 150 }}
            >
              <Select>
                {educationOptions.map(opt => (
                  <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                ))}
              </Select>
            </Form.Item>
          </Space>

          <Space style={{ width: '100%' }}>
            <Form.Item
              name="school"
              label="毕业院校"
              style={{ width: 250 }}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="major"
              label="专业"
              style={{ width: 250 }}
            >
              <Input />
            </Form.Item>
          </Space>

          <Form.Item
            name="work_experience_years"
            label="工作年限"
            initialValue={0}
          >
            <InputNumber min={0} max={50} style={{ width: '100%' }} />
          </Form.Item>

          <Space style={{ width: '100%' }}>
            <Form.Item
              name="current_company"
              label="当前公司"
              style={{ width: 250 }}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="current_position"
              label="当前职位"
              style={{ width: 250 }}
            >
              <Input />
            </Form.Item>
          </Space>

          <Form.Item
            name="resume_url"
            label="简历链接"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="notes"
            label="备注"
          >
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="候选人详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {viewingCandidate && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="姓名">{viewingCandidate.name}</Descriptions.Item>
            <Descriptions.Item label="性别">{viewingCandidate.gender_display}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{viewingCandidate.email}</Descriptions.Item>
            <Descriptions.Item label="电话">{viewingCandidate.phone}</Descriptions.Item>
            <Descriptions.Item label="年龄">{viewingCandidate.age || '-'} 岁</Descriptions.Item>
            <Descriptions.Item label="学历">{viewingCandidate.education_display}</Descriptions.Item>
            <Descriptions.Item label="毕业院校">{viewingCandidate.school || '-'}</Descriptions.Item>
            <Descriptions.Item label="专业">{viewingCandidate.major || '-'}</Descriptions.Item>
            <Descriptions.Item label="工作年限">{viewingCandidate.work_experience_years} 年</Descriptions.Item>
            <Descriptions.Item label="当前公司">{viewingCandidate.current_company || '-'}</Descriptions.Item>
            <Descriptions.Item label="当前职位">{viewingCandidate.current_position || '-'}</Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {dayjs(viewingCandidate.created_at).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="简历链接" span={2}>
              {viewingCandidate.resume_url ? (
                <a href={viewingCandidate.resume_url} target="_blank" rel="noopener noreferrer">
                  查看简历
                </a>
              ) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {viewingCandidate.notes || '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default Candidates;
