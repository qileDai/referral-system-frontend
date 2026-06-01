import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Card, Input, Select, Modal, Form, InputNumber, message, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { api } from '../services/api';
import { Position, Department } from '../types';

const { Option } = Select;
const { TextArea } = Input;

const Positions: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [form] = Form.useForm();

  const employmentTypes = [
    { value: 'full_time', label: '全职' },
    { value: 'part_time', label: '兼职' },
    { value: 'intern', label: '实习' },
    { value: 'contract', label: '合同制' },
  ];

  const statusOptions = [
    { value: 'open', label: '开放', color: 'success' },
    { value: 'paused', label: '暂停', color: 'warning' },
    { value: 'closed', label: '已关闭', color: 'default' },
    { value: 'filled', label: '已招满', color: 'error' },
  ];

  useEffect(() => {
    fetchData();
    fetchDepartments();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchText) params.search = searchText;
      if (filterStatus) params.status = filterStatus;
      
      const response = await api.getPositions(params);
      setPositions(response.results);
    } catch (error) {
      message.error('获取岗位列表失败');
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
    setEditingPosition(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Position) => {
    setEditingPosition(record);
    form.setFieldsValue({
      ...record,
      min_salary: record.min_salary ? parseFloat(record.min_salary) : undefined,
      max_salary: record.max_salary ? parseFloat(record.max_salary) : undefined,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deletePosition(id);
      message.success('删除成功');
      fetchData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        min_salary: values.min_salary?.toString(),
        max_salary: values.max_salary?.toString(),
      };
      
      if (editingPosition) {
        await api.updatePosition(editingPosition.id, data);
        message.success('更新成功');
      } else {
        await api.createPosition(data);
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
      title: '岗位名称',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Position) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.code}</div>
        </div>
      ),
    },
    {
      title: '部门',
      dataIndex: 'department_name',
      key: 'department_name',
    },
    {
      title: '工作类型',
      dataIndex: 'employment_type_display',
      key: 'employment_type_display',
    },
    {
      title: '薪资范围',
      key: 'salary',
      render: (_: any, record: Position) => (
        <span>
          {record.min_salary && record.max_salary
            ? `¥${record.min_salary} - ¥${record.max_salary}`
            : '面议'}
        </span>
      ),
    },
    {
      title: '招聘人数',
      dataIndex: 'headcount',
      key: 'headcount',
    },
    {
      title: '当前申请',
      dataIndex: 'current_applications',
      key: 'current_applications',
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
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Position) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确定删除此岗位吗？"
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
              placeholder="搜索岗位名称"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={fetchData}
              style={{ width: 200 }}
            />
            <Select
              placeholder="状态筛选"
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: 120 }}
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
            新增岗位
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={positions}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingPosition ? '编辑岗位' : '新增岗位'}
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
            name="title"
            label="岗位名称"
            rules={[{ required: true, message: '请输入岗位名称' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="code"
            label="岗位编码"
            rules={[{ required: true, message: '请输入岗位编码' }]}
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
            name="employment_type"
            label="工作类型"
            rules={[{ required: true }]}
            initialValue="full_time"
          >
            <Select>
              {employmentTypes.map(type => (
                <Option key={type.value} value={type.value}>{type.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="location"
            label="工作地点"
            rules={[{ required: true, message: '请输入工作地点' }]}
          >
            <Input />
          </Form.Item>

          <Space style={{ width: '100%' }}>
            <Form.Item
              name="min_salary"
              label="最低薪资"
            >
              <InputNumber min={0} style={{ width: 150 }} />
            </Form.Item>
            <Form.Item
              name="max_salary"
              label="最高薪资"
            >
              <InputNumber min={0} style={{ width: 150 }} />
            </Form.Item>
            <Form.Item
              name="headcount"
              label="招聘人数"
              rules={[{ required: true }]}
              initialValue={1}
            >
              <InputNumber min={1} style={{ width: 100 }} />
            </Form.Item>
          </Space>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true }]}
            initialValue="open"
          >
            <Select>
              {statusOptions.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="岗位描述"
          >
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="requirements"
            label="任职要求"
          >
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="responsibilities"
            label="工作职责"
          >
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Positions;
