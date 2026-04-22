import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Select, Button, Table, message, Space, Typography } from 'antd';
import { DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import { sensorAPI, exportAPI } from '../services/api';

const { Option } = Select;
const { Title, Text } = Typography;

const DataExport = () => {
  const [selectedSensor, setSelectedSensor] = useState('SENSOR_KNEE_L');
  const [sensors, setSensors] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSensors();
  }, []);

  useEffect(() => {
    fetchHistoryData();
  }, [selectedSensor]);

  const fetchSensors = async () => {
    try {
      const response = await sensorAPI.getSensors();
      if (response.data.success) {
        setSensors(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch sensors:', error);
    }
  };

  const fetchHistoryData = async () => {
    setLoading(true);
    try {
      const response = await sensorAPI.getSensorHistory(selectedSensor, 200);
      if (response.data.success) {
        setHistoryData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch history data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await exportAPI.exportSensorData(selectedSensor);
      if (response.data.success) {
        const blob = new Blob([response.data.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.data.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        message.success('数据导出成功！');
      }
    } catch (error) {
      console.error('Failed to export data:', error);
      message.error('数据导出失败！');
    }
  };

  const handleExportJSON = () => {
    const jsonData = JSON.stringify(historyData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedSensor}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    message.success('JSON数据导出成功！');
  };

  const columns = [
    {
      title: '时间戳',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text) => new Date(text).toLocaleString('zh-CN'),
      width: 180,
    },
    {
      title: '角度 (°)',
      dataIndex: 'angle',
      key: 'angle',
      sorter: (a, b) => a.angle - b.angle,
    },
    {
      title: '角速度 (°/s)',
      dataIndex: 'angular_velocity',
      key: 'angular_velocity',
      sorter: (a, b) => a.angular_velocity - b.angular_velocity,
    },
    {
      title: '压力 (N)',
      dataIndex: 'pressure',
      key: 'pressure',
      sorter: (a, b) => a.pressure - b.pressure,
    },
    {
      title: '温度 (°C)',
      dataIndex: 'temperature',
      key: 'temperature',
      sorter: (a, b) => a.temperature - b.temperature,
    },
    {
      title: '加速度X (m/s²)',
      dataIndex: ['acceleration', 'x'],
      key: 'acc_x',
    },
    {
      title: '加速度Y (m/s²)',
      dataIndex: ['acceleration', 'y'],
      key: 'acc_y',
    },
    {
      title: '加速度Z (m/s²)',
      dataIndex: ['acceleration', 'z'],
      key: 'acc_z',
    },
  ];

  const summaryData = historyData.length > 0 ? {
    count: historyData.length,
    avgAngle: (historyData.reduce((sum, d) => sum + d.angle, 0) / historyData.length).toFixed(2),
    avgVelocity: (historyData.reduce((sum, d) => sum + d.angular_velocity, 0) / historyData.length).toFixed(2),
    avgPressure: (historyData.reduce((sum, d) => sum + d.pressure, 0) / historyData.length).toFixed(2),
    avgTemp: (historyData.reduce((sum, d) => sum + d.temperature, 0) / historyData.length).toFixed(2),
  } : null;

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Space size="large" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Text strong>选择传感器:</Text>
            <Select
              value={selectedSensor}
              onChange={setSelectedSensor}
              style={{ width: 200 }}
            >
              {sensors.map((sensor) => (
                <Option key={sensor.sensor_id} value={sensor.sensor_id}>
                  {sensor.sensor_id}
                </Option>
              ))}
            </Select>
          </Space>
          <Space>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExportCSV}
            >
              导出CSV
            </Button>
            <Button
              icon={<FileTextOutlined />}
              onClick={handleExportJSON}
            >
              导出JSON
            </Button>
          </Space>
        </Space>
      </Card>

      {summaryData && (
        <Card title="数据摘要" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={8} md={4}>
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary">数据点数</Text>
                <Title level={4} style={{ margin: '8px 0' }}>
                  {summaryData.count}
                </Title>
              </div>
            </Col>
            <Col xs={12} sm={8} md={5}>
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary">平均角度</Text>
                <Title level={4} style={{ margin: '8px 0', color: '#1890ff' }}>
                  {summaryData.avgAngle}°
                </Title>
              </div>
            </Col>
            <Col xs={12} sm={8} md={5}>
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary">平均角速度</Text>
                <Title level={4} style={{ margin: '8px 0', color: '#52c41a' }}>
                  {summaryData.avgVelocity}°/s
                </Title>
              </div>
            </Col>
            <Col xs={12} sm={8} md={5}>
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary">平均压力</Text>
                <Title level={4} style={{ margin: '8px 0', color: '#faad14' }}>
                  {summaryData.avgPressure}N
                </Title>
              </div>
            </Col>
            <Col xs={12} sm={8} md={5}>
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary">平均温度</Text>
                <Title level={4} style={{ margin: '8px 0', color: '#ff7a45' }}>
                  {summaryData.avgTemp}°C
                </Title>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      <Card title="历史数据">
        <Table
          columns={columns}
          dataSource={historyData}
          rowKey={(record) => record.timestamp}
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条数据`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default DataExport;
