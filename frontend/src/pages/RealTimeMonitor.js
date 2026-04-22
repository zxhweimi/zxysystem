import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Select, Switch, Space, Typography, Divider } from 'antd';
import ReactECharts from 'echarts-for-react';
import { sensorAPI } from '../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

const RealTimeMonitor = () => {
  const [selectedSensor, setSelectedSensor] = useState('SENSOR_KNEE_L');
  const [sensors, setSensors] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [historyData, setHistoryData] = useState([]);
  const maxDataPoints = 100;

  useEffect(() => {
    fetchSensors();
  }, []);

  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(fetchSensorData, 100);
      return () => clearInterval(interval);
    }
  }, [selectedSensor, isMonitoring]);

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

  const fetchSensorData = async () => {
    try {
      const response = await sensorAPI.getSensorData(selectedSensor);
      if (response.data.success) {
        const data = response.data.data;
        setHistoryData((prev) => {
          const newData = [...prev, data];
          return newData.slice(-maxDataPoints);
        });
      }
    } catch (error) {
      console.error('Failed to fetch sensor data:', error);
    }
  };

  // 角度实时曲线
  const getAngleChartOption = () => {
    const times = historyData.map((d, i) => i);
    const angles = historyData.map((d) => d.angle);

    return {
      title: {
        text: '关节角度实时曲线',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          const data = params[0];
          return `时间: ${data.name}<br/>角度: ${data.value}°`;
        },
      },
      xAxis: {
        type: 'category',
        data: times,
        name: '时间点',
      },
      yAxis: {
        type: 'value',
        name: '角度 (°)',
      },
      series: [
        {
          data: angles,
          type: 'line',
          smooth: true,
          itemStyle: {
            color: '#1890ff',
          },
          areaStyle: {
            color: 'rgba(24, 144, 255, 0.2)',
          },
        },
      ],
      grid: {
        left: '10%',
        right: '5%',
        bottom: '15%',
      },
    };
  };

  // 角速度曲线
  const getVelocityChartOption = () => {
    const times = historyData.map((d, i) => i);
    const velocities = historyData.map((d) => d.angular_velocity);

    return {
      title: {
        text: '角速度实时曲线',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          const data = params[0];
          return `时间: ${data.name}<br/>角速度: ${data.value}°/s`;
        },
      },
      xAxis: {
        type: 'category',
        data: times,
        name: '时间点',
      },
      yAxis: {
        type: 'value',
        name: '角速度 (°/s)',
      },
      series: [
        {
          data: velocities,
          type: 'line',
          smooth: true,
          itemStyle: {
            color: '#52c41a',
          },
        },
      ],
      grid: {
        left: '10%',
        right: '5%',
        bottom: '15%',
      },
    };
  };

  // 加速度三轴曲线
  const getAccelerationChartOption = () => {
    const times = historyData.map((d, i) => i);
    const accX = historyData.map((d) => d.acceleration?.x || 0);
    const accY = historyData.map((d) => d.acceleration?.y || 0);
    const accZ = historyData.map((d) => d.acceleration?.z || 0);

    return {
      title: {
        text: '三轴加速度',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['X轴', 'Y轴', 'Z轴'],
        top: 30,
      },
      xAxis: {
        type: 'category',
        data: times,
        name: '时间点',
      },
      yAxis: {
        type: 'value',
        name: '加速度 (m/s²)',
      },
      series: [
        {
          name: 'X轴',
          data: accX,
          type: 'line',
          smooth: true,
          itemStyle: { color: '#ff4d4f' },
        },
        {
          name: 'Y轴',
          data: accY,
          type: 'line',
          smooth: true,
          itemStyle: { color: '#1890ff' },
        },
        {
          name: 'Z轴',
          data: accZ,
          type: 'line',
          smooth: true,
          itemStyle: { color: '#52c41a' },
        },
      ],
      grid: {
        left: '10%',
        right: '5%',
        bottom: '15%',
      },
    };
  };

  // 压力和温度曲线
  const getPressureTempChartOption = () => {
    const times = historyData.map((d, i) => i);
    const pressures = historyData.map((d) => d.pressure);
    const temperatures = historyData.map((d) => d.temperature);

    return {
      title: {
        text: '压力与温度监测',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['压力', '温度'],
        top: 30,
      },
      xAxis: {
        type: 'category',
        data: times,
        name: '时间点',
      },
      yAxis: [
        {
          type: 'value',
          name: '压力 (N)',
          position: 'left',
        },
        {
          type: 'value',
          name: '温度 (°C)',
          position: 'right',
          min: 35,
          max: 38,
        },
      ],
      series: [
        {
          name: '压力',
          data: pressures,
          type: 'line',
          smooth: true,
          itemStyle: { color: '#faad14' },
        },
        {
          name: '温度',
          data: temperatures,
          type: 'line',
          smooth: true,
          yAxisIndex: 1,
          itemStyle: { color: '#ff7a45' },
        },
      ],
      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%',
      },
    };
  };

  const latestData = historyData[historyData.length - 1];

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
            <Text strong>实时监测:</Text>
            <Switch checked={isMonitoring} onChange={setIsMonitoring} />
          </Space>
        </Space>
      </Card>

      {latestData && (
        <Card title="当前数据" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={8} md={6}>
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary">角度</Text>
                <Title level={3} style={{ margin: '8px 0', color: '#1890ff' }}>
                  {latestData.angle}°
                </Title>
              </div>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary">角速度</Text>
                <Title level={3} style={{ margin: '8px 0', color: '#52c41a' }}>
                  {latestData.angular_velocity}°/s
                </Title>
              </div>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary">压力</Text>
                <Title level={3} style={{ margin: '8px 0', color: '#faad14' }}>
                  {latestData.pressure}N
                </Title>
              </div>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary">温度</Text>
                <Title level={3} style={{ margin: '8px 0', color: '#ff7a45' }}>
                  {latestData.temperature}°C
                </Title>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts option={getAngleChartOption()} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts option={getVelocityChartOption()} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts option={getAccelerationChartOption()} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts option={getPressureTempChartOption()} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RealTimeMonitor;
