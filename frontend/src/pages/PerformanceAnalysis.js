import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Select, Descriptions, Progress, Tag, Alert, Divider } from 'antd';
import ReactECharts from 'echarts-for-react';
import { analysisAPI, sensorAPI } from '../services/api';

const { Option } = Select;

const PerformanceAnalysis = () => {
  const [selectedSensor, setSelectedSensor] = useState('SENSOR_KNEE_L');
  const [sensors, setSensors] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    fetchSensors();
  }, []);

  useEffect(() => {
    fetchAnalysisData();
    const interval = setInterval(fetchAnalysisData, 3000);
    return () => clearInterval(interval);
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

  const fetchAnalysisData = async () => {
    try {
      const [analysisRes, statsRes] = await Promise.all([
        analysisAPI.getSensorAnalysis(selectedSensor),
        analysisAPI.getSensorStatistics(selectedSensor),
      ]);

      if (analysisRes.data.success) {
        setAnalysis(analysisRes.data.data);
      }
      if (statsRes.data.success) {
        setStatistics(statsRes.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch analysis data:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      excellent: 'success',
      good: 'processing',
      fair: 'warning',
      stable: 'success',
      moderate: 'warning',
      unstable: 'error',
      normal: 'success',
      warning: 'warning',
      alert: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      excellent: '优秀',
      good: '良好',
      fair: '一般',
      stable: '稳定',
      moderate: '中等',
      unstable: '不稳定',
      normal: '正常',
      warning: '警告',
      alert: '异常',
    };
    return texts[status] || status;
  };

  // 性能指标雷达图
  const getPerformanceRadarOption = () => {
    if (!analysis) return {};

    return {
      title: {
        text: '传感器性能雷达图',
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
        radius: '60%',
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: [
                analysis.accuracy?.score || 0,
                analysis.stability?.score || 0,
                analysis.signal_quality?.score || 0,
                100 - (analysis.response_time?.average_ms || 10),
                analysis.overall_score || 0,
              ],
              name: '性能指标',
              areaStyle: {
                color: 'rgba(24, 144, 255, 0.3)',
              },
              lineStyle: {
                color: '#1890ff',
                width: 2,
              },
            },
          ],
        },
      ],
    };
  };

  // 统计数据分布图
  const getStatisticsDistributionOption = () => {
    if (!statistics) return {};

    const data = [
      { name: '角度均值', value: statistics.angle.mean },
      { name: '角度标准差', value: statistics.angle.std },
      { name: '角速度均值', value: Math.abs(statistics.angular_velocity.mean) },
      { name: '压力均值', value: statistics.pressure.mean },
    ];

    return {
      title: {
        text: '统计数据分布',
        left: 'center',
      },
      tooltip: {
        trigger: 'item',
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
            formatter: '{b}: {c}',
          },
          data: data,
        },
      ],
    };
  };

  // 数据范围柱状图
  const getDataRangeOption = () => {
    if (!statistics) return {};

    return {
      title: {
        text: '数据范围分析',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      legend: {
        data: ['最小值', '平均值', '最大值'],
        top: 30,
      },
      xAxis: {
        type: 'category',
        data: ['角度', '角速度', '压力', '温度'],
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '最小值',
          type: 'bar',
          data: [
            statistics.angle.min,
            statistics.angular_velocity.min,
            statistics.pressure.min,
            statistics.temperature.min,
          ],
          itemStyle: { color: '#91cc75' },
        },
        {
          name: '平均值',
          type: 'bar',
          data: [
            statistics.angle.mean,
            statistics.angular_velocity.mean,
            statistics.pressure.mean,
            statistics.temperature.mean,
          ],
          itemStyle: { color: '#5470c6' },
        },
        {
          name: '最大值',
          type: 'bar',
          data: [
            statistics.angle.max,
            statistics.angular_velocity.max,
            statistics.pressure.max,
            statistics.temperature.max,
          ],
          itemStyle: { color: '#ee6666' },
        },
      ],
    };
  };

  if (!analysis || !statistics) {
    return <div>加载中...</div>;
  }

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
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
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="综合性能评估">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Progress
                type="circle"
                percent={analysis.overall_score}
                width={150}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
              <div style={{ marginTop: 16 }}>
                <Tag color={getStatusColor(analysis.overall_status)} style={{ fontSize: 16 }}>
                  {getStatusText(analysis.overall_status)}
                </Tag>
              </div>
            </div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="传感器ID">{analysis.sensor_id}</Descriptions.Item>
              <Descriptions.Item label="综合评分">{analysis.overall_score}</Descriptions.Item>
              <Descriptions.Item label="数据点数">{analysis.data_points}</Descriptions.Item>
              <Descriptions.Item label="分析时间">
                {new Date(analysis.timestamp).toLocaleString('zh-CN')}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="详细性能指标">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="精度评分">
                <Progress
                  percent={analysis.accuracy?.score || 0}
                  size="small"
                  status={analysis.accuracy?.status === 'excellent' ? 'success' : 'normal'}
                />
                <div style={{ marginTop: 4 }}>
                  标准差: {analysis.accuracy?.std_deviation}°
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="稳定性">
                <Progress
                  percent={analysis.stability?.score || 0}
                  size="small"
                  status={analysis.stability?.status === 'stable' ? 'success' : 'normal'}
                />
                <div style={{ marginTop: 4 }}>
                  方差: {analysis.stability?.variance}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="信号质量">
                <Progress
                  percent={analysis.signal_quality?.score || 0}
                  size="small"
                  status={analysis.signal_quality?.status === 'excellent' ? 'success' : 'normal'}
                />
                <div style={{ marginTop: 4 }}>
                  信噪比: {analysis.signal_quality?.snr_db} dB
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="响应时间">
                <Tag color={getStatusColor(analysis.response_time?.status)}>
                  {analysis.response_time?.average_ms} ms
                </Tag>
                <div style={{ marginTop: 4 }}>
                  范围: {analysis.response_time?.min_ms} - {analysis.response_time?.max_ms} ms
                </div>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {analysis.anomalies && analysis.anomalies.count > 0 && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <Alert
              message="异常检测"
              description={`检测到 ${analysis.anomalies.count} 个异常数据点`}
              type={analysis.anomalies.status === 'alert' ? 'error' : 'warning'}
              showIcon
            />
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts option={getPerformanceRadarOption()} style={{ height: 350 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts option={getStatisticsDistributionOption()} style={{ height: 350 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card>
            <ReactECharts option={getDataRangeOption()} style={{ height: 350 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="统计数据详情">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Descriptions title="角度统计" column={1} bordered size="small">
                  <Descriptions.Item label="平均值">{statistics.angle.mean}°</Descriptions.Item>
                  <Descriptions.Item label="标准差">{statistics.angle.std}°</Descriptions.Item>
                  <Descriptions.Item label="最小值">{statistics.angle.min}°</Descriptions.Item>
                  <Descriptions.Item label="最大值">{statistics.angle.max}°</Descriptions.Item>
                  <Descriptions.Item label="中位数">{statistics.angle.median}°</Descriptions.Item>
                </Descriptions>
              </Col>
              <Col xs={24} md={12}>
                <Descriptions title="角速度统计" column={1} bordered size="small">
                  <Descriptions.Item label="平均值">
                    {statistics.angular_velocity.mean}°/s
                  </Descriptions.Item>
                  <Descriptions.Item label="标准差">
                    {statistics.angular_velocity.std}°/s
                  </Descriptions.Item>
                  <Descriptions.Item label="最小值">
                    {statistics.angular_velocity.min}°/s
                  </Descriptions.Item>
                  <Descriptions.Item label="最大值">
                    {statistics.angular_velocity.max}°/s
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PerformanceAnalysis;
