import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Progress, Table, Tag, Space } from 'antd';
import {
  ExperimentOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { systemAPI, sensorAPI, analysisAPI } from '../services/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await systemAPI.getDashboardData();
      if (response.data.success) {
        setDashboardData(response.data.data);
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      excellent: '#52c41a',
      good: '#1890ff',
      fair: '#faad14',
      warning: '#ff7a45',
      alert: '#f5222d',
    };
    return colors[status] || '#d9d9d9';
  };

  const getStatusTag = (status) => {
    const tags = {
      excellent: <Tag color="success">优秀</Tag>,
      good: <Tag color="processing">良好</Tag>,
      fair: <Tag color="warning">一般</Tag>,
      warning: <Tag color="warning">警告</Tag>,
      alert: <Tag color="error">异常</Tag>,
      normal: <Tag color="success">正常</Tag>,
    };
    return tags[status] || <Tag>未知</Tag>;
  };

  // 传感器状态表格列
  const columns = [
    {
      title: '传感器ID',
      dataIndex: 'sensor_id',
      key: 'sensor_id',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: '关节类型',
      dataIndex: 'joint_type',
      key: 'joint_type',
      render: (text) => {
        const jointNames = {
          knee: '膝关节',
          elbow: '肘关节',
          shoulder: '肩关节',
          hip: '髋关节',
        };
        return jointNames[text] || text;
      },
    },
    {
      title: '当前角度',
      dataIndex: 'angle',
      key: 'angle',
      render: (angle) => `${angle}°`,
    },
    {
      title: '性能评分',
      key: 'performance',
      render: (_, record) => {
        const analysis = dashboardData?.analyses?.[record.sensor_id];
        if (analysis) {
          return (
            <Space>
              <Progress
                type="circle"
                percent={analysis.overall_score}
                width={50}
                strokeColor={getStatusColor(analysis.overall_status)}
              />
              {getStatusTag(analysis.overall_status)}
            </Space>
          );
        }
        return '-';
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
  ];

  // 角度分布图表配置
  const getAngleDistributionOption = () => {
    if (!dashboardData?.sensors) return {};

    const sensorData = Object.values(dashboardData.sensors);
    const data = sensorData.map((s) => ({
      name: s.sensor_id,
      value: Math.abs(s.angle),
    }));

    return {
      title: {
        text: '关节角度分布',
        left: 'center',
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}°',
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: '{b}\n{c}°',
          },
          data: data,
        },
      ],
    };
  };

  // 性能评分雷达图
  const getPerformanceRadarOption = () => {
    if (!dashboardData?.analyses) return {};

    const analyses = Object.values(dashboardData.analyses);
    if (analyses.length === 0) return {};

    const avgAnalysis = analyses[0];

    return {
      title: {
        text: '传感器性能指标',
        left: 'center',
      },
      tooltip: {},
      radar: {
        indicator: [
          { name: '精度', max: 100 },
          { name: '稳定性', max: 100 },
          { name: '信号质量', max: 100 },
          { name: '响应速度', max: 100 },
          { name: '综合评分', max: 100 },
        ],
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: [
                avgAnalysis.accuracy?.score || 0,
                avgAnalysis.stability?.score || 0,
                avgAnalysis.signal_quality?.score || 0,
                100 - (avgAnalysis.response_time?.average_ms || 10),
                avgAnalysis.overall_score || 0,
              ],
              name: '性能指标',
              areaStyle: {
                color: 'rgba(24, 144, 255, 0.3)',
              },
            },
          ],
        },
      ],
    };
  };

  // 实时数据趋势图
  const getRealTimeTrendOption = () => {
    if (!dashboardData?.sensors) return {};

    const sensorData = Object.values(dashboardData.sensors);
    const categories = sensorData.map((s) => s.sensor_id.split('_').slice(-2).join('_'));
    const angles = sensorData.map((s) => s.angle);
    const velocities = sensorData.map((s) => s.angular_velocity);

    return {
      title: {
        text: '实时数据趋势',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['角度', '角速度'],
        top: 30,
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: {
          rotate: 45,
        },
      },
      yAxis: [
        {
          type: 'value',
          name: '角度 (°)',
        },
        {
          type: 'value',
          name: '角速度 (°/s)',
        },
      ],
      series: [
        {
          name: '角度',
          type: 'bar',
          data: angles,
          itemStyle: {
            color: '#1890ff',
          },
        },
        {
          name: '角速度',
          type: 'line',
          yAxisIndex: 1,
          data: velocities,
          itemStyle: {
            color: '#52c41a',
          },
        },
      ],
    };
  };

  if (loading || !dashboardData) {
    return <div>加载中...</div>;
  }

  const { summary, sensors } = dashboardData;
  const sensorList = Object.values(sensors);

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="传感器总数"
              value={summary.total_sensors}
              prefix={<ExperimentOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃传感器"
              value={summary.active_sensors}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="平均性能"
              value={summary.average_performance}
              suffix="分"
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="数据采集"
              value={summary.data_collection_active ? '运行中' : '已停止'}
              prefix={<WarningOutlined />}
              valueStyle={{
                color: summary.data_collection_active ? '#52c41a' : '#f5222d',
              }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts option={getAngleDistributionOption()} style={{ height: 350 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts option={getPerformanceRadarOption()} style={{ height: 350 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card>
            <ReactECharts option={getRealTimeTrendOption()} style={{ height: 350 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="传感器状态列表">
            <Table
              columns={columns}
              dataSource={sensorList}
              rowKey="sensor_id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
